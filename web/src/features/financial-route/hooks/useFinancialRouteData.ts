import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../api/client'
import { fetchFinancialRouteReadModel } from '../../../api/finance'
import type { CardInvoice, FinancialRouteMonthReadModel, FinancialRouteReadModel, Operation } from '../../../api/types'
import type { RouteDay, RouteMonth, RouteProjection } from '../types'
import { shiftMonth } from '../utils'
import { formatMoneyUnits, parseMoneyUnits } from '../projection'

type RouteDataState = {
  month: string | null
  visibleCount: number | null
  operations: Operation[] | null
  invoices: CardInvoice[] | null
  response: FinancialRouteReadModel | null
  loading: boolean
  error: string | null
}

type CachedMonth = {
  month: FinancialRouteMonthReadModel
  referenceDate: string
  referenceBalance: string | null
  overdueItems: FinancialRouteReadModel['overdue_items']
  overdueTotal: string
  loadedAt: number
}

const MONTH_CACHE_TTL_MS = 60_000
const monthCache = new Map<string, CachedMonth>()
let cacheOperations: Operation[] | null = null
let cacheInvoices: CardInvoice[] | null = null

function invalidateMonthCacheIfFinanceChanged(operations: Operation[], invoices: CardInvoice[]) {
  if (cacheOperations !== operations || cacheInvoices !== invoices) {
    monthCache.clear()
    cacheOperations = operations
    cacheInvoices = invoices
  }
}

function isCached(month: string): boolean {
  const cached = monthCache.get(month)
  if (!cached) return false
  if (Date.now() - cached.loadedAt > MONTH_CACHE_TTL_MS) {
    monthCache.delete(month)
    return false
  }
  return true
}

function cachedResponse(month: string, count: number): FinancialRouteReadModel | null {
  const months = Array.from({ length: count }, (_, index) => shiftMonth(month, index))
  if (!months.every(isCached)) return null
  const first = monthCache.get(month)
  if (!first) return null
  return {
    reference_date: first.referenceDate,
    reference_balance: first.referenceBalance,
    months: months.map((key) => monthCache.get(key)!.month),
    overdue_items: first.overdueItems,
    overdue_total: first.overdueTotal,
  }
}

function storeResponse(response: FinancialRouteReadModel) {
  const loadedAt = Date.now()
  response.months.forEach((month) => {
    monthCache.set(month.month, {
      month,
      referenceDate: response.reference_date,
      referenceBalance: response.reference_balance,
      overdueItems: response.overdue_items,
      overdueTotal: response.overdue_total,
      loadedAt,
    })
  })
}

function overdueSignedUnits(item: FinancialRouteReadModel['overdue_items'][number]): bigint {
  const units = parseMoneyUnits(item.amount)
  if (units === null) return 0n
  const absolute = units < 0n ? -units : units
  return item.nature === 'INCOME' ? absolute : -absolute
}

function sumOverdueBefore(items: FinancialRouteReadModel['overdue_items'], date: string): bigint {
  return items.reduce((total, item) => item.date !== null && item.date < date ? total + overdueSignedUnits(item) : total, 0n)
}

function sumOverdueThrough(items: FinancialRouteReadModel['overdue_items'], date: string): bigint {
  return items.reduce((total, item) => item.date !== null && item.date <= date ? total + overdueSignedUnits(item) : total, 0n)
}

function sumOverdueOnDate(items: FinancialRouteReadModel['overdue_items'], date: string, nature: 'INCOME' | 'EXPENSE'): bigint {
  return items.reduce((total, item) => {
    if (item.date !== date || item.nature !== nature) return total
    const units = parseMoneyUnits(item.amount)
    if (units === null) return total
    return total + (units < 0n ? -units : units)
  }, 0n)
}

function sumOverdueBetween(items: FinancialRouteReadModel['overdue_items'], start: string, endExclusive: string, nature?: 'INCOME' | 'EXPENSE'): bigint {
  return items.reduce((total, item) => {
    if (item.date === null || item.date < start || item.date >= endExclusive || (nature && item.nature !== nature)) return total
    const units = parseMoneyUnits(item.amount)
    if (units === null) return total
    const absolute = units < 0n ? -units : units
    return total + absolute
  }, 0n)
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Não foi possível carregar a projeção financeira.'
}

