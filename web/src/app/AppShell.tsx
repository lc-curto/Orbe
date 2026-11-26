import type { ReactNode } from 'react'
import { Theme, YStack } from 'tamagui'
import { useTheme } from '../features/theme/useTheme'

type AppShellProps = {
  children: ReactNode
}

/** Estrutura global partilhada por Dashboard, Movimentos e Programações. */
export function AppShell({ children }: AppShellProps) {
  const { theme } = useTheme()
  return (
    <Theme name={theme}>
      <YStack className="app-shell" flex={1} minHeight="100vh">
        {children}
      </YStack>
    </Theme>
  )
}
