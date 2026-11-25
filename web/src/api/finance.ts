import { apiRequest } from './client'
import type { ApiEnvelope, Card, CardInvoice, Operation } from './types'

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

export type FinanceReadResult = {
  cards: Card[]
  invoices: CardInvoice[]
  operations: Operation[]
}

export async function fetchFinanceReadModel(): Promise<FinanceReadResult> {
  const [cards, invoices, operations] = await Promise.all([
    fetchCards(),
    fetchInvoices(),
    fetchOperations(),
  ])
  return { cards, invoices, operations }
}

export type FinanceApiContract = ApiEnvelope<FinanceReadResult>
