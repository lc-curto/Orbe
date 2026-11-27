import type { RouteMonth, RouteDay, RouteFlowFilter } from '../types'
import { RouteDailyTable } from './RouteDailyTable'
import { formatAmount, formatMonth } from '../utils'
import { useCurrency } from '../../currency/useCurrency'

export function RouteMonthCard({ month, days, flowFilter, onSelectDay, mobile = false }: {
  month: RouteMonth
  days: RouteDay[]
  flowFilter: RouteFlowFilter
  onSelectDay: (date: string) => void
  mobile?: boolean
}) {
  const { symbol } = useCurrency()
  const income = days.reduce((sum, day) => sum + (flowFilter === 'EXPENSE' ? 0 : day.income), 0)
  const expenses = days.reduce((sum, day) => sum + (flowFilter === 'INCOME' ? 0 : day.expenses), 0)

  return <section className={`route-month-card ${mobile ? 'route-month-card-mobile' : ''}`}>
    <header className="route-month-card-header">
      <div className="route-month-heading">
        <h2>{formatMonth(month.month)}</h2>
        <div className="route-month-totals">
          <span className="route-month-income">+ {formatAmount(income)} {symbol} ganhos</span>
          <span className="route-month-expenses">− {formatAmount(expenses)} {symbol} gastos</span>
        </div>
      </div>
      <div className="route-month-ending"><span>Saldo final</span><strong>Indisponível</strong></div>
    </header>
    <RouteDailyTable days={days} flowFilter={flowFilter} onSelectDay={onSelectDay} />
  </section>
}
