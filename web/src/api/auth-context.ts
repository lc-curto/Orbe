import { createContext } from 'react'
import type { AuthSession, AuthUser } from './types'

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthSession>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<AuthSession>
  requestPasswordReset: (email: string) => Promise<string>
  resetPassword: (email: string, token: string, password: string, passwordConfirmation: string) => Promise<string>
  logout: () => Promise<void>
  refresh: () => Promise<AuthUser | null>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
