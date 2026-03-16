import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/documents', label: 'Documents' },
  { to: '/audit', label: 'Audit Logs' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell() {
  const { clearAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/70 backdrop-blur lg:min-h-screen lg:w-72 lg:border-r lg:border-b-0">
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
              ZeroTrust Vault
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Privacy-first identity vault
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Secure access to encrypted documents, identity records, and account activity.
            </p>
          </div>

          <nav aria-label="Primary navigation" className="px-4 pb-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const active = location.pathname === item.to
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={[
                        'block rounded-xl px-4 py-3 text-sm font-medium',
                        active
                          ? 'bg-indigo-500/20 text-white ring-1 ring-indigo-400/40'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white',
                      ].join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="px-4 pb-6 lg:mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}