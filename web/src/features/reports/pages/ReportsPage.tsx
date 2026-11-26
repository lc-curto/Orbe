import { useMemo } from 'react'
import type { CardInvoice, Operation } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { formatCurrency } from '../../currency/formatCurrency'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'
import { activityByAccount, dailyTotalsForMonth, expensesByCategory, isRealizedOperation, monthLabel, monthOf, operationMonth, totalsFor, type DailyTotals, type PeriodTotals } from '../utils'

type Props = {
  operations: Operation[]
  invoices: CardInvoice[]
  loading: boolean
  error: string | null
  month: string
  onMonthChange: (month: string) => void
}

function ReportBars({ income, expenses, symbol }: PeriodTotals & { symbol: CurrencySymbol }) {
  const max = Math.max(income, expenses, 1)
  return <div className="report-composition" aria-label="Comparação entre receitas e despesas realizadas">
    <div className="report-composition-row"><span>Receitas</span><strong>{formatCurrency(income, symbol)}</strong></div>
    <div className="report-bar-track"><span className="report-bar-income" style={{ width: `${income / max * 100}%` }} /></div>
    <div className="report-composition-row"><span>Despesas</span><strong>{formatCurrency(expenses, symbol)}</strong></div>
    <div className="report-bar-track"><span className="report-bar-expense" style={{ width: `${expenses / max * 100}%` }} /></div>
  </div>
}

function chartX(index: number, count: number) {
  return count <= 1 ? 500 : 28 + index / (count - 1) * 944
}

function chartY(value: number, max: number) {
  return 138 - value / max * 116
}

function DailyEvolutionChart({ daily, symbol }: { daily: DailyTotals[]; symbol: CurrencySymbol }) {
  const max = Math.max(1, ...daily.map((item) => Math.max(item.income, item.expenses)))
  const incomePoints = daily.map((item, index) => `${chartX(index, daily.length)},${chartY(item.income, max)}`).join(' ')
  const expensePoints = daily.map((item, index) => `${chartX(index, daily.length)},${chartY(item.expenses, max)}`).join(' ')
  const tickDays = daily.filter((item) => item.day === 1 || item.day % 5 === 0 || item.day === daily.length)

  return <div className="report-daily-chart-wrap">
    <div className="report-chart-scale">Escala diária até {formatCurrency(max, symbol)}</div>
    <svg className="report-daily-chart" viewBox="0 0 1000 180" preserveAspectRatio="none" role="img" aria-label="Evolução diária das receitas e despesas realizadas">
      <title>Evolução diária do mês selecionado</title>
      <desc>Receitas e despesas realizadas por dia. Transferências e operações não realizadas são excluídas.</desc>
      {[22, 51, 80, 109, 138].map((y) => <line key={y} className="report-chart-grid" x1="28" y1={y} x2="972" y2={y} />)}
      <polyline className="report-chart-income" points={incomePoints} />
      <polyline className="report-chart-expense" points={expensePoints} />
      {daily.map((item, index) => <g key={item.day}>
        <circle className="report-chart-income-point" cx={chartX(index, daily.length)} cy={chartY(item.income, max)} r="2.8"><title>{`Dia ${item.day}: receitas ${formatCurrency(item.income, symbol)}`}</title></circle>
        <circle className="report-chart-expense-point" cx={chartX(index, daily.length)} cy={chartY(item.expenses, max)} r="2.8"><title>{`Dia ${item.day}: despesas ${formatCurrency(item.expenses, symbol)}`}</title></circle>
      </g>)}
      {tickDays.map((item) => <text key={item.day} className="report-chart-day" x={chartX(item.day - 1, daily.length)} y="166" textAnchor="middle">{item.day}</text>)}
    </svg>
    <div className="report-legend"><span><i className="income-dot" />Receitas</span><span><i className="expense-dot" />Despesas</span></div>
    <p className="report-chart-note">Valores diários realizados. Transferências não entram no gráfico.</p>
  </div>
}

