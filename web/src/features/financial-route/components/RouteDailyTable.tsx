import type { RouteDay, RouteFlowFilter } from '../types'
import { formatDay } from '../utils'
import { formatMoneyUnits, isDisplayedNegative, localDateKey, parseMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

function formatAmount(value: string | null): string {
  const units = value === null ? null : parseMoneyUnits(value)
  return units === null ? '—' : formatMoneyUnits(units)
}

export function RouteDailyTable({ days, flowFilter, onSelectDay }: {
  days: RouteDay[]
  flowFilter: RouteFlowFilter
  onSelectDay: (date: string) => void
}) {
  const { symbol } = useCurrency()
  const today = localDateKey()
  return <div className="route-table-wrap">
    <table className="route-table">
      <thead><tr><th>Dia</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
      <tbody>
        {days.map((day) => {
          const hasOverdueMovement = day.overdueItems.some((item) => flowFilter === 'ALL' || item.nature === flowFilter)
          const hasMovements = day.operations.length > 0 || day.invoices.length > 0 || hasOverdueMovement
          const balanceUnits = day.balance === null ? null : parseMoneyUnits(day.balance)
          const balanceNegative = balanceUnits !== null && isDisplayedNegative(balanceUnits)
          const incomeUnits = parseMoneyUnits(day.income)
          const expensesUnits = parseMoneyUnits(day.expenses)
          const income = formatAmount(day.income)
          const expenses = formatAmount(day.expenses)
          const balance = formatAmount(day.balance)
          const isToday = day.date === today
          return <tr key={day.date} data-route-date={day.date} className={[hasMovements ? 'has-movements' : '', isToday ? 'route-today' : ''].filter(Boolean).join(' ')} onClick={() => onSelectDay(day.date)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectDay(day.date) } }} tabIndex={0} aria-label={`Abrir detalhes de ${formatDay(day.date)}`}>
            <td><button className="route-day-button" type="button" aria-current={isToday ? "date" : undefined} onClick={() => onSelectDay(day.date)}>{formatDay(day.date)}</button></td>
            <td className="route-income-cell">{flowFilter === 'EXPENSE' || incomeUnits === null || incomeUnits === 0n ? '—' : '+ ' + income + ' ' + symbol}</td>
            <td className="route-expense-cell">{flowFilter === 'INCOME' || expensesUnits === null || expensesUnits === 0n ? '—' : '− ' + expenses + ' ' + symbol}</td>
            <td className={balanceNegative ? 'route-balance-cell route-balance-negative' : 'route-balance-cell'} aria-label={day.balance === null ? 'Saldo indisponível' : 'Saldo projetado'}>
              {day.balance === null ? '—' : balance + ' ' + symbol}
            </td>
          </tr>
        })}
      </tbody>
    </table>
    {days.length === 0 ? <div className="route-empty">Não existem movimentos para este filtro neste mês.</div> : null}
  </div>
}
