import { createContext } from 'react'
import type { CurrencySymbol } from './types'

export type CurrencyContextValue = {
  symbol: CurrencySymbol
  setSymbol: (symbol: CurrencySymbol) => void
}

export const CurrencyContext = createContext<CurrencyContextValue>({
  symbol: '€',
  setSymbol: () => undefined,
})

export const CURRENCY_STORAGE_KEY = 'orbe.currency.symbol'
export const ALLOWED_CURRENCY_SYMBOLS: readonly CurrencySymbol[] = ['€', '$', '£', '¥', 'CN¥', 'CHF', 'CA$', 'A$', 'R$', '₹']
