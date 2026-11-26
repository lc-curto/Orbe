import type { Operation } from '../../api/types'

export type PeriodTotals = { income: number; expenses: number }

export function monthOf(value?: string | null) {
  return value ? value.slice(0, 7) : ''
}

export function shiftMonth(month: string, offset: number) {
  const [year, number] = month.split('-').map(Number)
  const date = new Date(year, number - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(month: string, style: 'short' | 'long' = 'short') {
  const date = new Date(`${month}-01T12:00:00`)
  return new Intl.DateTimeFormat('pt-PT', { month: style, year: '2-digit' }).format(date)
}

export function operationMonth(operation: Operation) {
  return monthOf(operation.effective_at)
}

export function isRealizedOperation(operation: Operation) {
  return operation.state === 'REALIZED' && Boolean(operation.effective_at)
}

export function totalsFor(operations: Operation[]): PeriodTotals {
  return operations.reduce((totals, operation) => {
    if (!isRealizedOperation(operation)) return totals
    const amount = Number(operation.amount)
    if (!Number.isFinite(amount)) return totals
    if (operation.operation_type === 'INCOME') totals.income += amount
    if (operation.operation_type === 'EXPENSE') totals.expenses += amount
    return totals
  }, { income: 0, expenses: 0 })
}

export function expensesByCategory(operations: Operation[]) {
  const grouped = new Map<string, number>()
  operations.filter((operation) => operation.operation_type === 'EXPENSE').forEach((operation) => {
    const amount = Number(operation.amount)
    if (!Number.isFinite(amount)) return
    const name = operation.category?.name ?? 'Sem categoria'
    grouped.set(name, (grouped.get(name) ?? 0) + amount)
  })
  return [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
}

export function activityByAccount(operations: Operation[]) {
  const grouped = new Map<string, number>()
  operations.forEach((operation) => {
    if (operation.operation_type === 'TRANSFER') return
    const amount = Number(operation.amount)
    if (!Number.isFinite(amount)) return
    const name = operation.account?.name ?? operation.entries?.find((entry) => entry.account)?.account?.name ?? 'Conta não identificada'
    grouped.set(name, (grouped.get(name) ?? 0) + amount)
  })
  return [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
}
