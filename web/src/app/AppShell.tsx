import type { ReactNode } from 'react'
import { Theme, YStack } from 'tamagui'

type AppShellProps = {
  children: ReactNode
}

/** Estrutura global partilhada por Dashboard, Movimentos e Programações. */
export function AppShell({ children }: AppShellProps) {
  return (
    <Theme name="light">
      <YStack className="app-shell" flex={1} backgroundColor="#f8fafc" minHeight="100vh">
        {children}
      </YStack>
    </Theme>
  )
}
