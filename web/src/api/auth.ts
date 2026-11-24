import { apiRequest, clearStoredToken, storeToken } from './client'
import type { AuthSession, AuthUser } from './types'

type LoginResponse = {
  user: AuthUser
  token: string
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  storeToken(response.token)
  return response
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>('/auth/me')
  return response.user
}

export async function logout(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('orbe.auth.token')) {
      await apiRequest<void>('/auth/logout', { method: 'POST' })
    }
  } finally {
    clearStoredToken()
  }
}
