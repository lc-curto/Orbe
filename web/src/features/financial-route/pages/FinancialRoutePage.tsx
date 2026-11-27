import { PageHeader } from '../../../shared/components/PageHeader'
import { useState } from 'react'
import type { Account, CardInvoice, Operation } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { RouteDayModal } from '../components/RouteDayModal'
import { RouteMonthCard } from '../components/RouteMonthCard'
import { useFinancialRouteData } from '../hooks/useFinancialRouteData'
import type { RouteDay, RouteFlowFilter } from '../types'
import { formatFullDate, formatMonthRange, shiftMonth } from '../utils'
import { formatMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

export function FinancialRoutePage({ operations, accounts, invoices, loading, error, month, onMonthChange }: {
  operations: Operation[]
  accounts: Account[]
  invoices: CardInvoice[]
  loading: boolean
  error: string | null
  month: string
  onMonthChange: (month: string) => void
}) {
  const { symbol } = useCurrency()
  const firstMonth = month
  const [onlyMovementDays, setOnlyMovementDays] = useState(false)
  const [flowFilter, setFlowFilter] = useState<RouteFlowFilter>('ALL')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [detailFilter, setDetailFilter] = useState<'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'>('ALL')
  const projection = useFinancialRouteData(operations, accounts, invoices, firstMonth, 3)
  const months = projection.months
  const mobileMonth = months[0]

  function visibleDaysFor(monthDays: RouteDay[]) {
    let visible = onlyMovementDays
      ? monthDays.filter((day) => day.operations.length > 0 || day.invoices.length > 0 || day.income > 0n || day.expenses > 0n)
      : monthDays
    if (flowFilter === 'INCOME') visible = visible.filter((day) => day.income > 0n).map((day) => ({ ...day, expenses: 0n }))
    if (flowFilter === 'EXPENSE') visible = visible.filter((day) => day.expenses > 0n).map((day) => ({ ...day, income: 0n }))
    return visible
  }

  const activeDay = months.flatMap((item) => item.days).find((day) => day.date === selectedDay)

  function selectDay(date: string) {
    setSelectedDay(date)
    setDetailFilter('ALL')
  }

  function changePeriod(offset: number) {
    onMonthChange(shiftMonth(firstMonth, offset))
  }

  const filterOptions: Array<{ value: RouteFlowFilter; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'INCOME', label: 'Entradas' },
    { value: 'EXPENSE', label: 'Saídas' },
  ]
  const mobileEndingNegative = mobileMonth?.endingBalance !== null && mobileMonth?.endingBalance !== undefined && mobileMonth.endingBalance < 0n

  return <section className="financial-route-page">
    <PageHeader title="Rota Financeira" className="financial-route-header" actions={<div className="route-period-selector route-desktop-period">
      <button type="button" aria-label="Período anterior" onClick={() => changePeriod(-1)}>‹</button>
      <span>{formatMonthRange(firstMonth, shiftMonth(firstMonth, 2))}</span>
      <button type="button" aria-label="Período seguinte" onClick={() => changePeriod(1)}>›</button>
    </div>} mobilePeriod={<MonthSelector month={firstMonth} onMonthChange={onMonthChange} className="route-month-selector-mobile" />} />

    {loading ? <div className="route-status" role="status">A carregar dados financeiros da Rota…</div> : null}
    {!loading && error ? <div className="route-status route-status-error" role="alert">Não foi possível atualizar os dados financeiros. {error}</div> : null}

    {!loading ? <>
      {projection.overdueItems.length > 0 ? <details className="route-overdue-summary">
        <summary>Itens vencidos/por confirmar · {formatMoneyUnits(projection.overdueTotal)} {symbol} em saídas pendentes</summary>
        <ul>
          {projection.overdueItems.map((item) => <li key={item.id}>
            <span>{item.label} · {formatFullDate(item.date)}</span>
            <strong className={item.nature === 'INCOME' ? 'route-month-income' : 'route-month-expenses'}>{item.nature === 'INCOME' ? '+ ' : '− '}{formatMoneyUnits(item.amount)} {symbol}</strong>
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
        <div className="route-mobile-ending"><span>Saldo final projetado</span><strong className={mobileEndingNegative ? 'route-balance-negative' : ''}>{mobileMonth?.endingBalance === null || mobileMonth?.endingBalance === undefined ? 'Indisponível' : formatMoneyUnits(mobileMonth.endingBalance) + ' ' + symbol}</strong></div>
        <div className="route-mobile-totals">
          <span className="route-month-income">+ {mobileMonth ? formatMoneyUnits(mobileMonth.totals.income) : '0,00'} {symbol} entradas</span>
          <span className="route-month-expenses">− {mobileMonth ? formatMoneyUnits(mobileMonth.totals.expenses) : '0,00'} {symbol} saídas</span>
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
