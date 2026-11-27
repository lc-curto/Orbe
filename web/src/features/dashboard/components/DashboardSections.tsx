import { Button, Card, Separator, Text, Row, Stack } from '../../../design-system/primitives'
import type { Card as FinancialCard, CardInvoice } from '../../../api/types'
import { AppIcon, type AppIconName } from '../../../shared/components/AppIcon'
import { formatCurrency } from '../../currency/formatCurrency'
import type { CurrencySymbol } from '../../currency/types'

export type DashboardMovement = {
  icon: AppIconName
  name: string
  meta: string
  amount: string
  tone: string
  iconColor: string
}

type DashboardCategory = { name: string; amount: string; percentage: number }

type DashboardSectionsProps = {
  periodLabel: string
  categories: DashboardCategory[]
  loading: boolean
  card?: FinancialCard
  invoice?: CardInvoice
  currencySymbol: CurrencySymbol
  movements: DashboardMovement[]
  setActiveKey: (value: string) => void
}

const border = { borderWidth: 1, borderColor: 'var(--orbe-border)' as const }

export function DashboardSections({
  periodLabel,
  categories,
  loading,
  card,
  invoice,
  currencySymbol,
  movements,
  setActiveKey,
}: DashboardSectionsProps) {
  const cardName = invoice?.card?.name ?? card?.name

  return (
    <>
      <Card className="dashboard-shared-card dashboard-categories-card" {...border} backgroundColor="var(--orbe-surface)">
        <Row className="dashboard-card-header" style={{ alignItems: 'center', justifyContent: 'space-between' }} gap={12}>
          <Stack gap={3} minWidth={0}>
            <Text className="dashboard-shared-card-title" fontWeight="700">Gastos por categoria</Text>
            <Text className="dashboard-shared-card-subtitle" color="var(--orbe-muted)">Distribuição dos gastos em {periodLabel}</Text>
          </Stack>
          <Button className="dashboard-card-view-all" onPress={() => setActiveKey('Movimentos')} borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="var(--orbe-teal)" fontWeight="700">Ver movimentos</Button>
        </Row>
        {loading ? (
          <Text className="dashboard-shared-state" color="var(--orbe-muted)">A carregar despesas por categoria…</Text>
        ) : categories.length === 0 ? (
          <Text className="dashboard-shared-state" color="var(--orbe-muted)">Sem despesas realizadas neste mês.</Text>
        ) : (
          <div className="dashboard-category-grid">
            {categories.map((category) => (
              <div className="dashboard-category-item" key={category.name}>
                <Row className="dashboard-card-header" style={{ alignItems: 'baseline', justifyContent: 'space-between' }} gap={8}>
                  <Text className="dashboard-category-name" color="var(--orbe-text)">{category.name}</Text>
                  <Text className="dashboard-category-amount" color="var(--orbe-text)" fontWeight="700">{category.amount}</Text>
                </Row>
                <div className="dashboard-category-track" aria-label={category.name}>
                  <span style={{ width: String(category.percentage) + '%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="dashboard-shared-card dashboard-cards-card" {...border} backgroundColor="var(--orbe-surface)">
        <Row className="dashboard-card-header" style={{ alignItems: 'center', justifyContent: 'space-between' }} gap={12}>
          <Text className="dashboard-shared-card-title" fontWeight="700">Cartões</Text>
          <Button className="dashboard-card-view-all" onPress={() => setActiveKey('Cartões')} borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="var(--orbe-teal)" fontWeight="700">Ver todos</Button>
        </Row>
        {invoice ? (
          <Row className="dashboard-card-preview" style={{ alignItems: 'center', justifyContent: 'space-between' }} gap={12}>
            <Stack gap={4} minWidth={0}>
              <Text className="dashboard-card-preview-name" color="var(--orbe-muted)">{cardName ?? 'Fatura do cartão'}</Text>
              <Text className="dashboard-card-preview-amount" fontWeight="800">{formatCurrency(invoice.summary.open_amount, currencySymbol)}</Text>
              <Text className="dashboard-card-preview-meta" color="var(--orbe-muted)">Em aberto · {invoice.cycle_state}</Text>
            </Stack>
          </Row>
        ) : card ? (
          <Text className="dashboard-shared-state" color="var(--orbe-muted)">{card.name} · sem faturas disponíveis.</Text>
        ) : (
          <Text className="dashboard-shared-state" color="var(--orbe-muted)">Sem cartões disponíveis.</Text>
        )}
      </Card>

      <Card className="dashboard-shared-card dashboard-recent-card" {...border} backgroundColor="var(--orbe-surface)">
        <Row className="dashboard-card-header" style={{ alignItems: 'center', justifyContent: 'space-between' }} gap={12}>
          <Text className="dashboard-shared-card-title" fontWeight="700">Últimos movimentos</Text>
          <Button className="dashboard-card-view-all" onPress={() => setActiveKey('Movimentos')} borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="var(--orbe-teal)" fontWeight="700">Ver todos</Button>
        </Row>
        {movements.length === 0 ? (
          <Text className="dashboard-shared-state" color="var(--orbe-muted)">Sem movimentos disponíveis.</Text>
        ) : (
          <Stack className="dashboard-recent-list">
            {movements.map((movement, index) => (
              <Stack key={movement.name + movement.meta + index}>
                <Row className="dashboard-recent-row" style={{ alignItems: 'center' }} gap={12}>
                  <span className="dashboard-recent-icon" style={{ color: movement.iconColor }}><AppIcon name={movement.icon} size={17} color={movement.iconColor} /></span>
                  <Stack className="dashboard-recent-copy" gap={4} flex={1} minWidth={0}>
                    <Text className="dashboard-recent-name" fontWeight="700">{movement.name}</Text>
                    <Text className="dashboard-recent-meta" color="var(--orbe-muted)">{movement.meta}</Text>
                  </Stack>
                  <Text className="dashboard-recent-amount" color={movement.tone} fontWeight="700">{movement.amount}</Text>
                </Row>
                {index < movements.length - 1 ? <Separator /> : null}
              </Stack>
            ))}
          </Stack>
        )}
      </Card>
    </>
  )
}
