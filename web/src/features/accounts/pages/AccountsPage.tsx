import { PageHeader } from '../../../shared/components/PageHeader'
import { useEffect, useRef, useState } from 'react'
import type { Account } from '../../../api/types'

type Props = {
  accounts: Account[]
  loading: boolean
  error: string | null
}

type AccountFilter = 'ACTIVE' | 'CLOSED'

const accountTypeLabel: Record<Account['account_type'], string> = {
  BANK: 'Banco',
  CASH: 'Dinheiro',
  WALLET: 'Carteira digital',
}

function AccountIcon({ type }: { type: Account['account_type'] }) {
  const symbol = type === 'BANK' ? '▤' : type === 'CASH' ? '◉' : '▣'
  return <span className="accounts-row-icon" aria-hidden="true">{symbol}</span>
}

export function AccountsPage({ accounts, loading, error }: Props) {
  const [filter, setFilter] = useState<AccountFilter>('ACTIVE')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const pageRef = useRef<HTMLElement | null>(null)

  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE')
  const closedAccounts = accounts.filter((account) => account.status !== 'ACTIVE')
  const visibleAccounts = filter === 'ACTIVE' ? activeAccounts : closedAccounts

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

  return <section ref={pageRef} className="accounts-page" aria-labelledby="accounts-page-title">
    <PageHeader title="Contas" titleId="accounts-page-title" description={`${activeAccounts.length} ${activeAccounts.length === 1 ? 'conta ativa' : 'contas ativas'}`} className="accounts-page-header" />

    <div className="accounts-total-card">
      <span className="accounts-total-label">Saldo total</span>
      <strong className="accounts-total-value">—</strong>
      <p className="accounts-readonly-note">O saldo calculado será apresentado quando o modelo de saldos estiver disponível.</p>
    </div>

    <div className="accounts-filter-row">
      <label className="accounts-filter-label" htmlFor="accounts-status-filter">Mostrar:</label>
      <select
        id="accounts-status-filter"
        className="accounts-status-filter"
        value={filter}
        onChange={(event) => {
          setFilter(event.target.value as AccountFilter)
          setOpenMenuId(null)
          setNotice(null)
        }}
        disabled={loading || Boolean(error)}
      >
        <option value="ACTIVE">Ativas ({activeAccounts.length})</option>
        <option value="CLOSED">Encerradas ({closedAccounts.length})</option>
      </select>
    </div>

    <h2 className="accounts-section-title">As minhas contas</h2>

    <div className="accounts-list">
      {loading ? <div className="accounts-state" role="status">A carregar contas…</div> : null}
      {!loading && error ? <div className="accounts-state" role="alert">Não foi possível carregar as contas. {error}</div> : null}
      {!loading && !error && visibleAccounts.length === 0 ? <div className="accounts-state">{filter === 'ACTIVE' ? 'Ainda não existem contas ativas.' : 'Não existem contas encerradas.'}</div> : null}
      {!loading && !error ? visibleAccounts.map((account) => {
        const isActive = account.status === 'ACTIVE'
        const menuId = `accounts-menu-${account.id}`
        const menuOpen = openMenuId === account.id

        return <article className="accounts-row" key={account.id}>
          <AccountIcon type={account.account_type} />
          <div className="accounts-row-main">
            <div className="accounts-name-line">
              <strong>{account.name}</strong>
              <span className={`accounts-status-badge ${isActive ? 'is-active' : 'is-closed'}`}>{isActive ? 'Ativa' : 'Encerrada'}</span>
            </div>
            <span>{accountTypeLabel[account.account_type]}</span>
          </div>
          <div className="accounts-row-balance">
            <strong>—</strong>
            <span>Saldo atual</span>
          </div>
          <div className="accounts-row-actions">
            <button
              className="accounts-menu-button"
              type="button"
              aria-label={`Ações da conta ${account.name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => {
                setOpenMenuId(menuOpen ? null : account.id)
                setNotice(null)
              }}
            >⋮</button>
            {menuOpen ? <div className="accounts-menu-panel" id={menuId} role="menu">
              <button
                className="accounts-menu-item"
                type="button"
                role="menuitem"
                onClick={() => {
                  setNotice(`A conferência de saldo de “${account.name}” ainda não está implementada nesta fase.`)
                  setOpenMenuId(null)
                }}
              >
                <span aria-hidden="true">◎</span>
                <span>Conferir saldo</span>
              </button>
            </div> : null}
          </div>
        </article>
      }) : null}
    </div>

    {notice ? <div className="accounts-action-notice" role="status">{notice}</div> : null}
  </section>
}
