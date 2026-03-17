type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog overlay"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
        <h3
          id="confirm-dialog-title"
          className="text-xl font-semibold text-white"
        >
          {title}
        </h3>

        <p
          id="confirm-dialog-description"
          className="mt-3 text-sm leading-7 text-slate-400"
        >
          {description}
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              'rounded-2xl px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60',
              danger
                ? 'border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20'
                : 'border border-indigo-400/20 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/20',
            ].join(' ')}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}