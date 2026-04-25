'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validations
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Registration successful — redirect to signin
      router.push('/signin?registered=true')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafaf8',
      fontFamily: "'Outfit', sans-serif",
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        border: '1px solid #e8e6e1',
        borderRadius: 16,
        padding: '40px 32px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28,
            fontWeight: 400,
            color: '#1a1a1a',
            margin: '0 0 6px',
          }}>
            Create Account
          </h1>
          <p style={{
            fontSize: 13,
            color: '#888',
            fontWeight: 300,
            margin: 0,
          }}>
            Join Fluid Orbit
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff0f0',
            border: '1px solid #ffd4d4',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: 13,
            color: '#d32f2f',
            fontWeight: 300,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 400,
              color: '#666',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              style={{
                width: '100%',
                height: 44,
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: '0 14px',
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 300,
                color: '#1a1a1a',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3d5a47'}
              onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 400,
              color: '#666',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                height: 44,
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: '0 14px',
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 300,
                color: '#1a1a1a',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3d5a47'}
              onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 400,
              color: '#666',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width: '100%',
                  height: 44,
                  border: '1px solid #ddd',
                  borderRadius: 10,
                  padding: '0 44px 0 14px',
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 300,
                  color: '#1a1a1a',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#3d5a47'}
                onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  color: '#999',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 400,
              color: '#666',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={{
                  width: '100%',
                  height: 44,
                  border: '1px solid #ddd',
                  borderRadius: 10,
                  padding: '0 44px 0 14px',
                  fontSize: 14,
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 300,
                  color: '#1a1a1a',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#3d5a47'}
                onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  color: '#999',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 46,
              border: 'none',
              borderRadius: 10,
              background: '#3d5a47',
              color: '#fff',
              fontSize: 14,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 400,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4a6b54' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#3d5a47' }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Link to signin */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 13,
          color: '#888',
          fontWeight: 300,
        }}>
          Already have an account?{' '}
          <a
            href="/signin"
            style={{
              color: '#3d5a47',
              textDecoration: 'none',
              fontWeight: 400,
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
