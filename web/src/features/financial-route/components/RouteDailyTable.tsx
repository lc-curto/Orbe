import type { RouteDay } from '../types'
import { formatDay, formatMoney } from '../utils'

export function RouteDailyTable({ days, onSelectDay }: { days: RouteDay[]; onSelectDay: (date: string) => void }) {
  return <div className="route-table-wrap">
    <table className="route-table">
      <thead><tr><th>Data</th><th>Entrada</th><th>Saída</th><th>Saldo</th></tr></thead>
      <tbody>
        {days.map((day) => <tr key={day.date} className={day.operations.length ? 'has-movements' : ''}>
          <td><button className="route-day-button" type="button" onClick={() => onSelectDay(day.date)}>{formatDay(day.date)}</button></td>
          <td>{day.income ? formatMoney(day.income) : '—'}</td>
          <td>{day.expenses ? formatMoney(-day.expenses) : '—'}</td>
          <td className="route-balance-unavailable" aria-label="Saldo indisponível">—</td>
        </tr>)}
      </tbody>
    </table>
    {days.length === 0 ? <div className="route-empty">Não existem dias com movimentos neste mês.</div> : null}
  </div>
}
