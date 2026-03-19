import { useEffect, useMemo, useState } from 'react'
import { getAuditLogs } from '../api/audit'
import type { AuditLog } from '../types/audit'

function formatDate(dateString: string) {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function actionLabel(action: string) {
  return action.replaceAll('_', ' ')
}

const INITIAL_VISIBLE_COUNT = 10

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  async function loadLogs() {
    setError('')

    try {
      const data = await getAuditLogs()
      setLogs(data)
    } catch {
      setError('Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLogs()
  }, [])

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [logs]
  )

  const visibleLogs = useMemo(
    () => (showAll ? sortedLogs : sortedLogs.slice(0, INITIAL_VISIBLE_COUNT)),
    [showAll, sortedLogs]
  )

  const hasMoreThanInitial = sortedLogs.length > INITIAL_VISIBLE_COUNT
  const hiddenCount = Math.max(0, sortedLogs.length - INITIAL_VISIBLE_COUNT)

  return (
    <section aria-labelledby="audit-heading" className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/20 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
              Audit Logs
            </p>

            <h2
              id="audit-heading"
              className="mt-4 text-3xl font-semibold text-white sm:text-4xl"
            >
              Security activity history
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              Monitor login attempts, MFA activity, document uploads, downloads,
              and deletions associated with your account.
            </p>
          </div>

          {!loading && !error && sortedLogs.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-300">
              Showing{' '}
              <span className="font-medium text-white">{visibleLogs.length}</span>{' '}
              of{' '}
              <span className="font-medium text-white">{sortedLogs.length}</span>{' '}
              events
            </div>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/3">
          <div className="hidden grid-cols-[240px_200px_1fr_220px] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 lg:grid">
            <span>Action</span>
            <span>IP Address</span>
            <span>Details</span>
            <span>Time</span>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-sm text-slate-400">
              Loading activity logs...
            </div>
          ) : sortedLogs.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-400">
              No activity recorded yet.
            </div>
          ) : (
            <>
              <ul className="divide-y divide-white/10">
                {visibleLogs.map((log) => (
                  <li key={log.id} className="px-4 py-5 sm:px-6">
                    <div className="hidden gap-4 lg:grid lg:grid-cols-[240px_200px_1fr_220px] lg:items-center">
                      <div className="text-sm font-medium text-white">
                        {actionLabel(log.action)}
                      </div>

                      <div className="text-sm text-slate-300">
                        {log.ipAddress ?? 'Unknown'}
                      </div>

                      <div className="text-sm text-slate-300 wrap-break-word">
                        {log.details}
                      </div>

                      <div className="text-sm text-slate-400">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>

                    <div className="space-y-4 lg:hidden">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {actionLabel(log.action)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(log.createdAt)}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/2 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            IP Address
                          </p>
                          <p className="mt-2 wrap-break-word text-sm text-slate-200">
                            {log.ipAddress ?? 'Unknown'}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/2 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Event Time
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/2 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Details
                        </p>
                        <p className="mt-2 wrap-break-word text-sm text-slate-200">
                          {log.details}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {hasMoreThanInitial ? (
                <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-sm text-slate-400">
                    {showAll
                      ? 'Showing the full activity history.'
                      : `${hiddenCount} older event${hiddenCount === 1 ? '' : 's'} hidden to keep the page focused.`}
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAll((current) => !current)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                    aria-expanded={showAll}
                  >
                    {showAll ? 'Show less' : 'View all activity'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}