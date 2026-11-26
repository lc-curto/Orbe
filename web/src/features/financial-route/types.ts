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
  { value: 'INCOME', label: 'Receitas' },
  { value: 'FIXED', label: 'G. fixos' },
  { value: 'VARIABLE', label: 'G. variáveis' },
]
