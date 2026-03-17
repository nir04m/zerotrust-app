export function SettingsPage() {
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
          Manage MFA, sign-in protections, and future account preferences from a dedicated security
          settings area.
        </p>

        <div className="mt-10 grid gap-5 xl:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h3 className="text-base font-semibold text-white">Multi-factor authentication</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Enable, verify, or disable MFA using your existing backend endpoints.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h3 className="text-base font-semibold text-white">Session protection</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Review secure sign-out behavior, refresh handling, and future device session controls.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}