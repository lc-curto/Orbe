import { useState } from 'react'
import type { Operation } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { RouteDayModal } from '../components/RouteDayModal'
import { RouteMonthCard } from '../components/RouteMonthCard'
import { useFinancialRouteData } from '../hooks/useFinancialRouteData'
import type { RouteDay, RouteFlowFilter } from '../types'
import { formatAmount, formatMonthRange, shiftMonth } from '../utils'
import { useCurrency } from '../../currency/useCurrency'

export function FinancialRoutePage({ operations, month, onMonthChange }: {
  operations: Operation[]
  month: string
  onMonthChange: (month: string) => void
}) {
  const { symbol } = useCurrency()
  const firstMonth = month
  const [onlyMovementDays, setOnlyMovementDays] = useState(false)
  const [flowFilter, setFlowFilter] = useState<RouteFlowFilter>('ALL')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [detailFilter, setDetailFilter] = useState<'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'>('ALL')
  const months = useFinancialRouteData(operations, firstMonth, 3)
  const mobileMonth = months[0]

  function visibleDaysFor(monthDays: RouteDay[]) {
    let visible = onlyMovementDays ? monthDays.filter((day) => day.operations.length > 0) : monthDays
    if (flowFilter === 'INCOME') visible = visible.filter((day) => day.income > 0).map((day) => ({ ...day, expenses: 0 }))
    if (flowFilter === 'EXPENSE') visible = visible.filter((day) => day.expenses > 0).map((day) => ({ ...day, income: 0 }))
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

  return <section className="financial-route-page">
    <header className="financial-route-header">
      <div className="financial-route-title"><h1>Rota Financeira</h1><p>Acompanhamento diário do teu dinheiro</p></div>
      <div className="route-period-selector route-desktop-period">
        <button type="button" aria-label="Período anterior" onClick={() => changePeriod(-1)}>‹</button>
        <span>{formatMonthRange(firstMonth, shiftMonth(firstMonth, 2))}</span>
        <button type="button" aria-label="Período seguinte" onClick={() => changePeriod(1)}>›</button>
      </div>
      <MonthSelector month={firstMonth} onMonthChange={onMonthChange} className="route-month-selector-mobile" />
    </header>

    <div className="route-desktop-controls">
      <div className="route-flow-filters" aria-label="Filtrar meses por movimento">
        {filterOptions.map((option) => <button key={option.value} type="button" className={flowFilter === option.value ? 'active' : ''} aria-pressed={flowFilter === option.value} onClick={() => setFlowFilter(option.value)}>{option.label}</button>)}
      </div>
      <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
    </div>

    <div className="route-desktop-months">
      {months.map((item) => <RouteMonthCard key={item.month} month={item} days={visibleDaysFor(item.days)} flowFilter={flowFilter} onSelectDay={selectDay} />)}
    </div>

    <div className="route-mobile-month">
      <div className="route-mobile-summary">
        <div className="route-mobile-ending"><span>Saldo final</span><strong>Indisponível</strong></div>
        <div className="route-mobile-totals">
          <span className="route-month-income">+ {mobileMonth ? formatAmount(mobileMonth.totals.income) : '0,00'} {symbol} entradas</span>
          <span className="route-month-expenses">− {mobileMonth ? formatAmount(mobileMonth.totals.expenses) : '0,00'} {symbol} saídas</span>
        </div>
      </div>
      <div className="route-mobile-toolbar">
        <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
        <span className="route-days-count">{visibleDaysFor(mobileMonth?.days ?? []).length} dias</span>
      </div>
      {mobileMonth ? <RouteMonthCard month={mobileMonth} days={visibleDaysFor(mobileMonth.days)} flowFilter={flowFilter} onSelectDay={selectDay} mobile /> : null}
    </div>

    {selectedDay && activeDay ? <RouteDayModal date={selectedDay} operations={activeDay.operations} filter={detailFilter} onFilterChange={setDetailFilter} onClose={() => setSelectedDay(null)} /> : null}
  </section>
}
