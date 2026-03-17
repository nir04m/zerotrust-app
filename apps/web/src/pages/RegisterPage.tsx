import { Link } from 'react-router-dom'

export function RegisterPage() {
  return (
    <main className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[56%_44%]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/14 via-slate-950 to-slate-950" />
          <div className="relative flex w-full flex-col justify-center px-14 py-14 xl:px-20 xl:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300">
              Account setup
            </p>
            <h1 className="mt-8 max-w-2xl text-5xl font-semibold leading-[1.08] text-white xl:text-6xl">
              Create a secure vault account built for protected identity workflows.
            </h1>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-300 lg:hidden">
              Account setup
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Create your account</h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              The registration form is the next page we will connect to your backend.
            </p>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/4 p-6">
              <p className="text-sm leading-7 text-slate-400">
                Your backend already supports registration. We’ll wire this page immediately after
                the document and audit UI.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>Already have an account?</span>
              <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
                Return to sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}