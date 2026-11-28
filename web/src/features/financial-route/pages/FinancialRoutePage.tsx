import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../../../shared/components/PageHeader'
import type { CardInvoice, Operation } from '../../../api/types'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import { RouteDayModal } from '../components/RouteDayModal'
import { RouteMonthCard } from '../components/RouteMonthCard'
import { useFinancialRouteData } from '../hooks/useFinancialRouteData'
import type { RouteFlowFilter } from '../types'
import { formatFullDate, formatMonthRange, shiftMonth } from '../utils'
import { formatMoneyUnits, isDisplayedNegative, localDateKey, parseMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

const DESKTOP_VISIBLE_MONTHS = 3
const DESKTOP_PREFETCH_MONTHS = 3
const MOBILE_VISIBLE_MONTHS = 1
const MOBILE_PREFETCH_MONTHS = 1

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
  const [selectedDay, setSelectedDay] = useState<{ date: string; periodMonth: string } | null>(null)
  const [detailFilter, setDetailFilter] = useState<'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'>('ALL')
  const desktopMonthsRef = useRef<HTMLDivElement>(null)
  const mobileMonthRef = useRef<HTMLDivElement>(null)
  const initialTodayPositioned = useRef(false)
  const [isDesktopRoute, setIsDesktopRoute] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1025px)').matches)
  const visibleMonthCount = isDesktopRoute ? DESKTOP_VISIBLE_MONTHS : MOBILE_VISIBLE_MONTHS
  const prefetchMonthCount = isDesktopRoute ? DESKTOP_PREFETCH_MONTHS : MOBILE_PREFETCH_MONTHS
  const routeData = useFinancialRouteData(month, operations, invoices, visibleMonthCount, prefetchMonthCount)
  const projection = routeData.projection
  const months = projection?.months

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1025px)')
    const update = () => setIsDesktopRoute(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const filteredMonths = useMemo(() => (months ?? []).slice(0, visibleMonthCount).map((item) => {
    let days = onlyMovementDays
      ? item.days.filter((day) => hasPositiveAmount(day.income) || hasPositiveAmount(day.expenses) || day.overdueItems.length > 0)
      : item.days
    if (flowFilter === 'INCOME') days = days.filter((day) => hasPositiveAmount(day.income) || day.overdueItems.some((item) => item.nature === 'INCOME'))
    if (flowFilter === 'EXPENSE') days = days.filter((day) => hasPositiveAmount(day.expenses) || day.overdueItems.some((item) => item.nature === 'EXPENSE'))
    return { month: item, days }
  }), [months, visibleMonthCount, onlyMovementDays, flowFilter])
  const mobileMonth = filteredMonths[0]?.month
  const mobileVisibleDays = filteredMonths[0]?.days ?? []
  const loading = financeLoading || routeData.loading
  const error = routeData.error ?? financeError

  useEffect(() => {
    if (!projection || initialTodayPositioned.current) return

    const today = localDateKey()
    const isMobile = window.matchMedia('(max-width: 1024px)').matches
    const container = isMobile ? mobileMonthRef.current : desktopMonthsRef.current
    const todayRow = container?.querySelector<HTMLTableRowElement>(`[data-route-date="${today}"]`)

    if (todayRow) {
      todayRow.scrollIntoView({ block: 'center', behavior: 'auto' })
      initialTodayPositioned.current = true
    }
  }, [projection])

  const activeDay = selectedDay?.periodMonth === month
    ? months?.flatMap((item) => item.days).find((day) => day.date === selectedDay.date)
    : undefined

  function selectDay(date: string) {
    setSelectedDay({ date, periodMonth: month })
    setDetailFilter('ALL')
  }

  function changePeriod(offset: number) {
    onMonthChange(shiftMonth(month, isDesktopRoute ? offset * DESKTOP_VISIBLE_MONTHS : offset))
  }

  const filterOptions: Array<{ value: RouteFlowFilter; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'INCOME', label: 'Entradas' },
    { value: 'EXPENSE', label: 'Saídas' },
  ]
  const mobileEndingBalance = mobileMonth?.endingBalance ?? null
  const mobileEndingUnits = mobileEndingBalance === null ? null : parseMoneyUnits(mobileEndingBalance)
  const mobileEndingNegative = mobileEndingUnits !== null && isDisplayedNegative(mobileEndingUnits)

  return <section className="financial-route-page">
    <PageHeader title="Rota Financeira" className="financial-route-header" actions={<div className="route-period-selector route-desktop-period">
      <button type="button" aria-label="Período anterior" onClick={() => changePeriod(-1)}>‹</button>
      <span>{formatMonthRange(month, shiftMonth(month, DESKTOP_VISIBLE_MONTHS - 1))}</span>
      <button type="button" aria-label="Período seguinte" onClick={() => changePeriod(1)}>›</button>
    </div>} mobilePeriod={<MonthSelector month={month} onMonthChange={onMonthChange} className="route-month-selector-mobile" />} />

    {loading ? <div className="route-status" role="status">A carregar projeção financeira…</div> : null}
    {!loading && error ? <div className="route-status route-status-error" role="alert">Não foi possível carregar a projeção financeira. {error}</div> : null}
    {!loading && !error && !projection ? <div className="route-status" role="status">A projeção financeira está indisponível.</div> : null}

    {!loading && projection ? <>
      <div className="route-desktop-controls">
        <div className="route-flow-filters" aria-label="Filtrar meses por movimento">
          {filterOptions.map((option) => <button key={option.value} type="button" className={flowFilter === option.value ? 'active' : ''} aria-pressed={flowFilter === option.value} onClick={() => setFlowFilter(option.value)}>{option.label}</button>)}
        </div>
        <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
      </div>

      <div className="route-mobile-summary orbe-financial-highlight-card">
        <div className="route-mobile-ending"><span>Saldo final projetado · até {mobileMonth?.days[mobileMonth.days.length - 1]?.date ? formatFullDate(mobileMonth.days[mobileMonth.days.length - 1].date) : 'fim do mês selecionado'}</span><strong className={mobileEndingNegative ? 'route-balance-negative' : ''}>{formatAmount(mobileEndingBalance)} {mobileEndingBalance === null ? '' : symbol}</strong></div>
        <div className="route-mobile-totals">
          <span className="route-month-income">+ {formatAmount(mobileMonth?.totals.income ?? null)} {symbol} entradas</span>
          <span className="route-month-expenses">− {formatAmount(mobileMonth?.totals.expenses ?? null)} {symbol} saídas</span>
        </div>
      </div>
      <div className="route-mobile-flow-filters" aria-label="Filtrar o mês por movimento">
        {filterOptions.map((option) => <button key={option.value} type="button" className={flowFilter === option.value ? 'active' : ''} aria-pressed={flowFilter === option.value} onClick={() => setFlowFilter(option.value)}>{option.label}</button>)}
      </div>

      {isDesktopRoute ? <div className="route-desktop-months" ref={desktopMonthsRef}>
        {filteredMonths.map((item) => <RouteMonthCard key={item.month.month} month={item.month} days={item.days} flowFilter={flowFilter} onSelectDay={selectDay} />)}
      </div> : null}

      <div className="route-mobile-month" ref={mobileMonthRef}>
        <div className="route-mobile-toolbar">
          <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
          <span className="route-days-count">{mobileVisibleDays.length} dias</span>
        </div>
        {mobileMonth ? <RouteMonthCard month={mobileMonth} days={mobileVisibleDays} flowFilter={flowFilter} onSelectDay={selectDay} mobile /> : null}
      </div>
    </> : null}

    {selectedDay && selectedDay.periodMonth === month && activeDay ? <RouteDayModal date={selectedDay.date} operations={activeDay.operations} invoices={activeDay.invoices} overdueItems={activeDay.overdueItems} filter={detailFilter} onFilterChange={setDetailFilter} onClose={() => setSelectedDay(null)} /> : null}
  </section>
}
