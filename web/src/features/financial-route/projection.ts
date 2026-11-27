import type { Account, CardInvoice, FinancialEntry, Operation } from '../../../api/types'
import type { RouteDay, RouteMonth } from './types'

const MONEY_SCALE = 10_000n

export type RouteOverdueItem = {
  id: string
  date: string
  label: string
  amount: bigint
  nature: 'INCOME' | 'EXPENSE'
  invoice?: CardInvoice
  operation?: Operation
}

export type FinancialRouteProjection = {
  months: RouteMonth[]
  referenceBalance: bigint | null
  overdueItems: RouteOverdueItem[]
  overdueTotal: bigint
}

type DailyFlow = { income: bigint; expenses: bigint }
type DailyMap<T> = Map<string, T>

export function parseMoneyUnits(value: string | number): bigint | null {
  const text = String(value).trim()
  const match = /^(-?)(\d+)(?:\.(\d{1,4}))?$/.exec(text)
  if (!match) return null
  const fraction = (match[3] ?? '').padEnd(4, '0')
  const units = BigInt(match[2]) * MONEY_SCALE + BigInt(fraction)
  return match[1] === '-' ? -units : units
}

export function formatMoneyUnits(value: bigint): string {
  const negative = value < 0n
  const absolute = negative ? -value : value
  const cents = (absolute + 50n) / 100n
  const whole = cents / 100n
  const fraction = String(cents % 100n).padStart(2, '0')
  const grouped = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(whole)
  return (negative ? '−' : '') + grouped + ',' + fraction
}

export function localDateKey(date = new Date()): string {
  return String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}

export function projectionDateKey(value?: string | null): string | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return localDateKey(date)
}

function shiftDate(value: string, days: number): string {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day + days, 12)
  return localDateKey(date)
}

function monthKey(value: string, offset: number): string {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1, 12)
  return String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0')
}

function monthBounds(month: string): { first: string; last: string; days: number } {
  const [year, monthNumber] = month.split('-').map(Number)
  const days = new Date(year, monthNumber, 0).getDate()
  const prefix = String(year) + '-' + String(monthNumber).padStart(2, '0')
  return { first: prefix + '-01', last: prefix + '-' + String(days).padStart(2, '0'), days }
}

function addFlow(map: DailyMap<DailyFlow>, date: string, nature: 'INCOME' | 'EXPENSE', amount: bigint) {
  const flow = map.get(date) ?? { income: 0n, expenses: 0n }
  if (nature === 'INCOME') flow.income += amount
  else flow.expenses += amount
  map.set(date, flow)
}

function addNet(map: DailyMap<bigint>, date: string, amount: bigint) {
  map.set(date, (map.get(date) ?? 0n) + amount)
}

function accountIdForEntry(entry: FinancialEntry, operation: Operation): number | null {
  return entry.account?.id ?? entry.account_id ?? operation.account?.id ?? operation.account_id ?? null
}

function signedEntryAmount(entry: FinancialEntry, amount: bigint): bigint | null {
  if (entry.effect === 'INCREASE') return amount
  if (entry.effect === 'DECREASE') return -amount
  return null
}

function isCashAccount(account: Account): boolean {
  // WALLET is a cash-equivalent account; credit cards are not financial accounts here.
  return account.account_type === 'BANK' || account.account_type === 'CASH' || account.account_type === 'WALLET'
}

function operationDate(operation: Operation): string | null {
  const value = operation.state === 'PENDING' ? operation.planned_at : operation.effective_at ?? operation.planned_at
  return projectionDateKey(value)
}

function positiveAmount(value: string): bigint | null {
  const units = parseMoneyUnits(value)
  return units === null ? null : units < 0n ? -units : units
}

