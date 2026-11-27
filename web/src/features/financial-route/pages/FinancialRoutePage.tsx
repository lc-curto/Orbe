import { useEffect, useState } from 'react'
import { PageHeader } from '../../../shared/components/PageHeader'
import type { CardInvoice, Operation } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { RouteDayModal } from '../components/RouteDayModal'
import { RouteMonthCard } from '../components/RouteMonthCard'
import { useFinancialRouteData } from '../hooks/useFinancialRouteData'
import type { RouteDay, RouteFlowFilter } from '../types'
import { formatFullDate, formatMonthRange, shiftMonth } from '../utils'
import { formatMoneyUnits, parseMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

function formatAmount(value: string | null): string {
  const units = value === null ? null : parseMoneyUnits(value)
  return units === null ? 'Indisponível' : formatMoneyUnits(units)
}

function hasPositiveAmount(value: string): boolean {
  const units = parseMoneyUnits(value)
  return units !== null && units > 0n
}

export function FinancialRoutePage({ operations, invoices, loading: financeLoading, error: financeError, month, onMonthChange }: {
  operations: Operation[]
  invoices: CardInvoice[]
  loading: boolean
  error: string | null
  month: string
  onMonthChange: (month: string) => void
}) {
  const { symbol } = useCurrency()
  const [onlyMovementDays, setOnlyMovementDays] = useState(false)
  const [flowFilter, setFlowFilter] = useState<RouteFlowFilter>('ALL')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [detailFilter, setDetailFilter] = useState<'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'>('ALL')
  const routeData = useFinancialRouteData(month, operations, invoices)
  const projection = routeData.projection
  const months = projection?.months ?? []
  const mobileMonth = months[0]
  const loading = financeLoading || routeData.loading
  const error = routeData.error ?? financeError

  useEffect(() => {
    setSelectedDay(null)
  }, [month])

  function visibleDaysFor(monthDays: RouteDay[]) {
    let visible = onlyMovementDays
      ? monthDays.filter((day) => day.operations.length > 0 || day.invoices.length > 0 || hasPositiveAmount(day.income) || hasPositiveAmount(day.expenses))
      : monthDays
    if (flowFilter === 'INCOME') visible = visible.filter((day) => hasPositiveAmount(day.income)).map((day) => ({ ...day, expenses: '0.0000' }))
    if (flowFilter === 'EXPENSE') visible = visible.filter((day) => hasPositiveAmount(day.expenses)).map((day) => ({ ...day, income: '0.0000' }))
    return visible
  }

  const activeDay = months.flatMap((item) => item.days).find((day) => day.date === selectedDay)

  function selectDay(date: string) {
    setSelectedDay(date)
    setDetailFilter('ALL')
  }

  function changePeriod(offset: number) {
    onMonthChange(shiftMonth(month, offset))
  }

  const filterOptions: Array<{ value: RouteFlowFilter; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'INCOME', label: 'Entradas' },
    { value: 'EXPENSE', label: 'Saídas' },
  ]
  const mobileEndingBalance = mobileMonth?.endingBalance ?? null
  const mobileEndingUnits = mobileEndingBalance === null ? null : parseMoneyUnits(mobileEndingBalance)
  const mobileEndingNegative = mobileEndingUnits !== null && mobileEndingUnits < 0n

  return <section className="financial-route-page">
    <PageHeader title="Rota Financeira" className="financial-route-header" actions={<div className="route-period-selector route-desktop-period">
      <button type="button" aria-label="Período anterior" onClick={() => changePeriod(-1)}>‹</button>
      <span>{formatMonthRange(month, shiftMonth(month, 2))}</span>
      <button type="button" aria-label="Período seguinte" onClick={() => changePeriod(1)}>›</button>
    </div>} mobilePeriod={<MonthSelector month={month} onMonthChange={onMonthChange} className="route-month-selector-mobile" />} />

    {loading ? <div className="route-status" role="status">A carregar projeção financeira…</div> : null}
    {!loading && error ? <div className="route-status route-status-error" role="alert">Não foi possível carregar a projeção financeira. {error}</div> : null}
    {!loading && !error && !projection ? <div className="route-status" role="status">A projeção financeira está indisponível.</div> : null}

    {!loading && projection ? <>
      {projection.overdueItems.length > 0 ? <details className="route-overdue-summary">
        <summary>Itens vencidos/por confirmar · {formatAmount(projection.overdueTotal)} {symbol} em saídas pendentes</summary>
        <ul>
          {projection.overdueItems.map((item) => <li key={item.id}>
            <span>{item.label} · {item.date ? formatFullDate(item.date) : 'Sem data prevista'}</span>
            <strong className={item.nature === 'INCOME' ? 'route-month-income' : 'route-month-expenses'}>{item.nature === 'INCOME' ? '+ ' : '− '}{formatAmount(item.amount)} {symbol}</strong>
          </li>)}
        </ul>
      </details> : null}

      <div className="route-desktop-controls">
        <div className="route-flow-filters" aria-label="Filtrar meses por movimento">
          {filterOptions.map((option) => <button key={option.value} type="button" className={flowFilter === option.value ? 'active' : ''} aria-pressed={flowFilter === option.value} onClick={() => setFlowFilter(option.value)}>{option.label}</button>)}
        </div>
        <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
      </div>

      <div className="route-mobile-summary orbe-financial-highlight-card">
        <div className="route-mobile-ending"><span>Saldo final projetado</span><strong className={mobileEndingNegative ? 'route-balance-negative' : ''}>{formatAmount(mobileEndingBalance)} {mobileEndingBalance === null ? '' : symbol}</strong></div>
        <div className="route-mobile-totals">
          <span className="route-month-income">+ {formatAmount(mobileMonth?.totals.income ?? null)} {symbol} entradas</span>
          <span className="route-month-expenses">− {formatAmount(mobileMonth?.totals.expenses ?? null)} {symbol} saídas</span>
        </div>
      </div>
      <div className="route-mobile-flow-filters" aria-label="Filtrar o mês por movimento">
        {filterOptions.map((option) => <button key={option.value} type="button" className={flowFilter === option.value ? 'active' : ''} aria-pressed={flowFilter === option.value} onClick={() => setFlowFilter(option.value)}>{option.label}</button>)}
      </div>

      <div className="route-desktop-months">
        {months.map((item) => <RouteMonthCard key={item.month} month={item} days={visibleDaysFor(item.days)} flowFilter={flowFilter} onSelectDay={selectDay} />)}
      </div>

      <div className="route-mobile-month">
        <div className="route-mobile-toolbar">
          <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
          <span className="route-days-count">{visibleDaysFor(mobileMonth?.days ?? []).length} dias</span>
        </div>
        {mobileMonth ? <RouteMonthCard month={mobileMonth} days={visibleDaysFor(mobileMonth.days)} flowFilter={flowFilter} onSelectDay={selectDay} mobile /> : null}
      </div>
    </> : null}

    {selectedDay && activeDay ? <RouteDayModal date={selectedDay} operations={activeDay.operations} invoices={activeDay.invoices} filter={detailFilter} onFilterChange={setDetailFilter} onClose={() => setSelectedDay(null)} /> : null}
  </section>
}
