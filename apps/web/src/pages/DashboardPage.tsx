export function DashboardPage() {
  return (
    <section aria-labelledby="dashboard-heading">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
          Dashboard
        </p>
        <h2 id="dashboard-heading" className="mt-3 text-3xl font-semibold text-white">
          Secure workspace overview
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Manage encrypted documents, review audit activity, and maintain account controls from a
          single secure interface.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">Identity protection</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Account sessions are backed by MFA, JWT access control, and refresh token rotation.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">Encrypted storage</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Documents are stored in private object storage with encryption metadata and ownership
              enforcement.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">Audit visibility</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Review sign-ins, uploads, downloads, and deletions with a complete user-scoped audit
              trail.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}