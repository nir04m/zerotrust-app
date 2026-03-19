import { useEffect, useMemo, useRef, useState } from 'react'
import {
  deleteDocument,
  downloadDocument,
  getDocuments,
  uploadDocument,
} from '../api/documents'
import type { DocumentItem } from '../types/document'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

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

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [busyDocumentId, setBusyDocumentId] = useState<string | null>(null)
  const [documentToDelete, setDocumentToDelete] = useState<DocumentItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function loadDocuments() {
    setError('')

    try {
      const data = await getDocuments()
      setDocuments(data)
    } catch {
      setError('Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDocuments()
  }, [])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setActionMessage('')
    setError('')

    try {
      await uploadDocument(file)
      setActionMessage(`Uploaded ${file.name} successfully.`)
      await loadDocuments()
    } catch {
      setError('Upload failed. Check file size or try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleDownload(document: DocumentItem) {
    setBusyDocumentId(document.id)
    setActionMessage('')
    setError('')

    try {
      await downloadDocument(document.id, document.originalFilename)
      setActionMessage(`Downloaded ${document.originalFilename}.`)
    } catch {
      setError('Download failed.')
    } finally {
      setBusyDocumentId(null)
    }
  }

  async function confirmDeleteDocument() {
    if (!documentToDelete) return

    setBusyDocumentId(documentToDelete.id)
    setActionMessage('')
    setError('')

    try {
      await deleteDocument(documentToDelete.id)
      setActionMessage(`Deleted ${documentToDelete.originalFilename}.`)
      setDocuments((current) =>
        current.filter((item) => item.id !== documentToDelete.id)
      )
      setDocumentToDelete(null)
    } catch {
      setError('Delete failed.')
    } finally {
      setBusyDocumentId(null)
    }
  }

  const sortedDocuments = useMemo(
    () =>
      [...documents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [documents]
  )

  return (
    <>
      <section aria-labelledby="documents-heading" className="space-y-8">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
                Documents
              </p>
              <h2 id="documents-heading" className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Encrypted document management
              </h2>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                Upload, review, download, and remove secure documents stored in your private vault.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="document-upload"
                className="inline-flex cursor-pointer items-center rounded-2xl border border-indigo-400/25 bg-indigo-500/15 px-5 py-3 text-sm font-medium text-indigo-100 hover:bg-indigo-500/20"
              >
                {uploading ? 'Uploading...' : 'Upload document'}
              </label>
              <input
                ref={fileInputRef}
                id="document-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <p className="text-xs text-slate-500">Supported by your secure backend upload flow.</p>
            </div>
          </div>

          {actionMessage ? (
            <div
              role="status"
              className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
            >
              {actionMessage}
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/3">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_160px_220px_220px] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 lg:grid">
              <span>Document</span>
              <span>Size</span>
              <span>Uploaded</span>
              <span>Actions</span>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-sm text-slate-400">Loading documents...</div>
            ) : sortedDocuments.length === 0 ? (
              <div className="px-6 py-10 text-sm text-slate-400">
                No documents uploaded yet. Add your first encrypted document to begin.
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {sortedDocuments.map((document) => {
                  const isBusy = busyDocumentId === document.id

                  return (
                    <li key={document.id} className="px-4 py-5 sm:px-6">
                      <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_160px_220px_220px] lg:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {document.originalFilename}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {document.contentType || 'application/octet-stream'}
                          </p>
                        </div>

                        <div className="text-sm text-slate-300">
                          {formatBytes(document.sizeBytes)}
                        </div>

                        <div className="text-sm text-slate-300">
                          {formatDate(document.createdAt)}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(document)}
                            disabled={isBusy}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? 'Working...' : 'Download'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocumentToDelete(document)}
                            disabled={isBusy}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 lg:hidden">
                        <div>
                          <p className="wrap-break-word text-sm font-medium text-white">
                            {document.originalFilename}
                          </p>
                          <p className="mt-1 wrap-break-word text-xs text-slate-500">
                            {document.contentType || 'application/octet-stream'}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-white/2 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Size
                            </p>
                            <p className="mt-2 text-sm text-slate-200">
                              {formatBytes(document.sizeBytes)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/2 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Uploaded
                            </p>
                            <p className="mt-2 text-sm text-slate-200">
                              {formatDate(document.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handleDownload(document)}
                            disabled={isBusy}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? 'Working...' : 'Download'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocumentToDelete(document)}
                            disabled={isBusy}
                            className="w-full rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(documentToDelete)}
        title="Delete document"
        description={
          documentToDelete
            ? `Are you sure you want to permanently remove "${documentToDelete.originalFilename}" from your vault? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete document"
        cancelLabel="Keep document"
        danger
        loading={Boolean(documentToDelete && busyDocumentId === documentToDelete.id)}
        onConfirm={() => {
          void confirmDeleteDocument()
        }}
        onCancel={() => {
          if (!busyDocumentId) {
            setDocumentToDelete(null)
          }
        }}
      />
    </>
  )
}