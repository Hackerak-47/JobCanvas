'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { level: 1, label: 'Weak' }
  if (score <= 3) return { level: 2, label: 'Medium' }
  return { level: 3, label: 'Strong' }
}

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const strength = getPasswordStrength(password)
  const strengthClass = strength.level === 1 ? 'weak' : strength.level === 2 ? 'medium' : 'strong'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const fullName = formData.get('fullName') as string

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsPending(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (error) {
        setError(error.message)
        setIsPending(false)
        return
      }

      router.push('/dashboard/board')
      router.refresh()
    } catch (err: any) {
      setError(`Crash: ${err.message}`)
      setIsPending(false)
    }
  }

  async function handleGitHubSignIn() {
    setIsPending(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
    setIsPending(false)
  }

  return (
    <div className="animate-fade-in">
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="auth-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}

        <div className="auth-form-group">
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            name="fullName"
            type="text"
            className="input-field"
            placeholder="John Doe"
            required
            autoComplete="name"
            autoFocus
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            className="input-field"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <>
              <div className="password-strength">
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={`password-strength-bar${bar <= strength.level ? ` active ${strengthClass}` : ''}`}
                  />
                ))}
              </div>
              <span className="password-strength-label">{strength.label}</span>
            </>
          )}
        </div>

        <div className="auth-form-group">
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn-primary btn-lg"
          disabled={isPending}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {isPending ? (
            <>
              <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>


      <div className="auth-footer">
        Already have an account?{' '}
        <Link href="/login">Sign in</Link>
      </div>
    </div>
  )
}
