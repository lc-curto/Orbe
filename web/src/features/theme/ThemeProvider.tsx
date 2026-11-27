import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, THEME_STORAGE_KEY } from './themeContext'
import type { ThemeMode } from './types'

function readSavedTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'
  } catch {
    return 'system'
  }
}

function resolveTheme(theme: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  return theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(readSavedTheme)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const resolvedTheme = resolveTheme(theme, media.matches)
      root.dataset.theme = resolvedTheme
      root.style.colorScheme = resolvedTheme
    }

    applyTheme()
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // A preferência mantém-se na sessão se o armazenamento local estiver indisponível.
    }

    if (theme !== 'system') return
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
