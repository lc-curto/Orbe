export type ApiEnvelope<T> = {
  data: T
}

export type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

export type AuthUser = {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
}

export type AuthSession = {
  user: AuthUser
  token: string
}

export type Account = {
  id: number
  user_id: number
  name: string
  account_type: 'BANK' | 'CASH' | 'WALLET'
  status: string
}

export type Category = {
  id: number
  user_id: number
  name: string
  nature: 'EXPENSE' | 'INCOME'
  status: string
}

export type Operation = {
  id: number
  operation_type: 'EXPENSE' | 'INCOME' | 'TRANSFER'
  state: 'REALIZED' | 'PENDING' | 'CANCELLED' | 'PARTIAL' | string
  amount: string
  description?: string | null
  effective_at?: string | null
  planned_at?: string | null
  category?: Category | null
  account?: Account | null
  entries?: FinancialEntry[]
}

export type FinancialEntry = {
  id: number
  amount: string
  effect: 'INCREASE' | 'DECREASE'
  state: string
  effective_at?: string | null
  account?: Account | null
  invoice?: CardInvoice | null
}

export type RecurrenceSchedule = {
  id: number
  nature: 'EXPENSE' | 'INCOME'
  amount: string
  account_id: number | null
  category_id: number
  description?: string | null
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  first_occurrence_at: string
  status: 'ACTIVE' | 'PAUSED' | 'ENDED' | string
  end_at?: string | null
  account?: Account | null
  category?: Category | null
}

export type RecurrenceOccurrence = {
  id: number
  recurrence_schedule_id: number
  scheduled_at: string
  amount: string
  state: 'PENDING' | 'REALIZED' | 'CANCELLED' | string
  operation_id?: number | null
  account_id: number
  category_id: number
  description?: string | null
  effective_at?: string | null
  account?: Account | null
  category?: Category | null
}

export type CardInvoice = {
  id: number
  card_id: number
  period_start: string
  period_end: string
  due_date: string
  cycle_state: string
  summary: {
    obligation_amount: string
    paid_amount: string
    open_amount: string
  }
  card?: Card | null
}

export type Card = {
  id: number
  name: string
  credit_limit: string
  closing_day?: number | null
  due_day?: number | null
  status: string
  summary: {
    used_amount: string
    available_amount: string
  }
  invoices?: CardInvoice[]
}
