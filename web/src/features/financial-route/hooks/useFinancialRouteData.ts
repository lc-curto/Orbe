import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../api/client'
import { fetchFinancialRouteReadModel } from '../../../api/finance'
import type { CardInvoice, FinancialRouteMonthReadModel, FinancialRouteReadModel, Operation } from '../../../api/types'
import type { RouteDay, RouteMonth, RouteProjection } from '../types'
import { shiftMonth } from '../utils'

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
  }, [month, visibleCount, prefetchCount, operations, invoices])

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
      const days: RouteDay[] = monthData.days.map((day) => ({
        date: day.date,
        income: day.income,
        expenses: day.expenses,
        balance: day.balance,
        operations: day.operation_ids.map((id) => operationById.get(id)).filter((operation): operation is Operation => operation !== undefined),
        invoices: day.invoice_ids.map((id) => invoiceById.get(id)).filter((invoice): invoice is CardInvoice => invoice !== undefined),
      }))
      return {
        month: monthData.month,
        days,
        totals: monthData.totals,
        openingBalance: monthData.opening_balance,
        endingBalance: monthData.ending_balance,
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
