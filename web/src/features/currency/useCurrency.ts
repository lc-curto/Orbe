import { useContext } from 'react'
import { CurrencyContext } from './currencyContext'

export function useCurrency() {
  return useContext(CurrencyContext)
}
