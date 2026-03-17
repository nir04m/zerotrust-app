import { api } from './client'
import type { DocumentItem, DocumentUploadResponse } from '../types/document'

export async function getDocuments() {
  const { data } = await api.get('/api/documents')
  return data as DocumentItem[]
}

export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data as DocumentUploadResponse
}

export async function downloadDocument(documentId: string, fileName: string) {
  const response = await api.get(`/api/documents/${documentId}/download`, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  })

  const url = window.URL.createObjectURL(blob)
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