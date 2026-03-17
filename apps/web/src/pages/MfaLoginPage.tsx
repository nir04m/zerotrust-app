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
    <main className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[56%_44%]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <div className="absolute inset-0 bg-linear-to-br from-sky-500/12 via-slate-950 to-slate-950" />
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex w-full flex-col justify-center px-14 py-14 xl:px-20 xl:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">
              Multi-factor authentication
            </p>
            <h1 className="mt-8 max-w-2xl text-5xl font-semibold leading-[1.08] text-white xl:text-6xl">
              Confirm your secure sign-in before entering the vault.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
              Verification codes add a second protection layer for access to encrypted records and
              sensitive account actions.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300 lg:hidden">
              MFA verification
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Verify your sign-in</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Enter the 6-digit code for{' '}
              <span className="font-medium text-slate-200">{email ?? 'your account'}</span>.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 text-center text-2xl tracking-[0.35em] text-white focus:border-indigo-400"
                  placeholder="000000"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
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
                className="w-full rounded-2xl bg-white px-5 py-4 text-base font-medium text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify and continue'}
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>Need to restart?</span>
              <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
                Return to sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}