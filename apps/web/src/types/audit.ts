export type AuditLog = {
  id: string
  action: string
  ipAddress: string | null
  userAgent: string | null
  details: string
  createdAt: string
}