export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  mfaRequired: boolean
  accessToken: string | null
  refreshToken: string | null
  mfaToken: string | null
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
}

export type RegisterRequest = {
  email: string
  password: string
}