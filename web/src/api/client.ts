import type { ApiErrorPayload, ApiEnvelope } from './types'

const TOKEN_KEY = 'orbe.auth.token'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]>

  constructor(status: number, payload: ApiErrorPayload | null = {}) {
    super(payload?.message ?? `Pedido à API falhou (${status}).`)
    this.name = 'ApiError'
    this.status = status
    this.errors = payload?.errors ?? {}
  }
}

export function getStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function storeToken(token: string): void {
  window.sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // A sessão sem storage continua utilizável até ser recarregada.
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const token = getStoredToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers })
  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() as ApiErrorPayload | ApiEnvelope<T> : null

  if (!response.ok) {
    throw new ApiError(response.status, payload as ApiErrorPayload | undefined)
  }

  if (response.status === 204 || payload === null) return undefined as T
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data
  }
  return payload as T
}

export function apiUrl(): string {
  return apiBaseUrl
}
