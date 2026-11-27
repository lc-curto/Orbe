import type { ReactNode } from 'react'
import { AppIcon } from './AppIcon'
import { useTheme } from '../../features/theme/useTheme'

type PageHeaderProps = {
  title: string
  description?: string
  titleId?: string
  className?: string
  actions?: ReactNode
  period?: ReactNode
  mobilePeriod?: ReactNode
}

/** Shared page heading and responsive actions, including the cross-page theme control. */
export function PageHeader({ title, titleId, className = '', actions, period, mobilePeriod }: PageHeaderProps) {
  const { setTheme } = useTheme()

  function toggleTheme() {
    const resolvedTheme = document.documentElement.dataset.theme
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const isDark = document.documentElement.dataset.theme === 'dark'

  return <header className={`orbe-page-header ${className}`}>
    <div className="orbe-page-header-copy">
      <h1 id={titleId}>{title}</h1>
    </div>
    <div className="orbe-page-header-actions">
      <button
        className="orbe-page-theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        title={isDark ? 'Tema claro' : 'Tema escuro'}
      >
        <AppIcon name={isDark ? 'sun' : 'moon'} size={18} />
      </button>
      {actions}
      {period ? <div className="orbe-page-header-desktop-period">{period}</div> : null}
    </div>
    {(mobilePeriod ?? period) ? <div className="orbe-page-header-period">{mobilePeriod ?? period}</div> : null}
  </header>
}
