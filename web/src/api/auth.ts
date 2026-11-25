import { apiRequest, clearStoredToken, storeToken } from './client'
import type { AuthSession, AuthUser } from './types'

type LoginResponse = {
  user: AuthUser
  token: string
}

type AuthMessageResponse = {
  message: string
}

export async function register(name: string, email: string, password: string, passwordConfirmation: string): Promise<AuthSession> {
  const response = await apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
  })
  storeToken(response.token)
  return response
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

export async function requestPasswordReset(email: string): Promise<string> {
  const response = await apiRequest<AuthMessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  return response.message
}

export async function resetPassword(email: string, token: string, password: string, passwordConfirmation: string): Promise<string> {
  const response = await apiRequest<AuthMessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirmation }),
  })
  return response.message
}
