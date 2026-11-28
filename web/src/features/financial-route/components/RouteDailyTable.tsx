import type { RouteDay, RouteFlowFilter } from '../types'
import type { FinancialRouteOverdueItem } from '../../../api/types'
import { formatDay } from '../utils'
import { formatMoneyUnits, isDisplayedNegative, localDateKey, parseMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

function formatAmount(value: string | null): string {
  const units = value === null ? null : parseMoneyUnits(value)
  return units === null ? '—' : formatMoneyUnits(units)
}

function sumOverdue(items: FinancialRouteOverdueItem[], nature: FinancialRouteOverdueItem['nature']): bigint {
  return items.reduce((total, item) => {
    if (item.nature !== nature) return total
    const units = parseMoneyUnits(item.amount)
    return units === null ? total : total + (units < 0n ? -units : units)
  }, 0n)
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
          const incomeUnits = (parseMoneyUnits(day.income) ?? 0n) + sumOverdue(day.overdueItems, 'INCOME')
          const expensesUnits = (parseMoneyUnits(day.expenses) ?? 0n) + sumOverdue(day.overdueItems, 'EXPENSE')
          const income = formatMoneyUnits(incomeUnits)
          const expenses = formatMoneyUnits(expensesUnits)
          const balance = formatAmount(day.balance)
          const isToday = day.date === today
          return <tr key={day.date} data-route-date={day.date} className={[hasMovements ? 'has-movements' : '', isToday ? 'route-today' : ''].filter(Boolean).join(' ')} onClick={() => onSelectDay(day.date)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectDay(day.date) } }} tabIndex={0} aria-label={`Abrir detalhes de ${formatDay(day.date)}`}>
            <td><button className="route-day-button" type="button" aria-current={isToday ? "date" : undefined} onClick={(event) => { event.stopPropagation(); onSelectDay(day.date) }}>{formatDay(day.date)}</button></td>
            <td className="route-income-cell">{flowFilter === 'EXPENSE' || incomeUnits === 0n ? '—' : '+ ' + income + ' ' + symbol}</td>
            <td className="route-expense-cell">{flowFilter === 'INCOME' || expensesUnits === 0n ? '—' : '− ' + expenses + ' ' + symbol}</td>
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
