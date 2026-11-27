import { useEffect, useState, type ReactNode } from 'react'
import { CurrencyContext, CURRENCY_STORAGE_KEY, ALLOWED_CURRENCY_SYMBOLS } from './currencyContext'
import type { CurrencySymbol } from './types'

function readSavedSymbol(): CurrencySymbol {
  if (typeof window === 'undefined') return '€'
  try {
    const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    return ALLOWED_CURRENCY_SYMBOLS.includes(saved as CurrencySymbol) ? saved as CurrencySymbol : '€'
  } catch {
    return '€'
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [symbol, setSymbol] = useState<CurrencySymbol>(readSavedSymbol)

  useEffect(() => {
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, symbol)
    } catch {
      // A preferência mantém-se na sessão se o armazenamento local estiver indisponível.
    }
  }, [symbol])

  return <CurrencyContext.Provider value={{ symbol, setSymbol }}>{children}</CurrencyContext.Provider>
}
