import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/documents', label: 'Documents' },
  { to: '/audit', label: 'Audit Logs' },
]

export function AppShell() {
  const { clearAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await clearAuth()
    navigate('/login')
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-400 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 lg:hidden"
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((value) => !value)}
            >
              {sidebarOpen ? '×' : '☰'}
            </button>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-300 sm:text-[11px]">
                ZeroTrust Vault
              </p>
              <h1 className="truncate text-sm font-medium text-slate-200">
                Privacy-first identity security
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/settings"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 sm:px-4"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 sm:px-4"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-400">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
            aria-label="Close navigation overlay"
            onClick={closeSidebar}
          />
        ) : null}

        <aside
          className={[
            'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-70 border-r border-white/10 bg-slate-950/95 px-5 py-6 backdrop-blur lg:sticky lg:block',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'transition-transform duration-200 lg:translate-x-0',
          ].join(' ')}
        >
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
              Workspace
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Identity vault
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Secure access to encrypted documents, identity records, and account activity.
            </p>
          </div>

          <nav aria-label="Primary navigation" className="mt-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const active = location.pathname === item.to
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={closeSidebar}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'block rounded-2xl px-4 py-3 text-sm font-medium',
                        active
                          ? 'border border-indigo-400/30 bg-indigo-500/15 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}