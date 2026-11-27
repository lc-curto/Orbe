import type { RouteMonth, RouteDay, RouteFlowFilter } from '../types'
import { RouteDailyTable } from './RouteDailyTable'
import { formatMonth } from '../utils'
import { formatMoneyUnits, parseMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

function formatAmount(value: string | null): string {
  const units = value === null ? null : parseMoneyUnits(value)
  return units === null ? 'Indisponível' : formatMoneyUnits(units)
}

export function RouteMonthCard({ month, days, flowFilter, onSelectDay, mobile = false }: {
  month: RouteMonth
  days: RouteDay[]
  flowFilter: RouteFlowFilter
  onSelectDay: (date: string) => void
  mobile?: boolean
}) {
  const { symbol } = useCurrency()
  const income = flowFilter === 'EXPENSE' ? '0.0000' : month.totals.income
  const expenses = flowFilter === 'INCOME' ? '0.0000' : month.totals.expenses
  const endingBalanceUnits = month.endingBalance === null ? null : parseMoneyUnits(month.endingBalance)
  const endingBalanceNegative = endingBalanceUnits !== null && endingBalanceUnits < 0n

  return <section className={`route-month-card ${mobile ? 'route-month-card-mobile' : ''}`}>
    <header className="route-month-card-header">
      <div className="route-month-heading">
        <h2>{formatMonth(month.month)}</h2>
        <div className="route-month-totals">
          <span className="route-month-income">+ {formatAmount(income)} {symbol} entradas</span>
          <span className="route-month-expenses">− {formatAmount(expenses)} {symbol} saídas</span>
        </div>
      </div>
      <div className="route-month-ending">
        <span>Saldo final</span>
        <strong className={endingBalanceNegative ? 'route-balance-negative' : ''}>{month.endingBalance === null ? 'Indisponível' : formatAmount(month.endingBalance) + ' ' + symbol}</strong>
      </div>
    </header>
    <RouteDailyTable days={days} flowFilter={flowFilter} onSelectDay={onSelectDay} />
  </section>
}
