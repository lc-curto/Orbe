import { Button, Card, Heading, Paragraph, Separator, Text, Row, Stack } from '../../../design-system/primitives'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { AppIcon, type AppIconName } from '../../../shared/components/AppIcon'
import type { CurrencySymbol } from '../../currency/types'
import type { Card as FinancialCard, CardInvoice } from '../../../api/types'
import { formatCurrency } from '../../currency/formatCurrency'

type DashboardMovement = {
  icon: AppIconName
  name: string
  meta: string
  amount: string
  tone: string
  iconColor: string
}

type DashboardPageProps = {
  period: { label: string; date: string }
  userName: string
  displayPeriod: { label: string; income: string; expenses: string }
  month: string
  onMonthChange: (month: string) => void
  currencySymbol: CurrencySymbol
  movements: DashboardMovement[]
  card?: FinancialCard
  invoice?: CardInvoice
  setActiveKey: (value: string) => void
  categories: Array<{ name: string; amount: string; percentage: number }>
  loading: boolean
  authError: string | null
  logoutError: string | null
}

const border = { borderWidth: 1, borderColor: '#e4e7ec' as const }
const centered = { alignItems: 'center' as const, justifyContent: 'center' as const }

function SummaryCard({ label, amount, detail, tone }: { label: string; amount: string; detail: string; tone?: string }) {
  return (
    <Card {...border} borderRadius={16} padding={20} flex={1} minWidth={0} backgroundColor="#ffffff">
      <Stack gap={8}>
        <Text color="#667085" fontSize={16}>{label}</Text>
        <Text color={tone ?? '#101828'} fontSize={28} fontWeight="800">{amount}</Text>
        <Text color="#667085" fontSize={14}>{detail}</Text>
      </Stack>
    </Card>
  )
}



export function DashboardPage({ period, userName, displayPeriod, month, onMonthChange, currencySymbol, movements, categories, loading, card, invoice, setActiveKey, authError, logoutError }: DashboardPageProps) {
  return <>
<Row className="desktop-dashboard-header" style={{ justifyContent: "space-between", alignItems: "center" }} gap={20}>
              <Stack gap={4} flex={1} minWidth={0}>
                <Heading fontSize={36} letterSpacing={-1.2}>Bom dia, {userName.split(' ')[0]}</Heading>
                <Paragraph color="#667085" margin={0}>{period.date}</Paragraph>
              </Stack>
              <MonthSelector month={month} onMonthChange={onMonthChange} className="desktop-month-selector" />
            </Row>

            {authError || logoutError ? <Text className="auth-inline-error" color="#c2415d" fontSize={13} role="alert">{logoutError ?? authError}</Text> : null}

            <Row className="dashboard-kpi-row" flexWrap="nowrap" gap={16}>
              <Card {...border} borderRadius={16} padding={20} flex={1} minWidth={0} backgroundColor="#175cd3">
                <Stack gap={8}>
                  <Text color="#dbeafe" fontSize={16}>Saldo disponível</Text>
                  <Text color="#ffffff" fontSize={30} fontWeight="800">Indisponível</Text>
                  <Text color="#dbeafe" fontSize={13}>O read model atual não fornece saldo de contas.</Text>
                </Stack>
              </Card>
              <SummaryCard label="Ganhos" amount={displayPeriod.income} detail={`Realizadas em ${period.label}`} tone="#16805b" />
              <SummaryCard label="Gastos" amount={displayPeriod.expenses} detail={`Realizadas em ${period.label}`} tone="#c2415d" />
            </Row>

            <Card className="desktop-categories-card" {...border} borderRadius={16} padding={20} backgroundColor="#ffffff">
              <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={16}>
                <Stack gap={3}><Text fontSize={18} fontWeight="700">Gastos por categoria</Text><Text color="#667085" fontSize={13}>Distribuição dos gastos em {period.label}</Text></Stack>
                <Button className="dashboard-card-view-all" onPress={() => setActiveKey('Movimentos')} aria-label="Ver movimentos" borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="#087f70" fontWeight="700">Ver movimentos →</Button>
              </Row>
              {loading ? <Text color="#667085" paddingVertical={12}>A carregar despesas por categoria…</Text> : categories.length === 0 ? <Text color="#667085" paddingVertical={12}>Sem despesas realizadas neste mês.</Text> : <Row gap={28} flexWrap="wrap">
                {categories.map((category) => <Stack key={category.name} flex={1} minWidth={220} gap={7}><Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between' }}><Text color="#475467" fontSize={13}>{category.name}</Text><Text color="#101828" fontSize={13} fontWeight="700">{category.amount}</Text></Row><Stack height={7} borderRadius={99} backgroundColor="#eef2f6"><Stack width={String(category.percentage) + '%'} height={7} borderRadius={99} backgroundColor="#175cd3" /></Stack></Stack>)}
              </Row>}
            </Card>

            <Card {...border} borderRadius={16} padding={20} backgroundColor="#ffffff">
              <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={12}>
                <Text fontSize={18} fontWeight="700">Cartões</Text>
                <Button className="dashboard-card-view-all" onPress={() => setActiveKey('Cartões')} aria-label="Ver todos os cartões" borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="#087f70" fontWeight="700">Ver todos →</Button>
              </Row>
              {card ? <Row padding={12} borderRadius={12} backgroundColor="#f7f9fc" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack gap={4}>
                  <Text color="#667085" fontSize={13}>{card.name}</Text>
                  <Text fontSize={22} fontWeight="800">{invoice ? formatCurrency(invoice.summary.open_amount, currencySymbol) : 'Sem faturas disponíveis.'}</Text>
                  {invoice ? <Text color="#667085" fontSize={12}>Em aberto · {invoice.cycle_state}</Text> : null}
                </Stack>
              </Row> : <Text color="#667085" paddingVertical={12}>Sem cartões disponíveis.</Text>}
            </Card>

            <Card {...border} borderRadius={16} padding={20} backgroundColor="#ffffff">
              <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={8}>
                <Text fontSize={18} fontWeight="700">Últimos movimentos</Text>
                <Button className="dashboard-card-view-all" onPress={() => { setActiveKey('Movimentos') }} aria-label="Ver todos os movimentos" borderWidth={0} backgroundColor="transparent" padding={0} marginLeft="auto" flexShrink={0} color="#087f70" fontWeight="700">Ver todos →</Button>
              </Row>
              <Stack>
                {movements.length === 0 ? <Text color="#667085" paddingVertical={16}>Sem movimentos disponíveis.</Text> : movements.map((movement, index) => (
                  <Stack key={movement.name}>
                    <Row paddingVertical={16} gap={12} style={centered}>
                      <Stack width={38} height={38} borderRadius={16} backgroundColor="#f2f4f7" style={centered}>
                        <AppIcon name={movement.icon} size={17} color={movement.iconColor} />
                      </Stack>
                      <Stack flex={1} gap={4}>
                        <Text fontWeight="700">{movement.name}</Text>
                        <Text color="#667085" fontSize={14}>{movement.meta}</Text>
                      </Stack>
                      <Text color={movement.tone} fontWeight="700">{movement.amount}</Text>
                    </Row>
                    {index < movements.length - 1 ? <Separator /> : null}
                  </Stack>
                ))}
              </Stack>
            </Card>
  </>
}
