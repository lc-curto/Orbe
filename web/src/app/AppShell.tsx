import type { ReactNode } from 'react'

type AppShellProps = { children: ReactNode }

/** Estrutura global partilhada pela aplicação web. */
export function AppShell({ children }: AppShellProps) {
  return <div className="app-shell">{children}</div>
}
