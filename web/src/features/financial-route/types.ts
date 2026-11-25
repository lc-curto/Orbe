import type { Operation } from '../../api/types'

export type RouteFilter = 'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'

export type RouteDay = {
  date: string
  income: number
  expenses: number
  operations: Operation[]
}

export const routeFilterOptions: Array<{ value: RouteFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'FIXED', label: 'G. fixos' },
  { value: 'VARIABLE', label: 'G. variáveis' },
]
