import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { ApiError } from './client'
import { fetchCurrentUser, login as requestLogin, logout as requestLogout } from './auth'
import { AuthContext } from './auth-context'
import type { AuthSession, AuthUser } from './types'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const validation = Object.values(error.errors).flat()[0]
    return validation ?? error.message
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir o pedido.'
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (requestError) {
      if (!(requestError instanceof ApiError && requestError.status === 401)) setError(errorMessage(requestError))
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true
    void fetchCurrentUser()
      .then((currentUser) => {
        if (mounted) setUser(currentUser)
      })
      .catch((requestError: unknown) => {
        if (mounted) {
          if (!(requestError instanceof ApiError && requestError.status === 401)) setError(errorMessage(requestError))
          setUser(null)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthSession> => {
    setLoading(true)
    setError(null)
    try {
      const session = await requestLogin(email, password)
      setUser(session.user)
      return session
    } catch (requestError) {
      setError(errorMessage(requestError))
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await requestLogout()
      setUser(null)
    } catch (requestError) {
      setError(errorMessage(requestError))
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(() => ({
    user, loading, error, login, logout, refresh, clearError: () => setError(null),
  }), [user, loading, error, login, logout, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
