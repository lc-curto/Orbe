import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { ApiError, getStoredToken } from './client'
import { fetchCurrentUser, login as requestLogin, logout as requestLogout, register as requestRegister, requestPasswordReset as requestPasswordResetApi, resetPassword as resetPasswordApi } from './auth'
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
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    if (!getStoredToken()) {
      setUser(null)
      return null
    }
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
    if (!getStoredToken()) {
      return () => { mounted = false }
    }
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

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirmation: string): Promise<AuthSession> => {
    setLoading(true)
    setError(null)
    try {
      const session = await requestRegister(name, email, password, passwordConfirmation)
      setUser(session.user)
      return session
    } catch (requestError) {
      setError(errorMessage(requestError))
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  const requestPasswordReset = useCallback(async (email: string): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      return await requestPasswordResetApi(email)
    } catch (requestError) {
      setError(errorMessage(requestError))
      throw requestError
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string, token: string, password: string, passwordConfirmation: string): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      return await resetPasswordApi(email, token, password, passwordConfirmation)
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
    user, loading, error, login, register, requestPasswordReset, resetPassword, logout, refresh, clearError: () => setError(null),
  }), [user, loading, error, login, register, requestPasswordReset, resetPassword, logout, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
