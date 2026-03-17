import { api } from './client'
import type { AuditLog } from '../types/audit'

export async function getAuditLogs() {
  const { data } = await api.get('/api/audit/me')
  return data as AuditLog[]
}