import { Link } from 'react-router-dom'

export function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/75 p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
          Account setup
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Create your vault account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The registration form is the next page we will connect to your backend.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Your backend already supports registration. We’ll wire this page immediately after the
            document and audit UI.
          </p>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
            Return to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}