import type { Operation } from '../../../api/types'
import { routeFilterOptions, type RouteFilter } from '../types'
import { formatFullDate, formatMoney, operationLabel } from '../utils'

export function RouteDayModal({ date, operations, filter, onFilterChange, onClose }: {
  date: string
  operations: Operation[]
  filter: RouteFilter
  onFilterChange: (filter: RouteFilter) => void
  onClose: () => void
}) {
  const detailOperations = operations.filter((operation) => {
    if (filter === 'INCOME') return operation.operation_type === 'INCOME'
    if (filter === 'FIXED' || filter === 'VARIABLE') return false
    return true
  })

  return <div className="route-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="route-day-modal" role="dialog" aria-modal="true" aria-labelledby="route-modal-title">
      <header className="route-modal-header"><div><span>Movimentos do dia</span><h2 id="route-modal-title">{formatFullDate(date)}</h2></div><button type="button" className="route-modal-close" aria-label="Fechar detalhes" onClick={onClose}>×</button></header>
      <nav className="route-detail-filters" aria-label="Filtrar movimentos">
        {routeFilterOptions.map((option) => <button key={option.value} type="button" className={filter === option.value ? 'active' : ''} aria-pressed={filter === option.value} onClick={() => onFilterChange(option.value)}>{option.label}</button>)}
      </nav>
      {filter === 'FIXED' || filter === 'VARIABLE' ? <div className="route-detail-notice">A classificação entre gastos fixos e variáveis ainda não está disponível nos dados financeiros.</div> : detailOperations.length ? <div className="route-detail-list">{detailOperations.map((operation) => <article className="route-detail-row" key={operation.id}><div className={`route-detail-icon ${operation.operation_type === 'INCOME' ? 'income' : 'expense'}`}>{operation.operation_type === 'INCOME' ? '↑' : '↓'}</div><div className="route-detail-description"><strong>{operationLabel(operation)}</strong><span>{operation.category?.name ?? 'Sem categoria'} · {operation.account?.name ?? 'Conta não identificada'}</span></div><strong className={operation.operation_type === 'INCOME' ? 'route-detail-income' : 'route-detail-expense'}>{operation.operation_type === 'INCOME' ? '+' : '−'} {formatMoney(Number(operation.amount))}</strong></article>)}</div> : <div className="route-detail-empty">Não existem movimentos para este filtro.</div>}
    </section>
  </div>
}
