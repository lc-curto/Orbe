import type { CardInvoice, Operation } from '../../api/types'

export type RouteFilter = 'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'
export type RouteFlowFilter = 'ALL' | 'INCOME' | 'EXPENSE'

export type RouteDay = {
  date: string
  income: bigint
  expenses: bigint
  balance: bigint | null
  operations: Operation[]
  invoices: CardInvoice[]
}

export type RouteMonth = {
  month: string
  days: RouteDay[]
  totals: { income: bigint; expenses: bigint }
  openingBalance: bigint | null
  endingBalance: bigint | null
}

export const routeFilterOptions: Array<{ value: RouteFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'FIXED', label: 'G. fixos' },
  { value: 'VARIABLE', label: 'G. variáveis' },
]
