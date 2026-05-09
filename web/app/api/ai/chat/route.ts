import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { aiChat, aiEmbed } from '@/lib/openai'
import { formatMoney } from '@/lib/currency'
import {
  BUYER_COUNTRY_COOKIE,
  BUYER_CURRENCY_COOKIE,
  resolveBuyerContext,
} from '@/lib/buyerContext'
import { getExchangeRates, ExchangeRates } from '@/lib/exchangeRates'
import { api } from '@/lib/convexApi'

const CHAT_WINDOW_MS = 60_000
const CHAT_MAX_REQUESTS = 20
const MESSAGE_MAX_CHARS = 500
const HISTORY_MAX_TURNS = 6

type RateEntry = {
  count: number
  resetAt: number
}

const rateBuckets = new Map<string, RateEntry>()

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
  return new ConvexHttpClient(url)
}

function getClientKey(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function isRateLimited(req: NextRequest) {
  const now = Date.now()
  const key = getClientKey(req)
  const current = rateBuckets.get(key)

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + CHAT_WINDOW_MS })
    return false
  }

  if (current.count >= CHAT_MAX_REQUESTS) {
    return true
  }

  current.count += 1
  rateBuckets.set(key, current)
  return false
}

function sanitizeHistory(history: ChatHistoryMessage[]) {
  return history
    .filter((item) => item?.role === 'user' || item?.role === 'assistant')
    .slice(-HISTORY_MAX_TURNS)
    .map((item) => ({
      role: item.role,
      content: String(item.content ?? '').trim().slice(0, MESSAGE_MAX_CHARS),
    }))
    .filter((item) => item.content)
}

const INTENT_SYSTEM = `You are an intent parser for a shopping assistant. Return ONLY valid JSON, no markdown.

Schema: {"type":"search"|"buy"|"compare"|"clarify","attributes":{"keywords":"string","budget_max":null|number}}

Examples:
"leather bag under $200" -> {"type":"search","attributes":{"keywords":"leather bag","budget_max":200}}
"hello" -> {"type":"clarify","attributes":{"keywords":"","budget_max":null}}`

const FORMAT_SYSTEM = `You are a shopping assistant for From, a marketplace for independent stores.
Write 2-3 natural sentences. Mention 1-2 product names. End with a brief question to narrow down.
No bullet points. No markdown.`

type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type SearchProduct = {
  id: string
  title: string
  vendor: string
  price: number
  currency?: string
  base_currency?: string
}

function getBuyerCurrency(req: NextRequest) {
  const buyerContext = resolveBuyerContext({
    countryHeader: req.headers.get('x-vercel-ip-country'),
    acceptLanguage: req.headers.get('accept-language'),
    cookieCountry: req.cookies.get(BUYER_COUNTRY_COOKIE)?.value,
    cookieCurrency: req.cookies.get(BUYER_CURRENCY_COOKIE)?.value,
  })
  return buyerContext.currency
}

function normalizeProductsForBuyer(products: SearchProduct[], buyerCurrency: string) {
  return products.map((product) => ({
    ...product,
    base_currency: product.base_currency ?? product.currency ?? 'USD',
    currency: buyerCurrency,
  }))
}

async function parseIntent(message: string, history: ChatHistoryMessage[]) {
  try {
    const raw = await aiChat(
      [...history.slice(-4), { role: 'user', content: message }],
      INTENT_SYSTEM,
      { max_tokens: 120, temperature: 0.1 }
    )
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no JSON')
    const parsed = JSON.parse(match[0])
    return {
      type: (parsed.type as string) ?? 'search',
      keywords: (parsed.attributes?.keywords as string) || message,
      budgetMax: (parsed.attributes?.budget_max as number | null) ?? null,
    }
  } catch {
    return { type: 'search', keywords: message, budgetMax: null }
  }
}

async function formatResponse(products: SearchProduct[], query: string, rates: ExchangeRates) {
  if (!products.length) {
    return "I couldn't find matching products right now. Try describing what you're looking for differently: material, use case, or style?"
  }

  try {
    const summary = products.slice(0, 3).map((product) => ({
      name: product.title,
      store: product.vendor,
      price: formatMoney(product.price, product.currency, product.base_currency, rates),
    }))
    return await aiChat(
      [{ role: 'user', content: `Shopper searched: "${query}"\nFound: ${JSON.stringify(summary)}\nWrite a helpful response.` }],
      FORMAT_SYSTEM,
      { max_tokens: 120, temperature: 0.5 }
    )
  } catch {
    return `Found ${products.length} options from independent stores. Which style or price range interests you most?`
  }
}

export async function POST(req: NextRequest) {
  if (isRateLimited(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { message, history } = await req.json()
    if (!message) throw new Error('No message provided')

    const cleanHistory = sanitizeHistory(history || [])
    const intent = await parseIntent(message, cleanHistory)
    const buyerCurrency = getBuyerCurrency(req)
    const rates = await getExchangeRates()

    const convex = getConvex()
    let products: SearchProduct[] = []

    if (intent.type === 'search') {
      const embedding = await aiEmbed(intent.keywords)
      const results = await convex.query(api.products.searchByEmbedding, {
        embedding,
        limit: 8,
      })
      products = normalizeProductsForBuyer(results as any, buyerCurrency)

      if (intent.budgetMax !== null) {
        products = products.filter((p) => p.price <= (intent.budgetMax ?? Infinity))
      }
    }

    const text = await formatResponse(products, intent.keywords, rates)

    return NextResponse.json({
      text,
      products,
      intent,
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
