import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../api/client'
import { fetchFinancialRouteReadModel } from '../../../api/finance'
import type { CardInvoice, FinancialRouteReadModel, Operation } from '../../../api/types'
import type { RouteDay, RouteMonth, RouteProjection } from '../types'

type RouteDataState = {
  month: string | null
  monthsCount: number | null
  operations: Operation[] | null
  invoices: CardInvoice[] | null
  response: FinancialRouteReadModel | null
  loading: boolean
  error: string | null
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return error instanceof Error ? error.message : 'Não foi possível carregar a projeção financeira.'
}

export function useFinancialRouteData(month: string, operations: Operation[], invoices: CardInvoice[], monthsCount = 24) {
  const [state, setState] = useState<RouteDataState>({
    month: null,
    monthsCount: null,
    operations: null,
    invoices: null,
    response: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    void fetchFinancialRouteReadModel(month, controller.signal, monthsCount)
      .then((response) => {
        if (!controller.signal.aborted) setState({ month, monthsCount, operations, invoices, response, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ month, monthsCount, operations, invoices, response: null, loading: false, error: messageFor(error) })
      })

    return () => controller.abort()
  }, [month, monthsCount, operations, invoices])

  const stateMatchesRequest = state.month === month && state.monthsCount === monthsCount && state.operations === operations && state.invoices === invoices
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
