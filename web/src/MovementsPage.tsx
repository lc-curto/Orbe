import { useMemo, useState } from 'react'
import { fetchRecurrenceOccurrences } from './api/finance'
import { MonthSelector } from './MonthSelector'
import type { Account, Category, Operation, RecurrenceOccurrence, RecurrenceSchedule } from './api/types'

type Tab = 'movements' | 'schedules'
type MovementFilter = 'ALL' | 'PENDING' | 'REALIZED' | 'CANCELLED'

type Props = {
  tab: Tab
  setTab: (tab: Tab) => void
  operations: Operation[]
  recurrences: RecurrenceSchedule[]
  accounts: Account[]
  categories: Category[]
  month: string
  onMonthChange: (month: string) => void
  onNewMovement: () => void
  onNotify: (message: string) => void
}

const money = (value: string | number, sign = '') => `${sign}${new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value))}`
const dateText = (value?: string | null) => value ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Sem data'
const monthValue = (value?: string | null) => value ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' }).format(new Date(value)) : ''
const frequencyLabel = (frequency: RecurrenceSchedule['frequency']) => ({ DAILY: 'Diária', WEEKLY: 'Semanal', MONTHLY: 'Mensal' })[frequency]
const stateLabel = (state: string) => ({ PENDING: 'Pendente', REALIZED: 'Realizada', CANCELLED: 'Cancelada', ACTIVE: 'Ativa', PAUSED: 'Pausada', ENDED: 'Terminada' }[state] ?? state)
const typeLabel = (type: string) => ({ EXPENSE: 'Despesa', INCOME: 'Receita', TRANSFER: 'Transferência' }[type] ?? type)

function Kpi({ label, value, tone, detail }: { label: string; value: string; tone: string; detail: string }) {
  return <div className="movement-kpi"><span>{label}</span><strong style={{ color: tone }}>{value}</strong><small>{detail}</small></div>
}

function movementName(operation: Operation) {
  if (operation.description) return operation.description
  return typeLabel(operation.operation_type)
}

function movementAccount(operation: Operation) {
  return operation.account?.name ?? operation.entries?.find((entry) => entry.account)?.account?.name ?? 'Conta não identificada'
}

function MovementRow({ operation }: { operation: Operation }) {
  const isExpense = operation.operation_type === 'EXPENSE'
  const isIncome = operation.operation_type === 'INCOME'
  const sign = isExpense ? '− ' : isIncome ? '+ ' : ''
  const tone = isExpense ? '#c2415d' : isIncome ? '#16805b' : '#175cd3'
  return <div className="movement-row">
    <div className={`movement-icon ${isExpense ? 'expense' : isIncome ? 'income' : 'transfer'}`}>{isExpense ? '↓' : isIncome ? '↑' : '↔'}</div>
    <div className="movement-main"><strong>{movementName(operation)}</strong><span>{operation.category?.name ?? typeLabel(operation.operation_type)} · {movementAccount(operation)}</span><div className="movement-badges">{operation.state !== 'REALIZED' ? <em className={`state-badge ${operation.state.toLowerCase()}`}>{stateLabel(operation.state)}</em> : null}{operation.entries && operation.entries.length > 1 ? <em className="state-badge partial">Parcial</em> : null}</div></div>
    <strong className="movement-amount" style={{ color: tone }}>{sign}{money(operation.amount)}</strong>
  </div>
}

