import axios from 'axios'

const ACCESS_TOKEN_KEY = 'zt_access_token'

const initialToken =
  typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: initialToken
    ? {
        Authorization: `Bearer ${initialToken}`,
      }
    : undefined,
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}