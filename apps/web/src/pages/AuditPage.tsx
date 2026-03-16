export function AuditPage() {
  return (
    <section aria-labelledby="audit-heading">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
          Audit Logs
        </p>
        <h2 id="audit-heading" className="mt-3 text-3xl font-semibold text-white">
          Security activity history
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Review sign-ins, MFA changes, document activity, and other sensitive actions recorded for
          your account.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            This page will render your backend audit history in an accessible table in the next
            step.
          </p>
        </div>
      </div>
    </section>
  )
}