import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'

export function RegisterPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function validateForm() {
    if (!email.trim()) {
      return 'Email is required.'
    }

    if (!password) {
      return 'Password is required.'
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }

    return ''
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const response = await registerUser({
        email: email.trim(),
        password,
      })

      setSuccess(response.message || 'Account created successfully.')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      window.setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err: unknown) {
      setError('Registration failed. The account may already exist or the input is invalid.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[56%_44%]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/14 via-slate-950 to-slate-950" />
          <div className="absolute -left-8 top-8 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between px-14 py-14 xl:px-20 xl:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">
                Account setup
              </p>
              <h1 className="mt-8 text-5xl font-semibold leading-[1.08] text-white xl:text-6xl">
                Create a secure vault account for protected identity workflows.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300">
                Start with a private, security-focused workspace designed for encrypted document
                storage, MFA, and complete audit visibility.
              </p>
            </div>

            <div className="grid max-w-3xl gap-5 md:grid-cols-2">
              <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
                <h2 className="text-base font-semibold text-white">Privacy-first access</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Use strong credentials and multi-factor authentication to protect sensitive
                  identity records.
                </p>
              </article>

              <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
                <h2 className="text-base font-semibold text-white">Secure by design</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Your vault architecture already supports encrypted storage, access control, and
                  auditable activity history.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300 lg:hidden">
              Account setup
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Create your account</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Set up your secure workspace and prepare your vault for authenticated access.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 text-base text-white focus:border-indigo-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  aria-describedby={error ? 'register-error' : undefined}
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
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 text-base text-white focus:border-indigo-400"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  aria-describedby="password-help register-error"
                />
                <p id="password-help" className="mt-2 text-xs text-slate-500">
                  Use at least 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 text-base text-white focus:border-indigo-400"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                />
              </div>

              {error ? (
                <div
                  id="register-error"
                  role="alert"
                  className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  role="status"
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                >
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-white px-5 py-4 text-base font-medium text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>Already have an account?</span>
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