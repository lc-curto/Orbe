import type { Operation } from '../../api/types'

export function dateKey(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

export function formatDay(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit' }).format(date)
}

export function formatFullDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export function operationLabel(operation: Operation) {
  return operation.description?.trim() || (operation.operation_type === 'INCOME' ? 'Receita' : 'Despesa')
}

export function operationDate(operation: Operation) {
  return dateKey(operation.effective_at ?? operation.planned_at)
}
