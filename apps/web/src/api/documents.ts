import { api } from './client'
import type { DocumentItem, DocumentUploadResponse } from '../types/document'
import { decryptFile } from '../lib/e2ee'

export async function getDocuments() {
  const { data } = await api.get('/api/documents')
  return data as DocumentItem[]
}

export async function uploadDocument(file: File) {
  const { encryptFile } = await import('../lib/e2ee')
  const { encryptedBlob, metadata } = await encryptFile(file)

  const formData = new FormData()
  formData.append('file', encryptedBlob, file.name)
  formData.append(
    'metadata',
    JSON.stringify({
      originalFilename: file.name,
      contentType: file.type || 'application/octet-stream',
      encryptionMetadata: JSON.stringify(metadata),
    })
  )

  const { data } = await api.post('/api/documents/upload', formData)

  return data as DocumentUploadResponse
}

export async function downloadDocument(documentId: string, fileName: string) {
  const metadataResponse = await api.get(`/api/documents/${documentId}/metadata`)
  const encryptionMetadata = metadataResponse.data.encryptionMetadata as string

  const response = await api.get(`/api/documents/${documentId}/download`, {
    responseType: 'blob',
  })

  const decryptedBlob = await decryptFile(response.data, encryptionMetadata)

  const url = window.URL.createObjectURL(decryptedBlob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = fileName
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function deleteDocument(documentId: string) {
  const { data } = await api.delete(`/api/documents/${documentId}`)
  return data as { message: string }
}