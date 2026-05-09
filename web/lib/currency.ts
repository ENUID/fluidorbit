import { ExchangeRates } from './exchangeRates';

const CURRENCY_LOCALES: Record<string, string> = {
  USD: 'en-US',
  AED: 'en-AE',
  AUD: 'en-AU',
  CAD: 'en-CA',
  CHF: 'de-CH',
  CNY: 'zh-CN',
  EUR: 'de-DE',
  GBP: 'en-GB',
  HKD: 'zh-HK',
  INR: 'en-IN',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  MXN: 'es-MX',
  NOK: 'nb-NO',
  NZD: 'en-NZ',
  SAR: 'ar-SA',
  SEK: 'sv-SE',
  SGD: 'en-SG',
  VND: 'vi-VN',
}

function normalizeCurrencyCode(code?: string | null) {
  return String(code ?? '').trim().toUpperCase()
}

export function isSupportedCurrency(code: string | null, rates?: ExchangeRates) {
  const normalized = normalizeCurrencyCode(code)
  if (!normalized) return false
  if (rates) return Boolean(rates[normalized])
  return normalized.length === 3
}

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: string | null | undefined,
  toCurrency: string | null | undefined,
  rates?: ExchangeRates,
) {
  const safeAmount = Number(amount)
  if (!Number.isFinite(safeAmount)) return 0

  const from = normalizeCurrencyCode(fromCurrency) || 'USD'
  const to = normalizeCurrencyCode(toCurrency) || from

  if (from === to) return safeAmount
  if (!rates) return safeAmount

  const fromRate = rates[from]
  const toRate = rates[to]
  
  if (!fromRate || !toRate) return safeAmount

  return (safeAmount / fromRate) * toRate
}

export function formatMoney(
  amount: number,
  currency: string | null | undefined,
  baseCurrency: string | null | undefined,
  rates?: ExchangeRates,
) {
  const normalizedCurrency = normalizeCurrencyCode(currency) || 'USD'
  const normalizedBaseCurrency = normalizeCurrencyCode(baseCurrency) || normalizedCurrency
  
  const convertedAmount = convertCurrencyAmount(amount, normalizedBaseCurrency, normalizedCurrency, rates)
  const locale = CURRENCY_LOCALES[normalizedCurrency] || 'en-US'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: normalizedCurrency === 'VND' ? 0 : 2,
    }).format(convertedAmount)
  } catch {
    return `${normalizedCurrency} ${convertedAmount.toFixed(normalizedCurrency === 'VND' ? 0 : 2)}`
  }
}
