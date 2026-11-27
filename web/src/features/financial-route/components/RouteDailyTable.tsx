import type { RouteDay, RouteFlowFilter } from '../types'
import { formatDay } from '../utils'
import { formatMoneyUnits, parseMoneyUnits } from '../projection'
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
  return <div className="route-table-wrap">
    <table className="route-table">
      <thead><tr><th>Dia</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
      <tbody>
        {days.map((day) => {
          const hasMovements = day.operations.length > 0 || day.invoices.length > 0
          const balanceUnits = day.balance === null ? null : parseMoneyUnits(day.balance)
          const balanceNegative = balanceUnits !== null && balanceUnits < 0n
          const incomeUnits = parseMoneyUnits(day.income)
          const expensesUnits = parseMoneyUnits(day.expenses)
          const income = formatAmount(day.income)
          const expenses = formatAmount(day.expenses)
          const balance = formatAmount(day.balance)
          return <tr key={day.date} className={hasMovements ? 'has-movements' : ''}>
            <td><button className="route-day-button" type="button" onClick={() => onSelectDay(day.date)}>{formatDay(day.date)}</button></td>
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
