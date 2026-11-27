import { useEffect, useRef, useState } from 'react'
import type { Card, CardInvoice, Operation } from '../../../api/types'
import { formatCurrency } from '../../currency/formatCurrency'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'
import { MovementRow } from '../../movements/components/MovementRow'

type Props = {
  cards: Card[]
  operations: Operation[]
  loading: boolean
  error: string | null
}

type CardFilter = 'ACTIVE' | 'CLOSED'

function money(value: string | number, symbol: CurrencySymbol = '€'): string {
  return formatCurrency(value, symbol)
}

function date(value: string): string {
  if (!value) return '—'
  const parsed = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short' }).format(parsed)
}

function invoiceMonth(value: string): string {
  if (!value) return 'Fatura'
  const parsed = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(parsed.getTime())) return 'Fatura'
  return new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(parsed)
}

function invoiceState(invoice: CardInvoice): string {
  const state = invoice.cycle_state.toUpperCase()
  if (state.includes('PAID') || state.includes('PAGA')) return 'Paga'
  if (state.includes('CANCEL')) return 'Cancelada'
  if (Number(invoice.summary.open_amount) <= 0 && Number(invoice.summary.obligation_amount) > 0) return 'Paga'
  if (Number(invoice.summary.paid_amount) > 0) return 'Parcial'
  return 'Em aberto'
}

function CardIcon() {
  return <span className="accounts-row-icon cards-row-icon" aria-hidden="true">▣</span>
}