export function ReportsPage({ operations, invoices, loading, error, month, onMonthChange }: Props) {
  const { symbol } = useCurrency()
  const monthOperations = useMemo(
    () => operations.filter((operation) => isRealizedOperation(operation) && operationMonth(operation) === month),
    [operations, month],
  )
  const totals = useMemo(() => totalsFor(monthOperations), [monthOperations])
  const daily = useMemo(() => dailyTotalsForMonth(monthOperations, month), [monthOperations, month])
  const hasDailyActivity = daily.some((item) => item.income > 0 || item.expenses > 0)
  const hasReportableOperations = monthOperations.some((operation) => operation.operation_type === 'INCOME' || operation.operation_type === 'EXPENSE')
  const categories = useMemo(() => expensesByCategory(monthOperations), [monthOperations])
  const accounts = useMemo(() => activityByAccount(monthOperations), [monthOperations])
  const monthInvoices = invoices.filter((invoice) => monthOf(invoice.period_start) === month)

  return <section className="reports-page" aria-labelledby="reports-page-title">
    <header className="movements-header reports-header">
      <div className="movements-heading"><h1 id="reports-page-title">Relatórios</h1></div>
      <div className="movements-header-actions"><MonthSelector month={month} onMonthChange={onMonthChange} className="movement-month-selector" /></div>
    </header>

    {loading ? <div className="report-state" role="status">A carregar dados financeiros…</div> : error ? <div className="report-state report-state-error" role="alert">{error}</div> : <>
      <div className="reports-grid">
        <section className="report-panel report-panel-wide report-panel-evolution">
          <header className="report-panel-header"><h2>Evolução do mês</h2><span>{monthLabel(month, 'long')}</span></header>
          {hasDailyActivity ? <DailyEvolutionChart daily={daily} symbol={symbol} /> : <p className="report-empty">Sem operações realizadas neste mês.</p>}
        </section>
        <section className="report-panel">
          <header className="report-panel-header"><h2>Composição do mês</h2><span>{monthLabel(month, 'long')}</span></header>
          {hasReportableOperations ? <ReportBars income={totals.income} expenses={totals.expenses} symbol={symbol} /> : <p className="report-empty">Sem operações realizadas neste mês.</p>}
        </section>
        <section className="report-panel">
          <header className="report-panel-header"><h2>Despesas por categoria</h2><span>Realizadas</span></header>
          {categories.length ? <div className="report-ranking">{categories.map(([name, value]) => <div className="report-ranking-row" key={name}><span>{name}</span><strong>{formatCurrency(value, symbol)}</strong></div>)}</div> : <p className="report-empty">Sem despesas categorizadas neste mês.</p>}
        </section>
        <section className="report-panel">
          <header className="report-panel-header"><h2>Atividade por conta</h2><span>Receitas e despesas</span></header>
          {accounts.length ? <div className="report-ranking">{accounts.map(([name, value]) => <div className="report-ranking-row" key={name}><span>{name}</span><strong>{formatCurrency(value, symbol)}</strong></div>)}</div> : <p className="report-empty">Sem atividade por conta neste mês.</p>}
        </section>
        <section className="report-panel report-panel-wide">
          <header className="report-panel-header"><h2>Cartões e faturas</h2><span>Faturas do período</span></header>
          {monthInvoices.length ? <div className="report-invoice-list">{monthInvoices.map((invoice) => <div className="report-invoice-row" key={invoice.id}><div><strong>{invoice.card?.name ?? 'Cartão'}</strong><span>Vencimento {new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${invoice.due_date.slice(0, 10)}T12:00:00`))}</span></div><strong>{formatCurrency(invoice.summary.obligation_amount, symbol)}</strong><small>Pago {formatCurrency(invoice.summary.paid_amount, symbol)} · Em aberto {formatCurrency(invoice.summary.open_amount, symbol)}</small></div>)}</div> : <p className="report-empty">Não existem faturas deste período nos dados disponíveis.</p>}
        </section>
        <section className="report-panel report-panel-wide">
          <header className="report-panel-header"><h2>Obrigações e pagamentos</h2><span>Dados realizados</span></header>
          <p className="report-empty">A API atual não disponibiliza ainda o histórico de pagamentos e evolução das obrigações para este relatório. Não são apresentados valores estimados.</p>
        </section>
      </div>
    </>}
  </section>
}
