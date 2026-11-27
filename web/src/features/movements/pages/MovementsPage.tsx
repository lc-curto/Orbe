import { PageHeader } from '../../../shared/components/PageHeader'
import { useMemo, useState } from 'react'
import { fetchRecurrenceOccurrences } from '../../../api/finance'
import { MonthSelector } from '../../../shared/components/MonthSelector'
import type { Account, Category, Operation, RecurrenceOccurrence, RecurrenceSchedule } from '../../../api/types'
import { formatCurrency } from '../../currency/formatCurrency'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'
import { MovementRow } from '../components/MovementRow'
import { movementAccount, movementName, stateLabel, typeLabel } from '../utils'

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
  onNotify: (message: string) => void
}

const money = (value: string | number, sign = '', symbol: CurrencySymbol = '€') => `${sign}${formatCurrency(value, symbol)}`
const dateText = (value?: string | null) => value ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Sem data'
const monthValue = (value?: string | null) => value ? new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' }).format(new Date(value)) : ''
const frequencyLabel = (frequency: RecurrenceSchedule['frequency']) => ({ DAILY: 'Diária', WEEKLY: 'Semanal', MONTHLY: 'Mensal' })[frequency]

function MovementFinancialSummary({ income, expenses, symbol }: { income: number; expenses: number; symbol: CurrencySymbol }) {
  const result = income - expenses
  return <section className="orbe-financial-highlight-card movement-financial-summary" aria-label="Resumo financeiro dos movimentos">
    <div className="movement-financial-result">
      <span>Resultado</span>
      <strong>{money(Math.abs(result), result >= 0 ? '+ ' : '− ', symbol)}</strong>
    </div>
    <div className="movement-financial-breakdown">
      <div><span>Ganhos</span><strong>{money(income, '+ ', symbol)}</strong></div>
      <div><span>Gastos</span><strong>{money(expenses, '− ', symbol)}</strong></div>
    </div>
  </section>
}

function ScheduleRow({ schedule, accounts, categories, expanded, occurrence, loading, onToggle }: { schedule: RecurrenceSchedule; accounts: Account[]; categories: Category[]; expanded: boolean; occurrence?: RecurrenceOccurrence; loading: boolean; onToggle: () => void }) {
  const { symbol } = useCurrency()
  const account = schedule.account?.name ?? accounts.find((item) => item.id === schedule.account_id)?.name ?? 'Conta não identificada'
  const category = schedule.category?.name ?? categories.find((item) => item.id === schedule.category_id)?.name ?? 'Categoria não identificada'
  return <div className="schedule-card">
    <div className="schedule-summary"><div className={`movement-icon ${schedule.nature === 'EXPENSE' ? 'expense' : 'income'}`}>{schedule.nature === 'EXPENSE' ? '↓' : '↑'}</div><div className="movement-main"><strong>{schedule.description || typeLabel(schedule.nature)}</strong><span>{typeLabel(schedule.nature)} · {category} · {account}</span><span>{money(schedule.amount, '', symbol)} · {frequencyLabel(schedule.frequency)} · Primeira ocorrência: {dateText(schedule.first_occurrence_at)}</span></div><em className={`state-badge ${schedule.status.toLowerCase()}`}>{stateLabel(schedule.status)}</em><button className="icon-action" type="button" aria-label={`Ver ocorrências de ${schedule.description || 'programação'}`} onClick={onToggle}>{expanded ? '−' : '+'}</button></div>
    {expanded ? <div className="occurrence-panel">{loading ? <span className="muted">A carregar ocorrências…</span> : occurrence ? <div className="occurrence-line"><span>{dateText(occurrence.scheduled_at)}</span><strong>{money(occurrence.amount, '', symbol)}</strong><em className={`state-badge ${occurrence.state.toLowerCase()}`}>{stateLabel(occurrence.state)}</em></div> : <span className="muted">Não existem ocorrências disponíveis.</span>}<span className="muted occurrence-note">As ações de edição e materialização serão adicionadas no contexto dos formulários.</span></div> : null}
  </div>
}

