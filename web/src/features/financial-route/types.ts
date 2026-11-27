import type { Operation } from '../../api/types'

export type RouteFilter = 'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'
export type RouteFlowFilter = 'ALL' | 'INCOME' | 'EXPENSE'

export type RouteDay = {
  date: string
  income: number
  expenses: number
  operations: Operation[]
}

export type RouteMonth = {
  month: string
  days: RouteDay[]
  totals: { income: number; expenses: number }
}

export const routeFilterOptions: Array<{ value: RouteFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Ganhos' },
  { value: 'FIXED', label: 'G. Fixos' },
  { value: 'VARIABLE', label: 'G. Variáveis' },
]
