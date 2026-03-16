import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { setAuthToken } from '../api/client'
import { logoutUser, refreshToken } from '../api/auth'

type AuthContextValue = {
  accessToken: string | null
  refreshTokenValue: string | null
  isAuthenticated: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => Promise<void>
  tryRefresh: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ACCESS_TOKEN_KEY = 'zt_access_token'
const REFRESH_TOKEN_KEY = 'zt_refresh_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY)
  )
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    localStorage.getItem(REFRESH_TOKEN_KEY)
  )

  useEffect(() => {
    setAuthToken(accessToken)
  }, [accessToken])

  const setTokens = useCallback((newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
    setAccessTokenState(newAccessToken)
    setRefreshTokenValue(newRefreshToken)
    setAuthToken(newAccessToken)
  }, [])

  const clearAuth = useCallback(async () => {
    try {
      if (refreshTokenValue) {
        await logoutUser({ refreshToken: refreshTokenValue })
      }
    } catch {
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      setAccessTokenState(null)
      setRefreshTokenValue(null)
      setAuthToken(null)
    }
  }, [refreshTokenValue])

  const tryRefresh = useCallback(async () => {
    if (!refreshTokenValue) return false

    try {
      const data = await refreshToken({ refreshToken: refreshTokenValue })
      setTokens(data.accessToken, data.refreshToken)
      return true
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      setAccessTokenState(null)
      setRefreshTokenValue(null)
      setAuthToken(null)
      return false
    }
  }, [refreshTokenValue, setTokens])

  const value = useMemo(
    () => ({
      accessToken,
      refreshTokenValue,
      isAuthenticated: Boolean(accessToken),
      setTokens,
      clearAuth,
      tryRefresh,
    }),
    [accessToken, refreshTokenValue, setTokens, clearAuth, tryRefresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}