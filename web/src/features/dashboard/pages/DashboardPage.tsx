import { Card, Heading, Paragraph, Text, Row, Stack } from '../../../design-system/primitives'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import type { CurrencySymbol } from '../../currency/types'
import type { Card as FinancialCard, CardInvoice } from '../../../api/types'
import { formatCurrency } from '../../currency/formatCurrency'
import { DashboardSections } from '../components/DashboardSections'
import type { DashboardMovement } from '../components/DashboardSections'


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

            <DashboardSections periodLabel={period.label} categories={categories} loading={loading} card={card} invoice={invoice} currencySymbol={currencySymbol} movements={movements} setActiveKey={setActiveKey} />

  </>
}
