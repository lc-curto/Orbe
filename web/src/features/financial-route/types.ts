import type { CardInvoice, FinancialRouteOverdueItem, FinancialRouteReadModel, Operation } from '../../api/types'

export type RouteFilter = 'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'
export type RouteFlowFilter = 'ALL' | 'INCOME' | 'EXPENSE'

export type RouteDay = {
  date: string
  income: string
  expenses: string
  balance: string | null
  operations: Operation[]
  invoices: CardInvoice[]
}

export type RouteMonth = {
  month: string
  days: RouteDay[]
  totals: { income: string; expenses: string }
  openingBalance: string | null
  endingBalance: string | null
}

export type RouteProjection = {
  referenceDate: string
  referenceBalance: string | null
  months: RouteMonth[]
  overdueItems: FinancialRouteOverdueItem[]
  overdueTotal: string
}

export type RouteReadModel = FinancialRouteReadModel

export const routeFilterOptions: Array<{ value: RouteFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'FIXED', label: 'G. fixos' },
  { value: 'VARIABLE', label: 'G. variáveis' },
]
