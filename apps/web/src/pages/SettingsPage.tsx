import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { disableMfa, setupMfa, verifyMfa } from '../api/mfa'

export function SettingsPage() {
  const [setupLoading, setSetupLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [disableLoading, setDisableLoading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [qrCodeImageDataUrl, setQrCodeImageDataUrl] = useState('')
  const [secret, setSecret] = useState('')

  const [verifyCode, setVerifyCode] = useState('')
  const [disableCode, setDisableCode] = useState('')

  async function handleStartMfaSetup() {
    setError('')
    setSuccess('')
    setSetupLoading(true)

    try {
      const data = await setupMfa()

      const rawQr =
        data.qrCodeImageUri ||
        data.qrCodeImageDataUrl ||
        data.qrCodeBase64 ||
        data.qrCode ||
        ''

      if (!rawQr) {
        throw new Error('QR code was not returned by the server.')
      }

      const qrValue = rawQr.startsWith('data:image')
        ? rawQr
        : `data:image/png;base64,${rawQr}`

      setQrCodeImageDataUrl(qrValue)
      setSecret(data.secret || '')
      setSuccess('MFA setup started. Scan the QR code and verify with your authenticator app.')
    } catch (error: any) {
      console.error('MFA setup failed:', error)
      const message =
        error?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to start MFA setup.'
      setError(message)
    } finally {
      setSetupLoading(false)
    }
  }

  async function handleVerifyMfa(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setVerifyLoading(true)

    try {
      const data = await verifyMfa(verifyCode)
      setSuccess(data.message || 'MFA enabled successfully.')
      setVerifyCode('')
    } catch {
      setError('Failed to verify MFA code.')
    } finally {
      setVerifyLoading(false)
    }
  }

  async function handleDisableMfa(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setDisableLoading(true)

    try {
      const data = await disableMfa(disableCode)
      setSuccess(data.message || 'MFA disabled successfully.')
      setDisableCode('')
      setQrCodeImageDataUrl('')
      setSecret('')
      setVerifyCode('')
    } catch {
      setError('Failed to disable MFA. Check your code and try again.')
    } finally {
      setDisableLoading(false)
    }
  }

  return (
    <section aria-labelledby="settings-heading" className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
          Settings
        </p>
        <h2 id="settings-heading" className="mt-4 text-4xl font-semibold text-white">
          Account and security controls
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-400">
          Manage multi-factor authentication and other account protections from one place.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            {success}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h3 className="text-lg font-semibold text-white">Enable MFA</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Scan a QR code with your authenticator app, then confirm setup using a 6-digit code.
            </p>

            <button
              type="button"
              onClick={handleStartMfaSetup}
              disabled={setupLoading}
              className="mt-6 rounded-2xl border border-indigo-400/25 bg-indigo-500/15 px-5 py-3 text-sm font-medium text-indigo-100 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {setupLoading ? 'Preparing setup...' : 'Start MFA setup'}
            </button>

            {qrCodeImageDataUrl ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5">
                <h4 className="text-sm font-medium text-white">Authenticator QR code</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Scan this with Google Authenticator, 1Password, Authy, or another compatible app.
                </p>

                <div className="mt-5 flex justify-center">
                  {qrCodeImageDataUrl ? (
                    <img
                      src={qrCodeImageDataUrl}
                      alt="QR code for multi-factor authentication setup"
                      className="max-w-full rounded-2xl border border-white/10 bg-white p-3"
                    />
                  ) : (
                    <p className="text-sm text-slate-400">QR code unavailable.</p>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Manual setup secret
                  </p>
                  <p className="mt-2 break-all rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-slate-200">
                    {secret}
                  </p>
                </div>

                <form onSubmit={handleVerifyMfa} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="verify-mfa-code"
                      className="mb-2 block text-sm font-medium text-slate-200"
                    >
                      Verification code
                    </label>
                    <input
                      id="verify-mfa-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-indigo-400"
                      placeholder="Enter 6-digit code"
                      value={verifyCode}
                      onChange={(event) => setVerifyCode(event.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify and enable MFA'}
                  </button>
                </form>
              </div>
            ) : null}
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h3 className="text-lg font-semibold text-white">Disable MFA</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Enter a valid authenticator code to remove multi-factor authentication from this
              account.
            </p>

            <form onSubmit={handleDisableMfa} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="disable-mfa-code"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Current authenticator code
                </label>
                <input
                  id="disable-mfa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white focus:border-indigo-400"
                  placeholder="Enter 6-digit code"
                  value={disableCode}
                  onChange={(event) => setDisableCode(event.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={disableLoading}
                className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {disableLoading ? 'Disabling...' : 'Disable MFA'}
              </button>
            </form>
          </article>
        </div>
      </div>
    </section>
  )
}