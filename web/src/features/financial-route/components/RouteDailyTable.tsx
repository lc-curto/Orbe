import type { RouteDay, RouteFlowFilter } from '../types'
import { formatAmount, formatDay } from '../utils'
import { useCurrency } from '../../currency/useCurrency'

export function RouteDailyTable({ days, flowFilter, onSelectDay }: {
  days: RouteDay[]
  flowFilter: RouteFlowFilter
  onSelectDay: (date: string) => void
}) {
  const { symbol } = useCurrency()
  return <div className="route-table-wrap">
    <table className="route-table">
      <thead><tr><th>Dia</th><th>Ganho</th><th>Gasto</th><th>Saldo</th></tr></thead>
      <tbody>
        {days.map((day) => <tr key={day.date} className={day.operations.length ? 'has-movements' : ''}>
          <td><button className="route-day-button" type="button" onClick={() => onSelectDay(day.date)}>{formatDay(day.date)}</button></td>
          <td className="route-income-cell">{flowFilter === 'EXPENSE' || !day.income ? '—' : `${formatAmount(day.income)} ${symbol}`}</td>
          <td className="route-expense-cell">{flowFilter === 'INCOME' || !day.expenses ? '—' : `− ${formatAmount(day.expenses)} ${symbol}`}</td>
          <td className="route-balance-unavailable" aria-label="Saldo indisponível">—</td>
        </tr>)}
      </tbody>
    </table>
    {days.length === 0 ? <div className="route-empty">Não existem movimentos para este filtro neste mês.</div> : null}
  </div>
}
