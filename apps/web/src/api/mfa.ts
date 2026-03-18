import { api } from './client'
import type { MfaSetupResponse } from '../types/mfa'

export async function setupMfa() {
  const { data } = await api.post('/api/auth/mfa/setup')
  return data as MfaSetupResponse
}

export async function verifyMfa(code: string) {
  const { data } = await api.post('/api/auth/mfa/verify', { code })
  return data as { message: string }
}

export async function disableMfa(code: string) {
  const { data } = await api.post('/api/auth/mfa/disable', { code })
  return data as { message: string }
}