'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signIn, signInWithGitHub } from '@/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  function handleGitHubSignIn() {
    startTransition(async () => {
      const result = await signInWithGitHub()
      if (result?.error) {
        setError(result.error)
      }
    })
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
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            className="input-field"
            placeholder="you@example.com"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            className="input-field"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            minLength={6}
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
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>


      <div className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link href="/signup">Sign up</Link>
      </div>
    </div>
  )
}