export function useFinancialRouteData(
  month: string,
  operations: Operation[],
  invoices: CardInvoice[],
  visibleCount: number,
  prefetchCount: number,
) {
  const [refreshTick, setRefreshTick] = useState(0)
  const [state, setState] = useState<RouteDataState>({
    month: null,
    visibleCount: null,
    operations: null,
    invoices: null,
    response: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') setRefreshTick((tick) => tick + 1)
    }
    const intervalId = window.setInterval(refresh, MONTH_CACHE_TTL_MS)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  useEffect(() => {
    invalidateMonthCacheIfFinanceChanged(operations, invoices)
    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      try {
        let visibleResponse = cachedResponse(month, visibleCount)
        if (!visibleResponse) {
          const response = await fetchFinancialRouteReadModel(month, controller.signal, visibleCount)
          if (controller.signal.aborted) return
          storeResponse(response)
          visibleResponse = cachedResponse(month, visibleCount) ?? response
        }

        if (!cancelled) {
          setState({ month, visibleCount, operations, invoices, response: visibleResponse, loading: false, error: null })
        }

        if (prefetchCount > 0) {
          const prefetchMonth = shiftMonth(month, visibleCount)
          if (!cachedResponse(prefetchMonth, prefetchCount)) {
            try {
              const response = await fetchFinancialRouteReadModel(prefetchMonth, controller.signal, prefetchCount)
              if (!controller.signal.aborted) storeResponse(response)
            } catch {
              // A falha no pré-carregamento não deve ocultar o mês visível já carregado.
            }
          }
        }
      } catch (error) {
        if (!controller.signal.aborted && !cancelled) {
          setState({ month, visibleCount, operations, invoices, response: null, loading: false, error: messageFor(error) })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [month, visibleCount, prefetchCount, operations, invoices, refreshTick])

  const stateMatchesRequest = state.month === month
    && state.visibleCount === visibleCount
    && state.operations === operations
    && state.invoices === invoices
  const response = stateMatchesRequest ? state.response : null
  const projection = useMemo<RouteProjection | null>(() => {
    if (!response) return null
    const operationById = new Map(operations.map((operation) => [operation.id, operation]))
    const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]))
    const months: RouteMonth[] = response.months.map((monthData) => {
      const days: RouteDay[] = monthData.days.map((day) => {
        const overdueItems = response.overdue_items.filter((item) => item.date === day.date)
        const overdueOperationIds = overdueItems.flatMap((item) => item.operation_id === null ? [] : [item.operation_id])
        const overdueInvoiceIds = overdueItems.flatMap((item) => item.invoice_id === null ? [] : [item.invoice_id])
        const operationIds = [...new Set([...day.operation_ids, ...overdueOperationIds])]
        const invoiceIds = [...new Set([...day.invoice_ids, ...overdueInvoiceIds])]
        return {
          date: day.date,
          income: formatMoneyUnits((parseMoneyUnits(day.income) ?? 0n) + sumOverdueOnDate(response.overdue_items, day.date, 'INCOME')),
          expenses: formatMoneyUnits((parseMoneyUnits(day.expenses) ?? 0n) + sumOverdueOnDate(response.overdue_items, day.date, 'EXPENSE')),
          balance: day.balance === null ? null : formatMoneyUnits((parseMoneyUnits(day.balance) ?? 0n) + sumOverdueThrough(response.overdue_items, day.date)),
          operations: operationIds.map((id) => operationById.get(id)).filter((operation): operation is Operation => operation !== undefined),
          invoices: invoiceIds.map((id) => invoiceById.get(id)).filter((invoice): invoice is CardInvoice => invoice !== undefined),
          overdueItems,
        }
      })
      return {
        month: monthData.month,
        days,
        totals: {
          income: formatMoneyUnits((parseMoneyUnits(monthData.totals.income) ?? 0n) + sumOverdueBetween(response.overdue_items, monthData.month + '-01', shiftMonth(monthData.month, 1) + '-01', 'INCOME')),
          expenses: formatMoneyUnits((parseMoneyUnits(monthData.totals.expenses) ?? 0n) + sumOverdueBetween(response.overdue_items, monthData.month + '-01', shiftMonth(monthData.month, 1) + '-01', 'EXPENSE')),
        },
        openingBalance: monthData.opening_balance === null ? null : formatMoneyUnits((parseMoneyUnits(monthData.opening_balance) ?? 0n) + sumOverdueBefore(response.overdue_items, monthData.month + '-01')),
        endingBalance: monthData.ending_balance === null ? null : formatMoneyUnits((parseMoneyUnits(monthData.ending_balance) ?? 0n) + sumOverdueBefore(response.overdue_items, shiftMonth(monthData.month, 1) + '-01')),
      }
    })
    return {
      referenceDate: response.reference_date,
      referenceBalance: response.reference_balance,
      months,
      overdueItems: response.overdue_items,
      overdueTotal: response.overdue_total,
    }
  }, [response, operations, invoices])

  return {
    projection,
    loading: !stateMatchesRequest || state.loading,
    error: stateMatchesRequest ? state.error : null,
  }
}
