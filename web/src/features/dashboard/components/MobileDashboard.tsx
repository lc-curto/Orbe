import { Card as UiCard, Text, Row, Stack } from '../../../design-system/primitives'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { DashboardSections } from './DashboardSections'
import type { Card as FinancialCard, CardInvoice } from '../../../api/types'
import type { DashboardMovement } from './DashboardSections'

const border = { borderWidth: 1, borderColor: '#e4e7ec' as const }

function formatMoney(amount: string, symbol: CurrencySymbol): string {
  return formatCurrency(amount, symbol)
}

export function MobileDashboard({ period, month, onMonthChange, card, invoice, setActiveKey, userName, currencySymbol, movements, categories, loading, authError, logoutError }: {
  period: { label: string; shortLabel: string; date: string; income: string; expenses: string }
  month: string
  onMonthChange: (month: string) => void
  card?: FinancialCard
  invoice?: CardInvoice
  setActiveKey: (value: string) => void
  categories: Array<{ name: string; amount: string; percentage: number }>
  loading: boolean
  authError: string | null
  logoutError: string | null
  userName: string
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
        {authError || logoutError ? <Text className="auth-inline-error" color="#c2415d" fontSize={13} role="alert">{logoutError ?? authError}</Text> : null}
        <UiCard className="mobile-balance-card" borderRadius={18} padding={18} backgroundColor="#175cd3" borderWidth={0}>
          <Stack gap={12}>
            <Text color="#dbeafe" fontSize={11} fontWeight="800" letterSpacing={1}>SALDO DISPONÍVEL</Text>
            <Text color="#ffffff" fontSize={28} fontWeight="800">Indisponível</Text>
            <Text color="#dbeafe" fontSize={12}>O read model atual não fornece saldo de contas.</Text>
            <Separator borderColor="rgba(255,255,255,0.24)" />
            <Row className="dashboard-card-header" width="100%" style={{ justifyContent: 'space-between' }}>{[['Ganhos', period.income], ['Gastos', period.expenses]].map(([label, value]) => <Stack key={label} gap={3} flex={1}><Text color="#dbeafe" fontSize={11}>{label}</Text><Text color="#ffffff" fontSize={13} fontWeight="800">{value}</Text></Stack>)}</Row>
          </Stack>
        </UiCard>
        <DashboardSections periodLabel={period.label} categories={categories} loading={loading} card={card} invoice={invoice} currencySymbol={currencySymbol} movements={movements} setActiveKey={setActiveKey} />
      </Stack>
    </Stack>
  )
}