export function MovementsPage({ tab, setTab, operations, recurrences, accounts, categories, month, onMonthChange, onNotify }: Props) {
  const { symbol } = useCurrency()
  const [filter, setFilter] = useState<MovementFilter>('ALL')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [accountFilter, setAccountFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showScheduleFilters, setShowScheduleFilters] = useState(false)
  const [scheduleStatus, setScheduleStatus] = useState('ALL')
  const [scheduleFrequency, setScheduleFrequency] = useState('ALL')
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null)
  const [occurrence, setOccurrence] = useState<RecurrenceOccurrence | undefined>()
  const [occurrenceLoading, setOccurrenceLoading] = useState(false)
  const monthOperations = useMemo(() => operations.filter((operation) => monthValue(operation.effective_at ?? operation.planned_at) === month), [operations, month])
  const kpis = useMemo(() => monthOperations.reduce((summary, operation) => { if (operation.state !== 'REALIZED' || operation.operation_type === 'TRANSFER') return summary; if (operation.operation_type === 'INCOME') summary.income += Number(operation.amount); if (operation.operation_type === 'EXPENSE') summary.expenses += Number(operation.amount); return summary }, { income: 0, expenses: 0 }), [monthOperations])
  const visibleOperations = useMemo(() => monthOperations.filter((operation) => (filter === 'ALL' || operation.state === filter) && (typeFilter === 'ALL' || operation.operation_type === typeFilter) && (accountFilter === 'ALL' || String(operation.account?.id ?? operation.entries?.find((entry) => entry.account)?.account?.id) === accountFilter) && (categoryFilter === 'ALL' || String(operation.category?.id) === categoryFilter) && `${movementName(operation)} ${operation.category?.name ?? ''} ${movementAccount(operation)}`.toLowerCase().includes(search.toLowerCase())), [monthOperations, filter, search, typeFilter, accountFilter, categoryFilter])
  const grouped = useMemo(() => visibleOperations.reduce<Record<string, Operation[]>>((groups, operation) => { const key = operation.effective_at ?? operation.planned_at ?? 'sem-data'; (groups[key] ??= []).push(operation); return groups }, {}), [visibleOperations])
  const visibleSchedules = recurrences.filter((schedule) => (scheduleStatus === 'ALL' || schedule.status === scheduleStatus) && (scheduleFrequency === 'ALL' || schedule.frequency === scheduleFrequency) && `${schedule.description ?? ''} ${schedule.frequency}`.toLowerCase().includes(search.toLowerCase()))

  async function toggleSchedule(id: number) {
    if (expandedSchedule === id) { setExpandedSchedule(null); return }
    setExpandedSchedule(id); setOccurrence(undefined); setOccurrenceLoading(true)
    try { const data = await fetchRecurrenceOccurrences(id); setOccurrence(data[0]) } catch { onNotify('Não foi possível carregar as ocorrências.') } finally { setOccurrenceLoading(false) }
  }

  return <section className="movements-page">
    <PageHeader title="Movimentos" className="movements-header" period={<MonthSelector month={month} onMonthChange={onMonthChange} minMonth="2026-11" maxMonth="2026-12" className="movement-month-selector" />} />
    <div className="movement-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === 'movements'} className={tab === 'movements' ? 'active' : ''} onClick={() => setTab('movements')}>Movimentos</button><button type="button" role="tab" aria-selected={tab === 'schedules'} className={tab === 'schedules' ? 'active' : ''} onClick={() => setTab('schedules')}>Programações</button></div>
    {tab === 'movements' ? <>
      <MovementFinancialSummary income={kpis.income} expenses={kpis.expenses} symbol={symbol} />
      <div className="movement-toolbar movement-search-form" role="search"><label className="search-control"><span>Pesquisar</span><input type="search" aria-label="Pesquisar movimentos" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar movimentos por descrição, categoria ou conta…" /></label></div>
      <div className="movement-filter-row"><button className="secondary-button toolbar-filter filter-icon-button" type="button" aria-label="Abrir filtros de movimentos" title="Filtros" aria-expanded={showFilters} onClick={() => setShowFilters((value) => !value)}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg></button><div className="filter-chips">{([['ALL', 'Todos'], ['PENDING', 'Pendentes'], ['REALIZED', 'Realizados'], ['CANCELLED', 'Cancelados']] as const).map(([value, label]) => <button key={value} type="button" className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
      {showFilters ? <div className="filter-panel"><label>Tipo<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="ALL">Todos</option><option value="EXPENSE">Gastos</option><option value="INCOME">Ganhos</option><option value="TRANSFER">Transferências</option></select></label><label>Conta<select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}><option value="ALL">Todas</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label>Categoria<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="ALL">Todas</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div> : null}
      <div className="movement-list">{Object.keys(grouped).length === 0 ? <div className="empty-state">Não existem movimentos para os critérios selecionados.</div> : Object.entries(grouped).map(([date, items]) => <div className="movement-group" key={date}><h2>{dateText(date)}</h2>{items.map((operation) => <MovementRow operation={operation} key={operation.id} />)}</div>)}</div>
    </> : <>
      <div className="movement-toolbar movement-search-form" role="search"><label className="search-control"><span>Pesquisar</span><input type="search" aria-label="Pesquisar programações" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar programações por descrição ou frequência…" /></label></div>
      <div className="movement-filter-row schedule-filter-row"><button className="secondary-button toolbar-filter filter-icon-button" type="button" aria-label="Abrir filtros de programações" title="Filtros" aria-expanded={showScheduleFilters} onClick={() => setShowScheduleFilters((value) => !value)}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg></button><div className="filter-chips">{([["ALL", "Todas"], ["ACTIVE", "Ativas"], ["PAUSED", "Pausadas"], ["ENDED", "Terminadas"]] as const).map(([value, label]) => <button key={value} type="button" className={scheduleStatus === value ? "selected" : ""} onClick={() => setScheduleStatus(value)}>{label}</button>)}</div>
      </div>{showScheduleFilters ? <div className="filter-panel"><label>Frequência<select value={scheduleFrequency} onChange={(event) => setScheduleFrequency(event.target.value)}><option value="ALL">Todas</option><option value="DAILY">Diária</option><option value="WEEKLY">Semanal</option><option value="MONTHLY">Mensal</option></select></label></div> : null}<div className="schedule-list-header"><span>{visibleSchedules.length} programações</span></div><div className="schedule-list">{visibleSchedules.map((schedule) => <ScheduleRow key={schedule.id} schedule={schedule} accounts={accounts} categories={categories} expanded={expandedSchedule === schedule.id} occurrence={occurrence} loading={occurrenceLoading && expandedSchedule === schedule.id} onToggle={() => void toggleSchedule(schedule.id)} />)}{visibleSchedules.length === 0 ? <div className="empty-state">Ainda não existem programações para os critérios selecionados.</div> : null}</div>
      
    </>}
  </section>
}
