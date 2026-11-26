import { createContext } from 'react'
import type { ThemeMode } from './types'

export type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

export const THEME_STORAGE_KEY = 'orbe.theme'

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => undefined,
})
