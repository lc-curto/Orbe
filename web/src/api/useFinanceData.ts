import { useEffect, useState } from 'react'
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

export function useFinanceData(user: AuthUser | null): FinanceDataState {
  const [state, setState] = useState<FinanceDataState>({ data: emptyData, loading: false, error: null, userId: null })

  useEffect(() => {
    let mounted = true
    if (!user) {
      return () => { mounted = false }
    }

    void fetchFinanceReadModel()
      .then((data) => {
        if (mounted) setState({ data, loading: false, error: null, userId: user.id })
      })
      .catch((error: unknown) => {
        if (mounted) setState({ data: emptyData, loading: false, error: messageFor(error), userId: user.id })
      })

    return () => { mounted = false }
  }, [user])

  const currentUserData = user !== null && state.userId === user.id
  return {
    data: currentUserData ? state.data : emptyData,
    loading: user !== null && !currentUserData,
    error: currentUserData ? state.error : null,
  }
}
