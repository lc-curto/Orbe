import type { RouteMonth, RouteDay, RouteFlowFilter } from '../types'
import { RouteDailyTable } from './RouteDailyTable'
import { formatMonth } from '../utils'
import { formatMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

export function RouteMonthCard({ month, days, flowFilter, onSelectDay, mobile = false }: {
  month: RouteMonth
  days: RouteDay[]
  flowFilter: RouteFlowFilter
  onSelectDay: (date: string) => void
  mobile?: boolean
}) {
  const { symbol } = useCurrency()
  const income = flowFilter === 'EXPENSE' ? 0n : month.totals.income
  const expenses = flowFilter === 'INCOME' ? 0n : month.totals.expenses
  const endingBalanceNegative = month.endingBalance !== null && month.endingBalance < 0n

  return <section className={`route-month-card ${mobile ? 'route-month-card-mobile' : ''}`}>
    <header className="route-month-card-header">
      <div className="route-month-heading">
        <h2>{formatMonth(month.month)}</h2>
        <div className="route-month-totals">
          <span className="route-month-income">+ {formatMoneyUnits(income)} {symbol} entradas</span>
          <span className="route-month-expenses">− {formatMoneyUnits(expenses)} {symbol} saídas</span>
        </div>
      </div>
      <div className="route-month-ending">
        <span>Saldo final</span>
        <strong className={endingBalanceNegative ? 'route-balance-negative' : ''}>{month.endingBalance === null ? 'Indisponível' : formatMoneyUnits(month.endingBalance) + ' ' + symbol}</strong>
      </div>
    </header>
    <RouteDailyTable days={days} flowFilter={flowFilter} onSelectDay={onSelectDay} />
  </section>
}
