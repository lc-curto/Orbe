import { useState } from 'react'
import { MonthSelector } from '../../MonthSelector'
import type { Operation } from '../../api/types'
import { RouteDailyTable } from './components/RouteDailyTable'
import { RouteDayModal } from './components/RouteDayModal'
import { RouteKpis } from './components/RouteKpis'
import { RouteProjectionCard } from './components/RouteProjectionCard'
import { useFinancialRouteData } from './hooks/useFinancialRouteData'
import type { RouteFilter } from './types'

export function FinancialRoutePage({ operations, month, onMonthChange }: {
  operations: Operation[]
  month: string
  onMonthChange: (month: string) => void
}) {
  const [onlyMovementDays, setOnlyMovementDays] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [detailFilter, setDetailFilter] = useState<RouteFilter>('ALL')
  const { days, totals } = useFinancialRouteData(operations, month)

  const visibleDays = onlyMovementDays ? days.filter((day) => day.operations.length > 0) : days
  const activeDay = days.find((day) => day.date === selectedDay)

  function selectDay(date: string) {
    setSelectedDay(date)
    setDetailFilter('ALL')
  }

  return <section className="financial-route-page">
    <header className="financial-route-header">
      <div className="financial-route-title"><h1>Rota Financeira</h1><p>Acompanhamento diário do teu dinheiro</p></div>
      <MonthSelector month={month} onMonthChange={onMonthChange} minMonth="2026-11" maxMonth="2026-12" className="route-month-selector" />
    </header>

    <RouteProjectionCard />
    <RouteKpis income={totals.income} expenses={totals.expenses} />

    <div className="route-table-toolbar">
      <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
      <span className="route-days-count">{visibleDays.length} dias</span>
    </div>

    <RouteDailyTable days={visibleDays} onSelectDay={selectDay} />

    {selectedDay && activeDay ? <RouteDayModal date={selectedDay} operations={activeDay.operations} filter={detailFilter} onFilterChange={setDetailFilter} onClose={() => setSelectedDay(null)} /> : null}
  </section>
}
