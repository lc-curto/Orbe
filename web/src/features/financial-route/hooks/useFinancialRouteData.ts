import { useMemo } from 'react'
import type { Operation } from '../../../api/types'
import type { RouteDay, RouteMonth } from '../types'
import { operationDate, shiftMonth } from '../utils'

function buildMonth(operations: Operation[], month: string): RouteMonth {
  const [year, monthNumber] = month.split('-').map(Number)
  const count = new Date(year, monthNumber, 0).getDate()
  const first = `${year}-${String(monthNumber).padStart(2, '0')}-01`
  const last = `${year}-${String(monthNumber).padStart(2, '0')}-${String(count).padStart(2, '0')}`
  const grouped = new Map<string, Operation[]>()

  operations.forEach((operation) => {
    if (operation.state !== 'REALIZED' || operation.operation_type === 'TRANSFER') return
    const key = operationDate(operation)
    if (!key || key < first || key > last) return
    const dayOperations = grouped.get(key) ?? []
    dayOperations.push(operation)
    grouped.set(key, dayOperations)
  })

  const days = Array.from({ length: count }, (_, index) => {
    const date = `${year}-${String(monthNumber).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
    const dayOperations = grouped.get(date) ?? []
    return dayOperations.reduce<RouteDay>((day, operation) => {
      if (operation.operation_type === 'INCOME') day.income += Number(operation.amount)
      if (operation.operation_type === 'EXPENSE') day.expenses += Number(operation.amount)
      day.operations.push(operation)
      return day
    }, { date, income: 0, expenses: 0, operations: [] })
  })

  const totals = days.reduce((summary, day) => ({
    income: summary.income + day.income,
    expenses: summary.expenses + day.expenses,
  }), { income: 0, expenses: 0 })

  return { month, days, totals }
}

export function useFinancialRouteData(operations: Operation[], firstMonth: string, monthCount = 3) {
  return useMemo(() => Array.from({ length: monthCount }, (_, index) =>
    buildMonth(operations, shiftMonth(firstMonth, index))
  ), [operations, firstMonth, monthCount])
}
