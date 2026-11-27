import type { CurrencySymbol } from './types'

/** Formata o número original e acrescenta apenas o símbolo escolhido; não converte valores. */
export function formatCurrency(value: string | number, symbol: CurrencySymbol = '€'): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Object.is(amount, -0) ? 0 : amount)
  return `${formatted} ${symbol}`
}
