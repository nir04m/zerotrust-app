export type DocumentItem = {
  id: string
  originalFilename: string
  contentType: string | null
  sizeBytes: number
  createdAt: string
}

export type DocumentUploadResponse = {
  documentId: string
  fileName: string
  objectKey: string
  sizeBytes: number
}