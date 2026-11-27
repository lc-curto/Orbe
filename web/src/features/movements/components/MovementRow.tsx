import type { Operation } from '../../../api/types'
import { formatCurrency } from '../../currency/formatCurrency'
import { useCurrency } from '../../currency/useCurrency'
import { movementAccount, movementName, stateLabel, typeLabel } from '../utils'

export function MovementRow({ operation }: { operation: Operation }) {
  const { symbol } = useCurrency()
  const isExpense = operation.operation_type === 'EXPENSE'
  const isIncome = operation.operation_type === 'INCOME'
  const sign = isExpense ? '− ' : isIncome ? '+ ' : ''
  const tone = isExpense ? '#c2415d' : isIncome ? '#16805b' : '#175cd3'

  return (
    <div className="movement-row">
      <div className={`movement-icon ${isExpense ? 'expense' : isIncome ? 'income' : 'transfer'}`}>
        {isExpense ? '↓' : isIncome ? '↑' : '↔'}
      </div>
      <div className="movement-main">
        <strong>{movementName(operation)}</strong>
        <span>{operation.category?.name ?? typeLabel(operation.operation_type)} · {movementAccount(operation)}</span>
        <div className="movement-badges">
          {operation.state !== 'REALIZED' ? <em className={`state-badge ${operation.state.toLowerCase()}`}>{stateLabel(operation.state)}</em> : null}
          {operation.state === 'PARTIAL' ? <em className="state-badge partial">Parcial</em> : null}
        </div>
      </div>
      <strong className="movement-amount" style={{ color: tone }}>{sign}{formatCurrency(operation.amount, symbol)}</strong>
    </div>
  )
}
