import type { CardInvoice, FinancialRouteOverdueItem, Operation } from '../../../api/types'
import { routeFilterOptions, type RouteFilter } from '../types'
import { formatFullDate, operationLabel } from '../utils'
import { formatMoneyUnits, parseMoneyUnits } from '../projection'
import { useCurrency } from '../../currency/useCurrency'

function displayAmount(value: string, symbol: string): string {
  const units = parseMoneyUnits(value)
  return units === null ? '—' : formatMoneyUnits(units) + ' ' + symbol
}

export function RouteDayModal({ date, operations, invoices = [], overdueItems = [], filter, onFilterChange, onClose }: {
  date: string
  operations: Operation[]
  invoices?: CardInvoice[]
  overdueItems?: FinancialRouteOverdueItem[]
  filter: RouteFilter
  onFilterChange: (filter: RouteFilter) => void
  onClose: () => void
}) {
  const { symbol } = useCurrency()
  const overdueOperationIds = new Set(overdueItems.flatMap((item) => item.operation_id === null ? [] : [item.operation_id]))
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
        {detailOperations.map((operation) => {
          const isIncome = operation.operation_type === 'INCOME'
          const isTransfer = operation.operation_type === 'TRANSFER'
          const isOverdue = overdueOperationIds.has(operation.id)
          const status = isOverdue ? 'Vencido' : operation.state === 'PENDING' ? 'Pendente' : 'Realizado'
          const meta = isTransfer
            ? 'Transferência entre contas'
            : operation.category?.name
              ? operation.category.name + ' · ' + (operation.account?.name ?? 'Conta não identificada') + ' · ' + status
              : (operation.account?.name ?? 'Movimento de conta') + ' · ' + status
          return <article className={`route-detail-row ${isOverdue ? 'route-detail-row-overdue' : ''}`} key={'operation-' + operation.id}>
            <div className={`route-detail-icon ${isIncome ? 'income' : isTransfer ? 'transfer' : 'expense'}`}>{isIncome ? '↑' : isTransfer ? '↔' : '↓'}</div>
            <div className="route-detail-description"><strong>{operationLabel(operation)}</strong><span>{meta}</span></div>
            <strong className={isIncome ? 'route-detail-income' : isTransfer ? 'route-detail-transfer' : 'route-detail-expense'}>{isTransfer ? '' : isIncome ? '+' : '−'} {displayAmount(operation.amount, symbol)}</strong>
          </article>
        })}
        {detailInvoices.map((invoice) => <article className="route-detail-row" key={'invoice-' + invoice.id}>
          <div className="route-detail-icon expense" aria-hidden="true">↓</div>
          <div className="route-detail-description"><strong>{invoice.card?.name ?? 'Cartão'} · Fatura</strong><span>Vencimento {formatFullDate(invoice.due_date)} · Projeção consolidada</span></div>
          <strong className="route-detail-expense">− {displayAmount(invoice.summary.open_amount, symbol)}</strong>
        </article>)}
      </div> : <div className="route-detail-empty">Não existem movimentos para este filtro.</div>}
    </section>
  </div>
}
