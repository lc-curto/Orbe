import { useMemo, useState } from 'react'
import { MonthSelector } from './MonthSelector'
import type { Operation } from './api/types'

type RouteFilter = 'ALL' | 'INCOME' | 'FIXED' | 'VARIABLE'

type RouteDay = {
  date: string
  income: number
  expenses: number
  operations: Operation[]
}

const filterOptions: Array<{ value: RouteFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'FIXED', label: 'G. fixos' },
  { value: 'VARIABLE', label: 'G. variáveis' },
]

function dateKey(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

function formatDay(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit' }).format(date)
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

function operationLabel(operation: Operation) {
  return operation.description?.trim() || (operation.operation_type === 'INCOME' ? 'Receita' : 'Despesa')
}

function operationDate(operation: Operation) {
  return dateKey(operation.effective_at ?? operation.planned_at)
}

export function FinancialRoutePage({ operations, month, onMonthChange }: {
  operations: Operation[]
  month: string
  onMonthChange: (month: string) => void
}) {
  const [onlyMovementDays, setOnlyMovementDays] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [detailFilter, setDetailFilter] = useState<RouteFilter>('ALL')

  const days = useMemo<RouteDay[]>(() => {
    const [year, monthNumber] = month.split('-').map(Number)
    const count = new Date(year, monthNumber, 0).getDate()
    const first = `${year}-${String(monthNumber).padStart(2, '0')}-01`
    const last = `${year}-${String(monthNumber).padStart(2, '0')}-${String(count).padStart(2, '0')}`
    const grouped = new Map<string, Operation[]>()
    operations.forEach((operation) => {
      if (operation.state !== 'REALIZED' || operation.operation_type === 'TRANSFER') return
      const key = operationDate(operation)
      if (!key || key < first || key > last) return
      const list = grouped.get(key) ?? []
      list.push(operation)
      grouped.set(key, list)
    })
    return Array.from({ length: count }, (_, index) => {
      const date = `${year}-${String(monthNumber).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
      const dayOperations = grouped.get(date) ?? []
      return dayOperations.reduce<RouteDay>((day, operation) => {
        if (operation.operation_type === 'INCOME') day.income += Number(operation.amount)
        if (operation.operation_type === 'EXPENSE') day.expenses += Number(operation.amount)
        day.operations.push(operation)
        return day
      }, { date, income: 0, expenses: 0, operations: [] })
    })
  }, [operations, month])

  const totals = useMemo(() => days.reduce((summary, day) => ({
    income: summary.income + day.income,
    expenses: summary.expenses + day.expenses,
  }), { income: 0, expenses: 0 }), [days])

  const visibleDays = onlyMovementDays ? days.filter((day) => day.operations.length > 0) : days
  const activeDay = days.find((day) => day.date === selectedDay)
  const detailOperations = (activeDay?.operations ?? []).filter((operation) => {
    if (detailFilter === 'INCOME') return operation.operation_type === 'INCOME'
    if (detailFilter === 'FIXED' || detailFilter === 'VARIABLE') return false
    return true
  })

  return <section className="financial-route-page">
    <header className="financial-route-header">
      <div className="financial-route-title"><h1>Rota Financeira</h1><p>Acompanhamento diário do teu dinheiro</p></div>
      <MonthSelector month={month} onMonthChange={onMonthChange} minMonth="2026-11" maxMonth="2026-12" className="route-month-selector" />
    </header>

    <section className="route-projection-card" aria-label="Saldo projetado no fim do mês">
      <div className="route-projection-copy"><span>Saldo projetado no fim do mês</span><strong>Indisponível</strong><p>A projeção será apresentada quando o contrato financeiro estiver implementado.</p></div>
    </section>

    <div className="route-kpis">
      <article className="route-kpi"><span>Entradas</span><strong>{formatMoney(totals.income)}</strong><small>Receitas realizadas no mês</small></article>
      <article className="route-kpi"><span>Saídas</span><strong>{formatMoney(-totals.expenses)}</strong><small>Despesas realizadas no mês</small></article>
    </div>

    <div className="route-table-toolbar">
      <label className="route-switch"><input type="checkbox" checked={onlyMovementDays} onChange={(event) => setOnlyMovementDays(event.target.checked)} /><span className="route-switch-track" aria-hidden="true" /><span>Só dias com movimento</span></label>
      <span className="route-days-count">{visibleDays.length} dias</span>
    </div>

    <div className="route-table-wrap">
      <table className="route-table">
        <thead><tr><th>Data</th><th>Entrada</th><th>Saída</th><th>Saldo</th></tr></thead>
        <tbody>
          {visibleDays.map((day) => <tr key={day.date} className={day.operations.length ? 'has-movements' : ''}>
            <td><button className="route-day-button" type="button" onClick={() => { setSelectedDay(day.date); setDetailFilter('ALL') }}>{formatDay(day.date)}</button></td>
            <td>{day.income ? formatMoney(day.income) : '—'}</td>
            <td>{day.expenses ? formatMoney(-day.expenses) : '—'}</td>
            <td className="route-balance-unavailable" aria-label="Saldo indisponível">—</td>
          </tr>)}
        </tbody>
      </table>
      {visibleDays.length === 0 ? <div className="route-empty">Não existem dias com movimentos neste mês.</div> : null}
    </div>

    {selectedDay && activeDay ? <div className="route-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedDay(null) }}>
      <section className="route-day-modal" role="dialog" aria-modal="true" aria-labelledby="route-modal-title">
        <header className="route-modal-header"><div><span>Movimentos do dia</span><h2 id="route-modal-title">{formatFullDate(selectedDay)}</h2></div><button type="button" className="route-modal-close" aria-label="Fechar detalhes" onClick={() => setSelectedDay(null)}>×</button></header>
        <nav className="route-detail-filters" aria-label="Filtrar movimentos">
          {filterOptions.map((option) => <button key={option.value} type="button" className={detailFilter === option.value ? 'active' : ''} aria-pressed={detailFilter === option.value} onClick={() => setDetailFilter(option.value)}>{option.label}</button>)}
        </nav>
        {detailFilter === 'FIXED' || detailFilter === 'VARIABLE' ? <div className="route-detail-notice">A classificação entre gastos fixos e variáveis ainda não está disponível nos dados financeiros.</div> : detailOperations.length ? <div className="route-detail-list">{detailOperations.map((operation) => <article className="route-detail-row" key={operation.id}><div className={`route-detail-icon ${operation.operation_type === 'INCOME' ? 'income' : 'expense'}`}>{operation.operation_type === 'INCOME' ? '↑' : '↓'}</div><div className="route-detail-description"><strong>{operationLabel(operation)}</strong><span>{operation.category?.name ?? 'Sem categoria'} · {operation.account?.name ?? 'Conta não identificada'}</span></div><strong className={operation.operation_type === 'INCOME' ? 'route-detail-income' : 'route-detail-expense'}>{operation.operation_type === 'INCOME' ? '+' : '−'} {formatMoney(Number(operation.amount))}</strong></article>)}</div> : <div className="route-detail-empty">Não existem movimentos para este filtro.</div>}
      </section>
    </div> : null}
  </section>
}
