import { createContext } from 'react'
import type { AuthSession, AuthUser } from './types'

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthSession>
  logout: () => Promise<void>
  refresh: () => Promise<AuthUser | null>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
