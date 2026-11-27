import { Button, Card as UiCard, Separator, Text, Row, Stack } from '../../../design-system/primitives'
import { Button, Card as UiCard, Separator, Text, Row, Stack } from '../../../design-system/primitives'
import type { Card as FinancialCard, CardInvoice } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { AppIcon, type AppIconName } from '../../../shared/components/AppIcon'
import { formatCurrency } from '../../currency/formatCurrency'
import type { CurrencySymbol } from '../../currency/types'
type DashboardMovement = { icon: AppIconName; name: string; meta: string; amount: string; tone: string; iconColor: string }

const border = { borderWidth: 1, borderColor: '#e4e7ec' as const }

function formatMoney(amount: string, symbol: CurrencySymbol): string {
  return formatCurrency(amount, symbol)
}

export function MobileDashboard({ period, month, onMonthChange, card, invoice, setActiveKey, userName, currencySymbol, movements, categories }: {
  period: { label: string; shortLabel: string; date: string; income: string; expenses: string }
  month: string
  onMonthChange: (month: string) => void
  card?: FinancialCard
  invoice?: CardInvoice
  setActiveKey: (value: string) => void
  categories: Array<{ name: string; amount: string; percentage: number }>
  userName: string
  currencySymbol: CurrencySymbol
  movements: DashboardMovement[]
}) {

  return (
    <Stack className="mobile-dashboard" backgroundColor="#f7f9fc" minHeight="100vh">
      <Stack className="mobile-dashboard-content" gap={16}>
        <Row className="mobile-dashboard-header" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Stack className="mobile-dashboard-greeting" flex={1} minWidth={0} gap={4}>
            <Text className="mobile-dashboard-greeting-text" color="#101828" fontWeight="800" numberOfLines={1}>Bom dia, {userName.split(' ')[0]}</Text>
            <Text className="mobile-dashboard-date" color="#667085" fontSize={13}>{period.date}</Text>
          </Stack>
          <MonthSelector month={month} onMonthChange={onMonthChange} className="dashboard-month-selector" />
        </Row>
        <UiCard className="mobile-balance-card" borderRadius={18} padding={18} backgroundColor="#175cd3" borderWidth={0}>
          <Stack gap={12}>
            <Text color="#dbeafe" fontSize={11} fontWeight="800" letterSpacing={1}>SALDO DISPONÍVEL</Text>
            <Text color="#ffffff" fontSize={28} fontWeight="800">Indisponível</Text>
            <Text color="#dbeafe" fontSize={12}>O read model atual não fornece saldo de contas.</Text>
            <Separator borderColor="rgba(255,255,255,0.24)" />
            <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between' }}>{[['Ganhos', period.income], ['Gastos', period.expenses]].map(([label, value]) => <Stack key={label} gap={3} flex={1}><Text color="#dbeafe" fontSize={11}>{label}</Text><Text color="#ffffff" fontSize={13} fontWeight="800">{value}</Text></Stack>)}</Row>
          </Stack>
        </UiCard>
        <UiCard {...border} borderRadius={16} padding={16} backgroundColor="#ffffff">
          <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={12}>
            <Text color="#101828" fontSize={16} fontWeight="800">Gastos por categoria</Text>
            <Button className="dashboard-card-view-all" onPress={() => setActiveKey('Movimentos')} borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="#087f70" fontSize={12} fontWeight="700">Ver movimentos</Button>
          </Row>
          <Stack gap={12}>
            {categories.length === 0 ? <Text color="#667085" fontSize={13} paddingVertical={12}>Sem despesas realizadas neste mês.</Text> : categories.map((category) => <Stack key={category.name} gap={5}>
              <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between' }}><Text color="#475467" fontSize={12}>{category.name}</Text><Text color="#101828" fontSize={12} fontWeight="700">{category.amount}</Text></Row>
              <Stack height={5} borderRadius={99} backgroundColor="#e6f0ff"><Stack width={String(category.percentage) + '%'} height={5} borderRadius={99} backgroundColor="#175cd3" /></Stack>
            </Stack>)}
          </Stack>
        </UiCard>
        <UiCard {...border} borderRadius={16} padding={16} backgroundColor="#ffffff"><Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={10}><Text color="#101828" fontSize={16} fontWeight="800">Cartões</Text><Button className="dashboard-card-view-all" onPress={() => setActiveKey('Cartões')} borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="#087f70" fontSize={12} fontWeight="700">Ver todos</Button></Row>{invoice ? <Row padding={12} borderRadius={12} backgroundColor="#f7f9fc" style={{ justifyContent: 'space-between', alignItems: 'center' }}><Stack gap={3}><Text color="#667085" fontSize={11}>{card?.name ?? invoice.card?.name ?? 'Fatura do cartão'}</Text><Text color="#101828" fontSize={19} fontWeight="800">{formatMoney(invoice.summary.open_amount, currencySymbol)}</Text></Stack><Text color="#087f70" backgroundColor="#e6f4f1" borderRadius={99} paddingHorizontal={9} paddingVertical={5} fontSize={11} fontWeight="700">{invoice.cycle_state}</Text></Row> : card ? <Text color="#667085" fontSize={13}>{card.name} · sem faturas disponíveis.</Text> : <Text color="#667085" fontSize={13}>Sem cartões disponíveis.</Text>}</UiCard>
        <UiCard {...border} borderRadius={16} padding={16} backgroundColor="#ffffff">
          <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={10}>
            <Text color="#101828" fontSize={16} fontWeight="800">Últimos movimentos</Text>
            <Button className="dashboard-card-view-all" onPress={() => setActiveKey('Movimentos')} borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="#087f70" fontSize={12} fontWeight="700">Ver todos</Button>
          </Row>
          <Stack>
            {movements.length === 0 ? <Text color="#667085" fontSize={13} paddingVertical={16}>Sem movimentos disponíveis.</Text> : movements.map((movement, index) => <Stack key={movement.name}>
              <Row paddingVertical={12} gap={10} style={{ alignItems: 'center' }}>
                <Stack width={34} height={34} borderRadius={12} backgroundColor="#f2f4f7" style={{ alignItems: 'center', justifyContent: 'center' }}><AppIcon name={movement.icon} size={16} color={movement.iconColor} /></Stack>
                <Stack flex={1} gap={3}><Text color="#101828" fontSize={13} fontWeight="700">{movement.name}</Text><Text color="#667085" fontSize={11}>{movement.meta}</Text></Stack>
                <Text color={movement.tone} fontSize={12} fontWeight="700">{movement.amount}</Text>
              </Row>
              {index < movements.length - 1 ? <Separator /> : null}
            </Stack>)}
          </Stack>
        </UiCard>
      </Stack>
    </Stack>
  )
}
