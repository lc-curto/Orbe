import { PageHeader } from '../../../shared/components/PageHeader'
import { useMemo } from 'react'
import type { Operation } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { formatCurrency } from '../../currency/formatCurrency'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'
import { dailyTotalsForMonth, expensesByCategory, isRealizedOperation, monthLabel, operationMonth, totalsFor, type DailyTotals, type PeriodTotals } from '../utils'

type Props = {
  operations: Operation[]
  loading: boolean
  error: string | null
  month: string
  onMonthChange: (month: string) => void
}

type CategoryTotal = [string, number]

function chartX(index: number, count: number) {
  return count <= 1 ? 500 : 28 + index / (count - 1) * 944
}

function chartY(value: number, max: number) {
  return 138 - value / max * 110
}

function DailyEvolutionChart({ daily, symbol }: { daily: DailyTotals[]; symbol: CurrencySymbol }) {
  const max = Math.max(1, ...daily.map((item) => Math.max(item.income, item.expenses)))
  const incomePoints = daily.map((item, index) => `${chartX(index, daily.length)},${chartY(item.income, max)}`).join(' ')
  const expensePoints = daily.map((item, index) => `${chartX(index, daily.length)},${chartY(item.expenses, max)}`).join(' ')
  const tickDays = daily.filter((item) => item.day === 1 || item.day % 5 === 0 || item.day === daily.length)

  return <div className="report-daily-chart-wrap">
    <div className="report-chart-scale">Maior valor diário: {formatCurrency(max, symbol)}</div>
    <svg className="report-daily-chart" viewBox="0 0 1000 184" preserveAspectRatio="none" role="img" aria-label="Evolução diária das receitas e despesas realizadas">
      <title>Evolução diária do mês selecionado</title>
      <desc>Valores agregados por dia. Apenas receitas e despesas realizadas; transferências e operações pendentes são excluídas.</desc>
      {[22, 51, 80, 109, 138].map((y) => <line key={y} className="report-chart-grid" x1="28" y1={y} x2="972" y2={y} />)}
      <polyline className="report-chart-income" points={incomePoints} />
      <polyline className="report-chart-expense" points={expensePoints} />
      {daily.map((item, index) => <g key={item.day}>
        <circle className="report-chart-income-point" cx={chartX(index, daily.length)} cy={chartY(item.income, max)} r="3">
          <title>{`Dia ${item.day}: receitas ${formatCurrency(item.income, symbol)}`}</title>
        </circle>
        <circle className="report-chart-expense-point" cx={chartX(index, daily.length)} cy={chartY(item.expenses, max)} r="3">
          <title>{`Dia ${item.day}: despesas ${formatCurrency(item.expenses, symbol)}`}</title>
        </circle>
      </g>)}
      {tickDays.map((item) => <text key={item.day} className="report-chart-day" x={chartX(item.day - 1, daily.length)} y="170" textAnchor="middle">{item.day}</text>)}
    </svg>
    <div className="report-legend" aria-hidden="true">
      <span><i className="income-dot" />Receitas</span>
      <span><i className="expense-dot" />Despesas</span>
    </div>
    <p className="report-chart-note">Montantes realizados por dia. Transferências não entram no gráfico.</p>
    <details className="report-chart-data">
      <summary>Consultar valores diários</summary>
      <div className="report-chart-table-wrap">
        <table>
          <thead><tr><th scope="col">Dia</th><th scope="col">Receitas</th><th scope="col">Despesas</th></tr></thead>
          <tbody>{daily.map((item) => <tr key={item.day}>
            <th scope="row">{item.day}</th>
            <td>{formatCurrency(item.income, symbol)}</td>
            <td>{formatCurrency(item.expenses, symbol)}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  </div>
}

function ExpenseCategories({ categories, total, symbol }: { categories: CategoryTotal[]; total: number; symbol: CurrencySymbol }) {
  return <ol className="report-category-list">
    {categories.map(([name, value]) => {
      const share = total > 0 ? Math.min(100, value / total * 100) : 0
      const shareLabel = new Intl.NumberFormat('pt-PT', { style: 'percent', maximumFractionDigits: 1 }).format(share / 100)
      return <li className="report-category-item" key={name}>
        <div className="report-category-heading">
          <span title={name}>{name}</span>
          <strong>{formatCurrency(value, symbol)}</strong>
        </div>
        <div className="report-category-track" role="progressbar" aria-label={`Percentagem das despesas em ${name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share)} aria-valuetext={shareLabel}>
          <span style={{ width: `${share}%` }} />
        </div>
        <span className="report-category-share">{shareLabel} das despesas</span>
      </li>
    })}
  </ol>
}

function MonthlySummary({ totals, symbol }: { totals: PeriodTotals; symbol: CurrencySymbol }) {
  const result = totals.income - totals.expenses
  const resultTone = result > 0 ? 'positive' : result < 0 ? 'negative' : 'neutral'
  const resultSign = result > 0 ? '+ ' : result < 0 ? '− ' : ''
  return <div className="report-summary">
    <div className="report-summary-row">
      <span><i className="income-dot" aria-hidden="true" />Receitas realizadas</span>
      <strong>{formatCurrency(totals.income, symbol)}</strong>
    </div>
    <div className="report-summary-row">
      <span><i className="expense-dot" aria-hidden="true" />Despesas realizadas</span>
      <strong>{formatCurrency(totals.expenses, symbol)}</strong>
    </div>
    <div className="report-summary-result">
      <span>Resultado do mês</span>
      <strong className={resultTone}>{resultSign}{formatCurrency(Math.abs(result), symbol)}</strong>
    </div>
  </div>
}

export function ReportsPage({ operations, loading, error, month, onMonthChange }: Props) {
  const { symbol } = useCurrency()
  const monthOperations = useMemo(
    () => operations.filter((operation) => isRealizedOperation(operation) && operationMonth(operation) === month),
    [operations, month],
  )
  const totals = useMemo(() => totalsFor(monthOperations), [monthOperations])
  const daily = useMemo(() => dailyTotalsForMonth(monthOperations, month), [monthOperations, month])
  const hasDailyActivity = daily.some((item) => item.income > 0 || item.expenses > 0)
  const hasReportableOperations = totals.income > 0 || totals.expenses > 0
  const categories = useMemo(() => expensesByCategory(monthOperations), [monthOperations])

  return <section className="reports-page" aria-label="Relatórios financeiros">
    <PageHeader title="Relatórios" description="Acompanha a evolução das tuas finanças." className="reports-header" period={<MonthSelector month={month} onMonthChange={onMonthChange} className="movement-month-selector" />} />

    {loading ? <div className="report-state" role="status">A carregar dados financeiros…</div> : error ? <div className="report-state report-state-error" role="alert">{error}</div> : <>
      <div className="reports-grid">
        <section className="report-panel report-panel-evolution" aria-labelledby="report-evolution-title">
          <header className="report-panel-header">
            <div><h2 id="report-evolution-title">Evolução do mês</h2><p>Receitas e despesas realizadas por dia</p></div>
            <span>{monthLabel(month, 'long')}</span>
          </header>
          {hasDailyActivity ? <DailyEvolutionChart daily={daily} symbol={symbol} /> : <p className="report-empty">Sem operações realizadas neste mês.</p>}
        </section>

        <section className="report-panel" aria-labelledby="report-categories-title">
          <header className="report-panel-header">
            <div><h2 id="report-categories-title">Despesas por categoria</h2><p>Principais categorias do mês</p></div>
            <span>Top {categories.length || 5}</span>
          </header>
          {categories.length ? <ExpenseCategories categories={categories} total={totals.expenses} symbol={symbol} /> : <p className="report-empty">Sem despesas realizadas neste mês.</p>}
        </section>

        <section className="report-panel" aria-labelledby="report-summary-title">
          <header className="report-panel-header">
            <div><h2 id="report-summary-title">Resumo do mês</h2><p>Resultado das operações realizadas</p></div>
          </header>
          {hasReportableOperations ? <MonthlySummary totals={totals} symbol={symbol} /> : <p className="report-empty">Sem receitas ou despesas realizadas neste mês.</p>}
        </section>
      </div>
    </>}
  </section>
}
