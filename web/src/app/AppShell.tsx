import type { ReactNode } from 'react'

type AppShellProps = { children: ReactNode }

/** Estrutura global partilhada pela aplicação web. */
export function AppShell({ children }: AppShellProps) {
  return <div className="app-shell">{children}</div>
}

type MobilePageFrameProps = { children: ReactNode; className?: string }

/** Shared mobile page frame: consistent gutter, content width and safe-area spacing. */
export function MobilePageFrame({ children, className = '' }: MobilePageFrameProps) {
  return <div className={`mobile-page-shell ${className}`}><div className="mobile-page-content">{children}</div></div>
}
