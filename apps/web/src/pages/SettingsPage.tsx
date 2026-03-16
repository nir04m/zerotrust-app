export function SettingsPage() {
  return (
    <section aria-labelledby="settings-heading">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
          Settings
        </p>
        <h2 id="settings-heading" className="mt-3 text-3xl font-semibold text-white">
          Account and MFA controls
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Manage account protections, multi-factor authentication, and future security preferences.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">Multi-factor authentication</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enable, verify, or disable MFA using your existing backend endpoints.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">Session protection</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Review refresh behavior, secure sign-out, and future device/session controls.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}