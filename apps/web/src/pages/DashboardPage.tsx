export function DashboardPage() {
  return (
    <section aria-labelledby="dashboard-heading" className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
          Dashboard
        </p>
        <h2 id="dashboard-heading" className="mt-4 text-4xl font-semibold text-white">
          Secure workspace overview
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-400">
          Manage encrypted documents, review audit activity, and maintain account controls from a
          single secure interface.
        </p>

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h3 className="text-base font-semibold text-white">Identity protection</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Account sessions are backed by MFA, JWT access control, refresh rotation, and login
              throttling.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h3 className="text-base font-semibold text-white">Encrypted storage</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Documents are stored in private object storage with encryption metadata, ownership
              enforcement, and hardened download behavior.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/4 p-6">
            <h3 className="text-base font-semibold text-white">Audit visibility</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Review sign-ins, uploads, downloads, and deletions through a complete user-scoped
              audit trail.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}