function ScheduleRow({ schedule, accounts, categories, expanded, occurrence, loading, onToggle }: { schedule: RecurrenceSchedule; accounts: Account[]; categories: Category[]; expanded: boolean; occurrence?: RecurrenceOccurrence; loading: boolean; onToggle: () => void }) {
  const account = schedule.account?.name ?? accounts.find((item) => item.id === schedule.account_id)?.name ?? 'Conta não identificada'
  const category = schedule.category?.name ?? categories.find((item) => item.id === schedule.category_id)?.name ?? 'Categoria não identificada'
  return <div className="schedule-card">
    <div className="schedule-summary"><div className={`movement-icon ${schedule.nature === 'EXPENSE' ? 'expense' : 'income'}`}>{schedule.nature === 'EXPENSE' ? '↓' : '↑'}</div><div className="movement-main"><strong>{schedule.description || typeLabel(schedule.nature)}</strong><span>{typeLabel(schedule.nature)} · {category} · {account}</span><span>{money(schedule.amount)} · {frequencyLabel(schedule.frequency)} · Primeira ocorrência: {dateText(schedule.first_occurrence_at)}</span></div><em className={`state-badge ${schedule.status.toLowerCase()}`}>{stateLabel(schedule.status)}</em><button className="icon-action" type="button" aria-label={`Ver ocorrências de ${schedule.description || 'programação'}`} onClick={onToggle}>{expanded ? '−' : '+'}</button></div>
    {expanded ? <div className="occurrence-panel">{loading ? <span className="muted">A carregar ocorrências…</span> : occurrence ? <div className="occurrence-line"><span>{dateText(occurrence.scheduled_at)}</span><strong>{money(occurrence.amount)}</strong><em className={`state-badge ${occurrence.state.toLowerCase()}`}>{stateLabel(occurrence.state)}</em></div> : <span className="muted">Não existem ocorrências disponíveis.</span>}<span className="muted occurrence-note">As ações de edição e materialização serão adicionadas no contexto dos formulários.</span></div> : null}
  </div>
}

