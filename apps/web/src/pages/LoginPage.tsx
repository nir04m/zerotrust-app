import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const { setTokens } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser({ email, password })

      if (data.mfaRequired && data.mfaToken) {
        navigate('/mfa-login', {
          state: {
            mfaToken: data.mfaToken,
            email,
          },
        })
        return
      }

      if (data.accessToken && data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken)
        const state = location.state as LoginLocationState | null
        const target = state?.from?.pathname ?? '/dashboard'
        navigate(target, { replace: true })
      }
    } catch {
      setError('Sign-in failed. Check your credentials or try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden border-r border-white/10 bg-linear-to-br from-indigo-600/20 via-slate-950 to-slate-950 p-10 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
            ZeroTrust Vault
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight text-white">
            Access your secure identity vault with confidence.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Built for privacy-first document protection, multi-factor authentication, encrypted
            storage, and full audit visibility.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-semibold text-white">Encrypted storage</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sensitive files are stored with encryption and tracked through strict ownership
                controls.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-semibold text-white">Strong authentication</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Access tokens, refresh token rotation, and MFA verification protect each account
                session.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300 lg:hidden">
              ZeroTrust Vault
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Sign in</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Enter your account credentials to continue to your secure workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>

              {error ? (
                <div
                  id="login-error"
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
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-400">
              Need an account?{' '}
              <Link to="/register" className="font-medium text-indigo-300 hover:text-indigo-200">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}