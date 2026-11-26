import { useMemo } from 'react'
import type { CardInvoice, Operation } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { formatCurrency } from '../../currency/formatCurrency'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'
import { activityByAccount, expensesByCategory, isRealizedOperation, monthLabel, monthOf, operationMonth, shiftMonth, totalsFor, type PeriodTotals } from '../utils'

type Props = {
  operations: Operation[]
  invoices: CardInvoice[]
  loading: boolean
  error: string | null
  month: string
  onMonthChange: (month: string) => void
}

function ReportKpi({ label, value, tone, note }: { label: string; value: string; tone?: string; note: string }) {
  return <article className="report-kpi"><span>{label}</span><strong style={tone ? { color: tone } : undefined}>{value}</strong><small>{note}</small></article>
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

export function ReportsPage({ operations, invoices, loading, error, month, onMonthChange }: Props) {
  const { symbol } = useCurrency()
  const monthOperations = useMemo(
    () => operations.filter((operation) => isRealizedOperation(operation) && operationMonth(operation) === month),
    [operations, month],
  )
  const totals = useMemo(() => totalsFor(monthOperations), [monthOperations])
  const result = totals.income - totals.expenses
  const monthly = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => shiftMonth(month, index - 5))
    return months.map((period) => ({ month: period, ...totalsFor(operations.filter((operation) => operationMonth(operation) === period && isRealizedOperation(operation))) }))
  }, [operations, month])
  const maxMonthly = Math.max(1, ...monthly.flatMap((item) => [item.income, item.expenses]))
  const categories = useMemo(() => expensesByCategory(monthOperations), [monthOperations])
  const accounts = useMemo(() => activityByAccount(monthOperations), [monthOperations])
  const monthInvoices = invoices.filter((invoice) => monthOf(invoice.period_start) === month)
  const hasOperations = monthOperations.length > 0

  return <section className="reports-page" aria-labelledby="reports-page-title">
    <header className="movements-header reports-header">
      <div className="movements-heading"><h1 id="reports-page-title">Relatórios</h1><p>Resumo da atividade financeira realizada</p></div>
      <div className="movements-header-actions"><MonthSelector month={month} onMonthChange={onMonthChange} className="movement-month-selector" /></div>
    </header>

    {loading ? <div className="report-state" role="status">A carregar dados financeiros…</div> : error ? <div className="report-state report-state-error" role="alert">{error}</div> : <>
      <div className="reports-kpis">
        <ReportKpi label="Receitas" value={formatCurrency(totals.income, symbol)} tone="var(--orbe-success)" note="Realizadas no mês" />
        <ReportKpi label="Despesas" value={formatCurrency(totals.expenses, symbol)} tone="var(--orbe-danger)" note="Realizadas no mês" />
        <ReportKpi label="Resultado" value={`${result >= 0 ? '+ ' : '− '}${formatCurrency(Math.abs(result), symbol)}`} tone={result >= 0 ? 'var(--orbe-primary)' : 'var(--orbe-danger)'} note="Receitas − despesas" />
      </div>

      <div className="reports-grid">
        <section className="report-panel">
          <header className="report-panel-header"><h2>Composição do mês</h2><span>{monthLabel(month, 'long')}</span></header>
          {hasOperations ? <ReportBars income={totals.income} expenses={totals.expenses} symbol={symbol} /> : <p className="report-empty">Sem operações realizadas neste mês.</p>}
        </section>
        <section className="report-panel">
          <header className="report-panel-header"><h2>Evolução mensal</h2><span>Últimos 6 meses</span></header>
          {monthly.some((item) => item.income > 0 || item.expenses > 0) ? <div className="report-month-chart">
            {monthly.map((item) => <div className="report-month-column" key={item.month} aria-label={`${monthLabel(item.month)}: receitas ${formatCurrency(item.income, symbol)}, despesas ${formatCurrency(item.expenses, symbol)}`}>
              <div className="report-month-bars"><span className="report-month-income" style={{ height: `${item.income / maxMonthly * 100}%` }} /><span className="report-month-expense" style={{ height: `${item.expenses / maxMonthly * 100}%` }} /></div>
              <small>{monthLabel(item.month)}</small>
            </div>)}
          </div> : <p className="report-empty">Ainda não existem dados realizados para comparar.</p>}
          <div className="report-legend"><span><i className="income-dot" />Receitas</span><span><i className="expense-dot" />Despesas</span></div>
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
