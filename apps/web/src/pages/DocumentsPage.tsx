export function DocumentsPage() {
  return (
    <section aria-labelledby="documents-heading">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
          Documents
        </p>
        <h2 id="documents-heading" className="mt-3 text-3xl font-semibold text-white">
          Encrypted document management
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Upload, review, download, and remove secure documents stored in your private vault.
        </p>

        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/5 p-8">
          <h3 className="text-lg font-medium text-white">Upload workflow</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The full upload and listing UI is the next frontend step. Your backend endpoints are
            already ready for file upload, listing, secure download, and deletion.
          </p>
        </div>
      </div>
    </section>
  )
}