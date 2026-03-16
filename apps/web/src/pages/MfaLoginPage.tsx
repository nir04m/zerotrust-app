import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginWithMfa } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

type MfaLocationState = {
  mfaToken?: string
  email?: string
}

export function MfaLoginPage() {
  const { setTokens } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as MfaLocationState | null
  const mfaToken = state?.mfaToken
  const email = state?.email

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!mfaToken) {
      setError('This MFA session is no longer valid. Please sign in again.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const data = await loginWithMfa({ mfaToken, code })
      setTokens(data.accessToken, data.refreshToken)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('The verification code is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/75 p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
          Multi-factor authentication
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Verify your sign-in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Enter the 6-digit code from your authenticator app for{' '}
          <span className="font-medium text-slate-200">{email ?? 'your account'}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-200">
              Authenticator code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-center text-lg tracking-[0.35em] text-white placeholder:text-slate-500 focus:border-indigo-400"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              aria-describedby={error ? 'mfa-error' : undefined}
            />
          </div>

          {error ? (
            <div
              id="mfa-error"
              role="alert"
              className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify and continue'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Need to restart?{' '}
          <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
            Return to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}