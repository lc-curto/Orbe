import type { CardInvoice, Operation } from '../../../api/types'
import { routeFilterOptions, type RouteFilter } from '../types'
import { formatFullDate, formatMoney, operationLabel } from '../utils'
import { formatMoneyUnits, parseMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

export function RouteDayModal({ date, operations, invoices = [], filter, onFilterChange, onClose }: {
  date: string
  operations: Operation[]
  invoices?: CardInvoice[]
  filter: RouteFilter
  onFilterChange: (filter: RouteFilter) => void
  onClose: () => void
}) {
  const { symbol } = useCurrency()
  const detailOperations = operations.filter((operation) => {
    if (filter === 'INCOME') return operation.operation_type === 'INCOME'
    if (filter === 'FIXED' || filter === 'VARIABLE') return false
    return true
  })
  const detailInvoices = filter === 'INCOME' || filter === 'FIXED' || filter === 'VARIABLE' ? [] : invoices

  return <div className="route-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="route-day-modal" role="dialog" aria-modal="true" aria-labelledby="route-modal-title">
      <header className="route-modal-header"><div><span>Movimentos do dia</span><h2 id="route-modal-title">{formatFullDate(date)}</h2></div><button type="button" className="route-modal-close" aria-label="Fechar detalhes" onClick={onClose}>×</button></header>
      <nav className="route-detail-filters" aria-label="Filtrar movimentos">
        {routeFilterOptions.map((option) => <button key={option.value} type="button" className={filter === option.value ? 'active' : ''} aria-pressed={filter === option.value} onClick={() => onFilterChange(option.value)}>{option.label}</button>)}
      </nav>
      {filter === 'FIXED' || filter === 'VARIABLE' ? <div className="route-detail-notice">A classificação entre gastos fixos e variáveis ainda não está disponível nos dados financeiros.</div> : detailOperations.length || detailInvoices.length ? <div className="route-detail-list">
        {detailOperations.map((operation) => <article className="route-detail-row" key={'operation-' + operation.id}>
          <div className={`route-detail-icon ${operation.operation_type === 'INCOME' ? 'income' : operation.operation_type === 'TRANSFER' ? 'transfer' : 'expense'}`}>{operation.operation_type === 'INCOME' ? '↑' : operation.operation_type === 'TRANSFER' ? '↔' : '↓'}</div>
          <div className="route-detail-description"><strong>{operationLabel(operation)}</strong><span>{operation.operation_type === 'TRANSFER' ? 'Transferência entre contas' : `${operation.category?.name ?? 'Sem categoria'} · ${operation.account?.name ?? 'Conta não identificada'} · ${operation.state === 'PENDING' ? 'Pendente' : 'Realizado'}`}</span></div>
          <strong className={operation.operation_type === 'INCOME' ? 'route-detail-income' : operation.operation_type === 'TRANSFER' ? 'route-detail-transfer' : 'route-detail-expense'}>{operation.operation_type === 'TRANSFER' ? '' : operation.operation_type === 'INCOME' ? '+' : '−'} {formatMoney(Number(operation.amount), symbol)}</strong>
        </article>)}
        {detailInvoices.map((invoice) => {
          const openAmount = parseMoneyUnits(invoice.summary.open_amount)
          return <article className="route-detail-row" key={'invoice-' + invoice.id}>
            <div className="route-detail-icon expense" aria-hidden="true">↓</div>
            <div className="route-detail-description"><strong>{invoice.card?.name ?? 'Cartão'} · Fatura</strong><span>Vencimento {formatFullDate(invoice.due_date)} · Projeção consolidada</span></div>
            <strong className="route-detail-expense">{openAmount === null ? '—' : '− ' + formatMoneyUnits(openAmount) + ' ' + symbol}</strong>
          </article>
        })}
      </div> : <div className="route-detail-empty">Não existem movimentos para este filtro.</div>}
    </section>
  </div>
}
