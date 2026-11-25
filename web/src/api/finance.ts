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
