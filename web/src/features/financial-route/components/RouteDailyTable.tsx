import type { RouteDay, RouteFlowFilter } from '../types'
import { formatDay } from '../utils'
import { formatMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

export function RouteDailyTable({ days, flowFilter, onSelectDay }: {
  days: RouteDay[]
  flowFilter: RouteFlowFilter
  onSelectDay: (date: string) => void
}) {
  const { symbol } = useCurrency()
  return <div className="route-table-wrap">
    <table className="route-table">
      <thead><tr><th>Dia</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
      <tbody>
        {days.map((day) => {
          const hasMovements = day.operations.length > 0 || day.invoices.length > 0
          const balanceNegative = day.balance !== null && day.balance < 0n
          return <tr key={day.date} className={hasMovements ? 'has-movements' : ''}>
            <td><button className="route-day-button" type="button" onClick={() => onSelectDay(day.date)}>{formatDay(day.date)}</button></td>
            <td className="route-income-cell">{flowFilter === 'EXPENSE' || day.income === 0n ? '—' : '+ ' + formatMoneyUnits(day.income) + ' ' + symbol}</td>
            <td className="route-expense-cell">{flowFilter === 'INCOME' || day.expenses === 0n ? '—' : '− ' + formatMoneyUnits(day.expenses) + ' ' + symbol}</td>
            <td className={balanceNegative ? 'route-balance-cell route-balance-negative' : 'route-balance-cell'} aria-label={day.balance === null ? 'Saldo indisponível' : 'Saldo projetado'}>
              {day.balance === null ? '—' : formatMoneyUnits(day.balance) + ' ' + symbol}
            </td>
          </tr>
        })}
      </tbody>
    </table>
    {days.length === 0 ? <div className="route-empty">Não existem movimentos para este filtro neste mês.</div> : null}
  </div>
}
