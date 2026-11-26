import { Text, XStack, YStack } from 'tamagui'
import { OrbeCard } from '../../../design-system/components'
import { orbe } from '../../../design-system/tokens'
import type { DebtListItem } from '../types'

type Props = { debts: DebtListItem[] | null }

function amount(value: string | number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function money(value: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

export function DebtKpis({ debts }: Props) {
  const available = debts !== null
  const activeDebts = debts?.filter((debt) => debt.status === 'ACTIVE') ?? []
  const totalOpen = activeDebts.reduce((sum, debt) => sum + amount(debt.openBalance), 0)
  const monthlyPayments = activeDebts.reduce((sum, debt) => sum + amount(debt.monthlyPayment), 0)

  const metrics = [
    { label: 'Total em aberto', value: available ? money(totalOpen) : '—', description: 'Valor por liquidar' },
    { label: 'Dívidas ativas', value: available ? String(activeDebts.length) : '—', description: 'Obrigações em curso' },
    { label: 'Prestações mensais', value: available ? money(monthlyPayments) : '—', description: 'Total mensal previsto' },
  ]

  return <XStack className="debts-kpi-grid" gap={orbe.space.md} flexWrap="wrap">
    {metrics.map((metric, index) => <OrbeCard key={metric.label} className={index === 0 ? 'debts-kpi-card debts-kpi-primary' : 'debts-kpi-card'}>
      <YStack gap={8}>
        <Text className="debts-kpi-label" color={orbe.colors.textMuted} fontSize={orbe.typography.label} fontWeight="700">{metric.label}</Text>
        <Text className="debts-kpi-value" color={orbe.colors.text} fontSize={index === 0 ? 30 : 25} fontWeight="800" fontVariant="tabular-nums">{metric.value}</Text>
        <Text color={orbe.colors.textMuted} fontSize={12}>{metric.description}</Text>
      </YStack>
    </OrbeCard>)}
  </XStack>
}
