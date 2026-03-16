import { api } from './client'
import type {
  AuthResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/auth'

export async function registerUser(payload: RegisterRequest) {
  const { data } = await api.post('/api/auth/register', payload)
  return data as { message: string }
}

export async function loginUser(payload: LoginRequest) {
  const { data } = await api.post('/api/auth/login', payload)
  return data as LoginResponse
}

export async function loginWithMfa(payload: {
  mfaToken: string
  code: string
}) {
  const { data } = await api.post('/api/auth/login/mfa', payload)
  return data as AuthResponse
}

export async function refreshToken(payload: { refreshToken: string }) {
  const { data } = await api.post('/api/auth/refresh', payload)
  return data as AuthResponse
}

export async function logoutUser(payload: { refreshToken: string }) {
  const { data } = await api.post('/api/auth/logout', payload)
  return data as { message: string }
}