export function buildFinancialRouteProjection(
  operations: Operation[],
  accounts: Account[],
  invoices: CardInvoice[],
  firstMonth: string,
  monthCount = 3,
  referenceDate = new Date(),
): FinancialRouteProjection {
  const today = localDateKey(referenceDate)
  const accountIds = new Set(accounts.filter(isCashAccount).map((account) => account.id))
  const actualNetByDate: DailyMap<bigint> = new Map()
  const actualFlowByDate: DailyMap<DailyFlow> = new Map()
  const plannedFlowByDate: DailyMap<DailyFlow> = new Map()
  const plannedNetByDate: DailyMap<bigint> = new Map()
  const operationsByDate: DailyMap<Operation[]> = new Map()
  const invoicesByDate: DailyMap<CardInvoice[]> = new Map()
  const overdueItems: RouteOverdueItem[] = []
  let referenceBalance = 0n
  let referenceBalanceValid = true

  for (const operation of operations) {
    if (operation.state === 'CANCELLED') continue

    if (operation.state === 'PENDING' && (operation.operation_type === 'EXPENSE' || operation.operation_type === 'INCOME')) {
      const date = projectionDateKey(operation.planned_at)
      const amount = positiveAmount(operation.amount)
      if (date && amount !== null) {
        if (date >= today) {
          addFlow(plannedFlowByDate, date, operation.operation_type, amount)
          addNet(plannedNetByDate, date, operation.operation_type === 'INCOME' ? amount : -amount)
          const dayOperations = operationsByDate.get(date) ?? []
          dayOperations.push(operation)
          operationsByDate.set(date, dayOperations)
        } else {
          overdueItems.push({
            id: 'operation-' + operation.id,
            date,
            label: operation.description?.trim() || (operation.operation_type === 'INCOME' ? 'Ganho pendente' : 'Gasto pendente'),
            amount,
            nature: operation.operation_type,
            operation,
          })
        }
      }
    }

    for (const entry of operation.entries ?? []) {
      if (entry.state !== 'REALIZED') continue
      const accountId = accountIdForEntry(entry, operation)
      if (accountId === null || !accountIds.has(accountId)) continue
      const date = projectionDateKey(entry.effective_at ?? operation.effective_at)
      const amount = parseMoneyUnits(entry.amount)
      if (!date || amount === null) {
        referenceBalanceValid = false
        continue
      }
      const signed = signedEntryAmount(entry, amount)
      if (signed === null) {
        referenceBalanceValid = false
        continue
      }
      if (date <= today) {
        referenceBalance += signed
        addNet(actualNetByDate, date, signed)
      }
      if (date <= today && operation.operation_type !== 'TRANSFER' && operation.operation_type !== 'ACCOUNT_OPENING_BALANCE') {
        addFlow(actualFlowByDate, date, entry.effect === 'INCREASE' ? 'INCOME' : 'EXPENSE', amount)
      }
    }

    if ((operation.state === 'REALIZED' || operation.state === 'PARTIAL') &&
      (operation.operation_type === 'INCOME' || operation.operation_type === 'EXPENSE' || operation.operation_type === 'TRANSFER')) {
      const date = operationDate(operation)
      if (date && date <= today) {
        const dayOperations = operationsByDate.get(date) ?? []
        if (!dayOperations.some((item) => item.id === operation.id)) dayOperations.push(operation)
        operationsByDate.set(date, dayOperations)
      }
    }
  }

  const invoiceIds = new Set<number>()
  for (const invoice of invoices) {
    if (invoiceIds.has(invoice.id)) continue
    invoiceIds.add(invoice.id)
    const dueDate = projectionDateKey(invoice.due_date)
    const amount = positiveAmount(invoice.summary.open_amount)
    if (!dueDate || amount === null || amount === 0n) continue
    if (dueDate < today) {
      overdueItems.push({
        id: 'invoice-' + invoice.id,
        date: dueDate,
        label: (invoice.card?.name ? invoice.card.name + ' · ' : '') + 'Fatura vencida',
        amount,
        nature: 'EXPENSE',
        invoice,
      })
      continue
    }
    const dayInvoices = invoicesByDate.get(dueDate) ?? []
    dayInvoices.push(invoice)
    invoicesByDate.set(dueDate, dayInvoices)
    addFlow(plannedFlowByDate, dueDate, 'EXPENSE', amount)
    addNet(plannedNetByDate, dueDate, -amount)
  }

  const overdueTotal = overdueItems.reduce((total, item) => total + (item.nature === 'EXPENSE' ? item.amount : 0n), 0n)
  const firstBounds = monthBounds(firstMonth)
  const lastMonth = monthKey(firstMonth, monthCount - 1)
  const lastBounds = monthBounds(lastMonth)
  const timelineStart = firstBounds.first < today ? firstBounds.first : today
  const timelineEnd = lastBounds.last > today ? lastBounds.last : today
  const balanceByDate: DailyMap<bigint | null> = new Map()

  if (!referenceBalanceValid) referenceBalance = 0n
  if (referenceBalanceValid) {
    let historicalSuffix = actualNetByDate.get(today) ?? 0n
    let date = shiftDate(today, -1)
    while (date >= timelineStart) {
      balanceByDate.set(date, referenceBalance - historicalSuffix)
      historicalSuffix += actualNetByDate.get(date) ?? 0n
      date = shiftDate(date, -1)
    }
    const todayBalance = referenceBalance + (plannedNetByDate.get(today) ?? 0n)
    balanceByDate.set(today, todayBalance)
    date = shiftDate(today, 1)
    let runningBalance = todayBalance
    while (date <= timelineEnd) {
      runningBalance += plannedNetByDate.get(date) ?? 0n
      balanceByDate.set(date, runningBalance)
      date = shiftDate(date, 1)
    }
  } else {
    let date = timelineStart
    while (date <= timelineEnd) {
      balanceByDate.set(date, null)
      date = shiftDate(date, 1)
    }
  }

  function balanceAt(date: string): bigint | null {
    const existing = balanceByDate.get(date)
    if (existing !== undefined) return existing
    if (!referenceBalanceValid) return null
    if (date < today) {
      let netAfter = 0n
      let cursor = shiftDate(date, 1)
      while (cursor <= today) {
        netAfter += actualNetByDate.get(cursor) ?? 0n
        cursor = shiftDate(cursor, 1)
      }
      return referenceBalance - netAfter
    }
    return null
  }

  const months: RouteMonth[] = []
  for (let index = 0; index < monthCount; index += 1) {
    const month = monthKey(firstMonth, index)
    const bounds = monthBounds(month)
    const days: RouteDay[] = []
    let incomeTotal = 0n
    let expensesTotal = 0n
    for (let day = 1; day <= bounds.days; day += 1) {
      const date = bounds.first.slice(0, 8) + String(day).padStart(2, '0')
      const actual = actualFlowByDate.get(date) ?? { income: 0n, expenses: 0n }
      const planned = date >= today ? plannedFlowByDate.get(date) ?? { income: 0n, expenses: 0n } : { income: 0n, expenses: 0n }
      const flow = { income: actual.income + planned.income, expenses: actual.expenses + planned.expenses }
      const dayOperations = operationsByDate.get(date) ?? []
      const dayInvoices = invoicesByDate.get(date) ?? []
      incomeTotal += flow.income
      expensesTotal += flow.expenses
      days.push({ date, income: flow.income, expenses: flow.expenses, balance: balanceAt(date), operations: dayOperations, invoices: dayInvoices })
    }
    const previousDate = shiftDate(bounds.first, -1)
    months.push({
      month,
      days,
      totals: { income: incomeTotal, expenses: expensesTotal },
      openingBalance: balanceAt(previousDate),
      endingBalance: balanceAt(bounds.last),
    })
  }

  return { months, referenceBalance: referenceBalanceValid ? referenceBalance : null, overdueItems, overdueTotal }
}
