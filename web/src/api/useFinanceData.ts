import { useCallback, useEffect, useState } from 'react'
import { ApiError } from './client'
import { fetchFinanceReadModel, type FinanceReadResult } from './finance'
import type { AuthUser } from './types'

type FinanceDataState = {
  data: FinanceReadResult
  loading: boolean
  error: string | null
  userId?: number | null
}

const emptyData: FinanceReadResult = { cards: [], invoices: [], operations: [], accounts: [], categories: [], recurrences: [] }

function messageFor(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Não foi possível carregar os dados financeiros.'
}

export function useFinanceData(user: AuthUser | null): FinanceDataState & { refresh: () => void } {
  const [state, setState] = useState<FinanceDataState>({ data: emptyData, loading: false, error: null, userId: null })
  const [refreshVersion, setRefreshVersion] = useState(0)

  const refresh = useCallback(() => {
    if (!user) return
    setState((current) => ({ ...current, loading: true, error: null, userId: user.id }))
    setRefreshVersion((version) => version + 1)
  }, [user])

  useEffect(() => {
    let mounted = true
    if (!user) {
      setState({ data: emptyData, loading: false, error: null, userId: null })
      return () => { mounted = false }
    }

    void fetchFinanceReadModel()
      .then((data) => {
        if (mounted) setState({ data, loading: false, error: null, userId: user.id })
      })
      .catch((error: unknown) => {
        if (mounted) {
          setState((current) => ({
            data: current.userId === user.id ? current.data : emptyData,
            loading: false,
            error: messageFor(error),
            userId: user.id,
          }))
        }
      })

    return () => { mounted = false }
  }, [user, refreshVersion])

  const currentUserData = user !== null && state.userId === user.id
  return {
    data: currentUserData ? state.data : emptyData,
    loading: user !== null && (!currentUserData || state.loading),
    error: currentUserData ? state.error : null,
    refresh,
  }
}
