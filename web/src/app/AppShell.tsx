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

type DesktopPageFrameProps = { children: ReactNode }

/** Shared desktop content frame used by every authenticated feature page. */
export function DesktopPageFrame({ children }: DesktopPageFrameProps) {
  return <div className="desktop-page-content">{children}</div>
}