export function CardsPage({ cards, operations, loading, error }: Props) {
  const { symbol } = useCurrency()
  const [filter, setFilter] = useState<CardFilter>('ACTIVE')
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const pageRef = useRef<HTMLElement | null>(null)

  const activeCards = cards.filter((card) => card.status === 'ACTIVE')
  const closedCards = cards.filter((card) => card.status !== 'ACTIVE')
  const visibleCards = filter === 'ACTIVE' ? activeCards : closedCards
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null
  const selectedInvoice = selectedCard?.invoices?.find((invoice) => invoice.id === selectedInvoiceId) ?? null
  const invoiceOperations = selectedInvoice ? operations.filter((operation) => operation.entries?.some((entry) => entry.invoice?.id === selectedInvoice.id)) : []
  const filteredInvoiceOperations = invoiceOperations.filter((operation) => `${operation.description ?? ''} ${operation.category?.name ?? ''} ${operation.account?.name ?? ''} ${operation.entries?.map((entry) => entry.account?.name ?? '').join(' ') ?? ''}`.toLowerCase().includes(invoiceSearch.toLowerCase()))
  const groupedInvoiceOperations = filteredInvoiceOperations.reduce<Record<string, Operation[]>>((groups, operation) => { const dateValue = operation.effective_at ?? operation.planned_at; const key = dateValue ? dateValue.slice(0, 10) : 'sem-data'; (groups[key] ??= []).push(operation); return groups }, {})
  const totalDebt = activeCards.reduce((total, card) => total + Number(card.summary.used_amount || 0), 0)

  useEffect(() => {
    if (openMenuId === null) return
    function closeOnOutsideClick(event: PointerEvent) {
      if (!pageRef.current?.contains(event.target as Node)) setOpenMenuId(null)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [openMenuId])

  function cardUsage(card: Card): number {
    const limit = Number(card.credit_limit)
    return limit > 0 ? Math.min(100, Math.max(0, Number(card.summary.used_amount) / limit * 100)) : 0
  }

  function renderInvoice(invoice: CardInvoice) {
    const state = invoiceState(invoice)
    return <button className="cards-invoice-row cards-invoice-button" type="button" key={invoice.id} onClick={() => { setSelectedInvoiceId(invoice.id); setInvoiceSearch('') }}>
      <div className="cards-invoice-heading">
        <div>
          <strong>{invoiceMonth(invoice.period_start)}</strong>
          <span>{date(invoice.period_start)} – {date(invoice.period_end)}</span>
        </div>
        <span className={`cards-invoice-status ${state === 'Paga' ? 'is-paid' : state === 'Cancelada' ? 'is-cancelled' : 'is-open'}`}>{state}</span>
      </div>
      <div className="cards-invoice-amounts">
        <div><span>Em aberto</span><strong>{money(invoice.summary.open_amount, symbol)}</strong></div>
        <div><span>Total</span><strong>{money(invoice.summary.obligation_amount, symbol)}</strong></div>
        <div><span>Pago</span><strong>{money(invoice.summary.paid_amount, symbol)}</strong></div>
      </div>
      <div className="cards-invoice-due"><span>Vencimento</span><strong>{date(invoice.due_date)}</strong></div>
    </button>
  }

  return <section ref={pageRef} className="accounts-page cards-page" aria-labelledby="cards-page-title">
    {selectedCard && selectedInvoice ? <>
      <header className="accounts-page-header cards-detail-header">
        <div>
          <button className="cards-back-button" type="button" onClick={() => { setSelectedInvoiceId(null); setInvoiceSearch('') }}>‹ Voltar às faturas</button>
          <h1 id="cards-page-title">Fatura de {invoiceMonth(selectedInvoice.period_start)}</h1>
          <p className="accounts-page-subtitle">{selectedCard.name} · Vence {date(selectedInvoice.due_date)}</p>
        </div>
      </header>
      <div className="cards-detail-summary">
        <span className="cards-summary-label">Total da fatura</span>
        <strong className="cards-available-value">{money(selectedInvoice.summary.obligation_amount, symbol)}</strong>
        <div className="cards-invoice-total-lines">
          <span>Pago <strong>{money(selectedInvoice.summary.paid_amount, symbol)}</strong></span>
          <span>Em aberto <strong>{money(selectedInvoice.summary.open_amount, symbol)}</strong></span>
        </div>
      </div>
      <h2 className="accounts-section-title">Movimentos</h2>
      <div className="cards-invoice-movements">
        <label className="cards-invoice-search-label" htmlFor="cards-invoice-search">Pesquisar movimentos</label>
        <input id="cards-invoice-search" className="cards-invoice-search" type="search" placeholder="Pesquisar por descrição, categoria ou conta…" value={invoiceSearch} onChange={(event) => setInvoiceSearch(event.target.value)} />
        {loading ? <div className="accounts-state" role="status">A carregar movimentos…</div> : null}
        {!loading && error ? <div className="accounts-state" role="alert">Não foi possível carregar os movimentos. {error}</div> : null}
        {!loading && !error && invoiceOperations.length === 0 ? <div className="accounts-state">Esta fatura ainda não tem movimentos associados.</div> : null}
        {!loading && !error && invoiceOperations.length > 0 && filteredInvoiceOperations.length === 0 ? <div className="accounts-state">Nenhum movimento corresponde à pesquisa.</div> : null}
        {!loading && !error ? Object.entries(groupedInvoiceOperations).sort(([a], [b]) => b.localeCompare(a)).map(([day, dayOperations]) => <section className="cards-invoice-day-group" key={day}>
          <h3>{day === 'sem-data' ? 'Sem data' : new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(day.length === 10 ? `${day}T00:00:00` : day))}</h3>
          <div className="cards-invoice-day-list">{dayOperations.map((operation) => <MovementRow key={operation.id} operation={operation} />)}</div>
        </section>) : null}
      </div>
    </> : selectedCard ? <>
      <header className="accounts-page-header cards-detail-header">
        <div>
          <button className="cards-back-button" type="button" onClick={() => { setSelectedInvoiceId(null); setSelectedCardId(null); setOpenMenuId(null) }}>‹ Cartões</button>
          <h1 id="cards-page-title">{selectedCard.name}</h1>
          <p className="accounts-page-subtitle">Detalhes do cartão</p>
        </div>
      </header>
      <div className="cards-detail-summary">
        <span className="cards-summary-label">Disponível</span>
        <strong className="cards-available-value">{money(selectedCard.summary.available_amount, symbol)}</strong>
        <p>de {money(selectedCard.credit_limit, symbol)}</p>
        <div className="cards-usage-track" role="progressbar" aria-label="Limite utilizado" aria-valuenow={Math.round(cardUsage(selectedCard))} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${cardUsage(selectedCard)}%` }} />
        </div>
        <div className="cards-usage-foot">
          <span>Utilizado {money(selectedCard.summary.used_amount, symbol)}</span>
          <span>{cardUsage(selectedCard).toLocaleString('pt-PT', { maximumFractionDigits: 0 })}%</span>
        </div>
        <div className="cards-cycle-line">
          <span>Fecho {selectedCard.closing_day ?? '—'} · Vence {selectedCard.due_day ?? '—'}</span>
        </div>
      </div>
      <h2 className="accounts-section-title">Faturas deste cartão</h2>
      <div className="cards-invoices-list">
        {loading ? <div className="accounts-state" role="status">A carregar faturas…</div> : null}
        {!loading && error ? <div className="accounts-state" role="alert">Não foi possível carregar as faturas. {error}</div> : null}
        {!loading && !error && (selectedCard.invoices ?? []).length === 0 ? <div className="accounts-state">Este cartão ainda não tem faturas.</div> : null}
        {!loading && !error ? (selectedCard.invoices ?? []).map(renderInvoice) : null}
      </div>
    </> : <>
      <header className="accounts-page-header">
        <div>
          <h1 id="cards-page-title">Cartões</h1>
          <p className="accounts-page-subtitle">{activeCards.length} {activeCards.length === 1 ? 'cartão ativo' : 'cartões ativos'}</p>
        </div>
      </header>
      <div className="accounts-total-card cards-total-card">
        <span className="accounts-total-label">TOTAL EM DÍVIDA</span>
        <strong className="accounts-total-value">{money(totalDebt, symbol)}</strong>
        <p className="accounts-readonly-note">{cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}</p>
      </div>
      <div className="accounts-filter-row">
        <label className="accounts-filter-label" htmlFor="cards-status-filter">Mostrar:</label>
        <select id="cards-status-filter" className="accounts-status-filter" value={filter} onChange={(event) => { setFilter(event.target.value as CardFilter); setOpenMenuId(null) }} disabled={loading || Boolean(error)}>
          <option value="ACTIVE">Ativos ({activeCards.length})</option>
          <option value="CLOSED">Encerrados ({closedCards.length})</option>
        </select>
      </div>
      <h2 className="accounts-section-title">Os meus cartões</h2>
      <div className="accounts-list cards-list">
        {loading ? <div className="accounts-state" role="status">A carregar cartões…</div> : null}
        {!loading && error ? <div className="accounts-state" role="alert">Não foi possível carregar os cartões. {error}</div> : null}
        {!loading && !error && visibleCards.length === 0 ? <div className="accounts-state">{filter === 'ACTIVE' ? 'Ainda não existem cartões ativos.' : 'Não existem cartões encerrados.'}</div> : null}
        {!loading && !error ? visibleCards.map((card) => {
          const isActive = card.status === 'ACTIVE'
          const menuOpen = openMenuId === card.id
          const usage = cardUsage(card)
          const menuId = `cards-menu-${card.id}`
          return <article className="accounts-row cards-row" key={card.id}>
            <CardIcon />
            <button className="cards-row-open" type="button" onClick={() => { setSelectedCardId(card.id); setOpenMenuId(null) }} aria-label={`Abrir detalhes de ${card.name}`}>
              <div className="cards-row-top">
                <strong>{card.name}</strong>
                <span className={`accounts-status-badge ${isActive ? 'is-active' : 'is-closed'}`}>{isActive ? 'Ativo' : 'Encerrado'}</span>
                <span className="cards-row-chevron" aria-hidden="true">›</span>
              </div>
              <div className="cards-row-limit-line"><span>Utilizado {money(card.summary.used_amount, symbol)}</span><span>Limite total {money(card.credit_limit, symbol)}</span></div>
              <div className="cards-usage-track" role="progressbar" aria-label={`Limite utilizado por ${card.name}`} aria-valuenow={Math.round(usage)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${usage}%` }} /></div>
              <div className="cards-row-available-line"><span>Disponível {money(card.summary.available_amount, symbol)}</span><span>{usage.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}% utilizado</span></div>
              <div className="cards-cycle-line"><span>Fecho {card.closing_day ?? '—'} · Vence {card.due_day ?? '—'}</span></div>
            </button>
            <div className="accounts-row-actions">
              <button className="accounts-menu-button" type="button" aria-label={`Ações do cartão ${card.name}`} aria-haspopup="menu" aria-expanded={menuOpen} aria-controls={menuId} onClick={() => setOpenMenuId(menuOpen ? null : card.id)}>⋮</button>
              {menuOpen ? <div className="accounts-menu-panel" id={menuId} role="menu">
                <button className="accounts-menu-item" type="button" role="menuitem" onClick={() => { setSelectedCardId(card.id); setOpenMenuId(null) }}><span aria-hidden="true">▣</span><span>Ver detalhes</span></button>
              </div> : null}
            </div>
          </article>
        }) : null}
      </div>
    </>}
  </section>
}
