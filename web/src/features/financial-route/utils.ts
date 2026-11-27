import { formatCurrency } from '../currency/formatCurrency'
import type { CurrencySymbol } from '../currency/types'
import type { Operation } from '../../api/types'

export function dateKey(value?: string | null) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function shiftMonth(value: string, offset: number) {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(value: string, includeYear = true) {
  const date = new Date(`${value}-01T12:00:00`)
  const month = new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(date).replace('.', '')
  const label = `${month.charAt(0).toUpperCase()}${month.slice(1)}`
  return includeYear ? `${label} ${date.getFullYear()}` : label
}

export function formatMonthRange(first: string, last: string) {
  if (first === last) return formatMonth(first, true)
  const firstDate = new Date(`${first}-01T12:00:00`)
  const lastDate = new Date(`${last}-01T12:00:00`)
  const firstLabel = formatMonth(first, firstDate.getFullYear() !== lastDate.getFullYear())
  const lastLabel = formatMonth(last, true)
  return `${firstLabel} – ${lastLabel}`
}

export function formatMoney(value: number, symbol: CurrencySymbol = '€') {
  return formatCurrency(Object.is(value, -0) ? 0 : value, symbol)
}

export function formatAmount(value: number) {
  return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Object.is(value, -0) ? 0 : value)
}

export function formatDay(value: string) {
  const date = new Date(`${value}T12:00:00`)
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = new Intl.DateTimeFormat('pt-PT', { weekday: 'short' }).format(date).replace('.', '')
  return `${day} ${weekday}`
}

export function formatFullDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export function operationLabel(operation: Operation) {
  return operation.description?.trim() || (operation.operation_type === 'INCOME' ? 'Receita' : operation.operation_type === 'TRANSFER' ? 'Transferência' : 'Despesa')
}

export function operationDate(operation: Operation) {
  // Pendentes são projetadas na data prevista; realizadas usam a data efetiva.
  const value = operation.state === 'PENDING'
    ? operation.planned_at
    : operation.effective_at ?? operation.planned_at
  return dateKey(value)
}
