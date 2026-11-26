/**
 * UI view model for the debt overview.
 * This is intentionally not an API contract; the financial read model is planned
 * for a later phase and must supply authoritative amounts and allocations.
 */
export type DebtListItem = {
  id: number | string
  name: string
  typeLabel: string
  openBalance: string | number
  monthlyPayment: string | number
  paidAmount: string | number
  totalAmount: string | number
  status: string
}
