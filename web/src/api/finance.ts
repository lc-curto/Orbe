import { apiRequest } from './client'
import type { Account, ApiEnvelope, Card, CardInvoice, Category, Operation, RecurrenceOccurrence, RecurrenceSchedule } from './types'

export async function fetchCards(): Promise<Card[]> {
  return apiRequest<Card[]>('/cards')
}

export async function fetchCard(cardId: number): Promise<Card> {
  return apiRequest<Card>(`/cards/${cardId}`)
}

export async function fetchInvoices(): Promise<CardInvoice[]> {
  return apiRequest<CardInvoice[]>('/invoices')
}

export async function fetchOperations(): Promise<Operation[]> {
  return apiRequest<Operation[]>('/operations')
}

export async function fetchFinancialRouteReadModel(month: string, signal?: AbortSignal): Promise<FinancialRouteReadModel> {
  return apiRequest<FinancialRouteReadModel>(`/financial-route?month=${encodeURIComponent(month)}`, { signal })
}

export async function fetchAccounts(): Promise<Account[]> {
  return apiRequest<Account[]>('/accounts')
}

export async function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories')
}

export async function fetchRecurrences(): Promise<RecurrenceSchedule[]> {
  return apiRequest<RecurrenceSchedule[]>('/recurrences')
}

export async function fetchRecurrenceOccurrences(scheduleId: number): Promise<RecurrenceOccurrence[]> {
  return apiRequest<RecurrenceOccurrence[]>(`/recurrences/${scheduleId}/occurrences`)
}

export type FinanceReadResult = {
  cards: Card[]
  invoices: CardInvoice[]
  operations: Operation[]
  accounts: Account[]
  categories: Category[]
  recurrences: RecurrenceSchedule[]
}

export async function fetchFinanceReadModel(): Promise<FinanceReadResult> {
  const [cards, invoices, operations, accounts, categories, recurrences] = await Promise.all([
    fetchCards(),
    fetchInvoices(),
    fetchOperations(),
    fetchAccounts(),
    fetchCategories(),
    fetchRecurrences(),
  ])
  return { cards, invoices, operations, accounts, categories, recurrences }
}

export type FinanceApiContract = ApiEnvelope<FinanceReadResult>


export type OperationWriteInput = {
  amount: string
  category_id: number
  description?: string
  state: 'REALIZED' | 'PENDING'
  account_id?: number
  effective_at?: string
  planned_at?: string
  idempotency_key?: string
}

export type TransferLegWriteInput = {
  account_id: number
  state: 'REALIZED' | 'PENDING'
  effective_at?: string
  planned_at?: string
}

export type TransferWriteInput = {
  amount: string
  description?: string
  idempotency_key?: string
  legs: {
    out: TransferLegWriteInput
    in: TransferLegWriteInput
  }
}

export async function createExpense(input: OperationWriteInput): Promise<Operation> {
  return apiRequest<Operation>('/expenses', { method: 'POST', body: JSON.stringify(input) })
}

export async function createIncome(input: OperationWriteInput): Promise<Operation> {
  return apiRequest<Operation>('/incomes', { method: 'POST', body: JSON.stringify(input) })
}

export async function createTransfer(input: TransferWriteInput): Promise<Operation> {
  return apiRequest<Operation>('/transfers', { method: 'POST', body: JSON.stringify(input) })
}


export type RecurrenceWriteInput = {
  nature: 'EXPENSE' | 'INCOME'
  amount: string
  category_id: number
  description?: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  first_occurrence_at: string
  end_at?: string
  idempotency_key?: string
}

export async function createRecurrence(input: RecurrenceWriteInput): Promise<RecurrenceSchedule> {
  return apiRequest<RecurrenceSchedule>('/recurrences', { method: 'POST', body: JSON.stringify(input) })
}