export function MovementsPage({ tab, setTab, operations, recurrences, accounts, categories, month, onMonthChange, onNewMovement, onNotify }: Props) {
  const [filter, setFilter] = useState<MovementFilter>('ALL')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [accountFilter, setAccountFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showScheduleFilters, setShowScheduleFilters] = useState(false)
  const [scheduleStatus, setScheduleStatus] = useState('ALL')
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null)
  const [occurrence, setOccurrence] = useState<RecurrenceOccurrence | undefined>()
  const [occurrenceLoading, setOccurrenceLoading] = useState(false)
  const monthOperations = useMemo(() => operations.filter((operation) => monthValue(operation.effective_at ?? operation.planned_at) === month), [operations, month])
  const kpis = useMemo(() => monthOperations.reduce((summary, operation) => { if (operation.state !== 'REALIZED' || operation.operation_type === 'TRANSFER') return summary; if (operation.operation_type === 'INCOME') summary.income += Number(operation.amount); if (operation.operation_type === 'EXPENSE') summary.expenses += Number(operation.amount); return summary }, { income: 0, expenses: 0 }), [monthOperations])
  const visibleOperations = useMemo(() => monthOperations.filter((operation) => (filter === 'ALL' || operation.state === filter) && (typeFilter === 'ALL' || operation.operation_type === typeFilter) && (accountFilter === 'ALL' || String(operation.account?.id ?? operation.entries?.find((entry) => entry.account)?.account?.id) === accountFilter) && (categoryFilter === 'ALL' || String(operation.category?.id) === categoryFilter) && `${movementName(operation)} ${operation.category?.name ?? ''} ${movementAccount(operation)}`.toLowerCase().includes(search.toLowerCase())), [monthOperations, filter, search, typeFilter, accountFilter, categoryFilter])
  const grouped = useMemo(() => visibleOperations.reduce<Record<string, Operation[]>>((groups, operation) => { const key = operation.effective_at ?? operation.planned_at ?? 'sem-data'; (groups[key] ??= []).push(operation); return groups }, {}), [visibleOperations])
  const visibleSchedules = recurrences.filter((schedule) => (scheduleStatus === 'ALL' || schedule.status === scheduleStatus) && `${schedule.description ?? ''} ${schedule.frequency}`.toLowerCase().includes(search.toLowerCase()))

  async function toggleSchedule(id: number) {
    if (expandedSchedule === id) { setExpandedSchedule(null); return }
    setExpandedSchedule(id); setOccurrence(undefined); setOccurrenceLoading(true)
    try { const data = await fetchRecurrenceOccurrences(id); setOccurrence(data[0]) } catch { onNotify('Não foi possível carregar as ocorrências.') } finally { setOccurrenceLoading(false) }
  }

  return <section className="movements-page">
    <div className="movements-header"><div className="movements-heading"><h1>Movimentos</h1></div><div className="movements-header-actions"><button className="primary-button desktop-new-button" type="button" onClick={tab === 'movements' ? onNewMovement : () => onNotify('O formulário de nova programação será adicionado na fase de formulários.')}>{tab === 'movements' ? '+ Novo movimento' : '+ Nova programação'}</button><MonthSelector month={month} onMonthChange={onMonthChange} minMonth="2026-11" maxMonth="2026-12" className="movement-month-selector" /></div></div>
    <button className="primary-button mobile-new-button" type="button" onClick={tab === 'movements' ? onNewMovement : () => onNotify('O formulário de nova programação será adicionado na fase de formulários.')}>{tab === 'movements' ? '+ Novo movimento' : '+ Nova programação'}</button>
    <div className="movement-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === 'movements'} className={tab === 'movements' ? 'active' : ''} onClick={() => setTab('movements')}>Movimentos</button><button type="button" role="tab" aria-selected={tab === 'schedules'} className={tab === 'schedules' ? 'active' : ''} onClick={() => setTab('schedules')}>Programações</button></div>
    {tab === 'movements' ? <>
      <div className="movement-kpis"><Kpi label="Receitas" value={money(kpis.income, '+ ')} tone="#16805b" detail="Realizadas no período" /><Kpi label="Despesas" value={money(kpis.expenses, '− ')} tone="#c2415d" detail="Realizadas no período" /><Kpi label="Resultado" value={money(Math.abs(kpis.income - kpis.expenses), kpis.income - kpis.expenses >= 0 ? '+ ' : '− ')} tone={kpis.income - kpis.expenses >= 0 ? '#175cd3' : '#c2415d'} detail="Receitas − despesas" /></div>
      <div className="movement-toolbar"><label className="search-control"><span>Pesquisar</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar movimentos por descrição, categoria ou conta…" /></label><button className="secondary-button toolbar-filter" type="button" aria-expanded={showFilters} onClick={() => setShowFilters((value) => !value)}>⚙ Filtros</button></div>
      {showFilters ? <div className="filter-panel"><label>Tipo<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="ALL">Todos</option><option value="EXPENSE">Despesas</option><option value="INCOME">Receitas</option><option value="TRANSFER">Transferências</option></select></label><label>Conta<select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}><option value="ALL">Todas</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label>Categoria<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="ALL">Todas</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div> : null}
      <div className="movement-filter-row"><div className="filter-chips">{([['ALL', 'Todos'], ['PENDING', 'Pendentes'], ['REALIZED', 'Realizados'], ['CANCELLED', 'Cancelados']] as const).map(([value, label]) => <button key={value} type="button" className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
      <div className="movement-list">{Object.keys(grouped).length === 0 ? <div className="empty-state">Não existem movimentos para os critérios selecionados.</div> : Object.entries(grouped).map(([date, items]) => <div className="movement-group" key={date}><h2>{dateText(date)}</h2>{items.map((operation) => <MovementRow operation={operation} key={operation.id} />)}</div>)}</div>
    </> : <>
      <div className="movement-toolbar"><label className="search-control"><span>Pesquisar</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar programações por descrição ou frequência…" /></label><button className="secondary-button toolbar-filter" type="button" aria-label="Filtros de programações" aria-expanded={showScheduleFilters} onClick={() => setShowScheduleFilters((value) => !value)}>⚙ Filtros</button></div>
      {showScheduleFilters ? <div className="filter-panel"><label>Estado<select value={scheduleStatus} onChange={(event) => setScheduleStatus(event.target.value)}><option value="ALL">Todos</option><option value="ACTIVE">Ativas</option><option value="PAUSED">Pausadas</option><option value="ENDED">Terminadas</option></select></label></div> : null}
      <div className="schedule-list-header"><span>{visibleSchedules.length} programações</span></div><div className="schedule-list">{visibleSchedules.map((schedule) => <ScheduleRow key={schedule.id} schedule={schedule} accounts={accounts} categories={categories} expanded={expandedSchedule === schedule.id} occurrence={occurrence} loading={occurrenceLoading && expandedSchedule === schedule.id} onToggle={() => void toggleSchedule(schedule.id)} />)}{visibleSchedules.length === 0 ? <div className="empty-state">Ainda não existem programações para os critérios selecionados.</div> : null}</div>
    </>}
  </section>
}
