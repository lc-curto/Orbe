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
  state: string
  amount: string
  description?: string | null
  effective_at?: string | null
  planned_at?: string | null
}
