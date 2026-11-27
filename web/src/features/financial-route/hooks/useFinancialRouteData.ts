import { useMemo } from 'react'
import type { Account, CardInvoice, Operation } from '../../../api/types'
import { buildFinancialRouteProjection, localDateKey } from '../projection'

export function useFinancialRouteData(
  operations: Operation[],
  accounts: Account[],
  invoices: CardInvoice[],
  firstMonth: string,
  monthCount = 3,
) {
  const referenceDateKey = localDateKey()
  return useMemo(() => buildFinancialRouteProjection(
    operations,
    accounts,
    invoices,
    firstMonth,
    monthCount,
    new Date(referenceDateKey + 'T12:00:00'),
  ), [operations, accounts, invoices, firstMonth, monthCount, referenceDateKey])
}
