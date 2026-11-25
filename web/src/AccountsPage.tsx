import { useState } from 'react'
import type { Account } from './api/types'

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
  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE')
  const closedAccounts = accounts.filter((account) => account.status !== 'ACTIVE')
  const visibleAccounts = filter === 'ACTIVE' ? activeAccounts : closedAccounts

  return <section className="accounts-page" aria-labelledby="accounts-page-title">
    <header className="accounts-page-header">
      <div>
        <h1 id="accounts-page-title">Contas</h1>
        <p className="accounts-page-subtitle">{activeAccounts.length} {activeAccounts.length === 1 ? 'conta ativa' : 'contas ativas'}</p>
      </div>
      <button className="accounts-new-button" type="button" disabled aria-label="Nova conta — disponível na fase de formulários">＋ Nova</button>
    </header>

    <div className="accounts-filter-row">
      <label className="accounts-filter-label" htmlFor="accounts-status-filter">Mostrar:</label>
      <select id="accounts-status-filter" className="accounts-status-filter" value={filter} onChange={(event) => setFilter(event.target.value as AccountFilter)} disabled={loading || Boolean(error)}>
        <option value="ACTIVE">Ativas ({activeAccounts.length})</option>
        <option value="CLOSED">Encerradas ({closedAccounts.length})</option>
      </select>
    </div>

    <div className="accounts-list">
      {loading ? <div className="accounts-state" role="status">A carregar contas…</div> : null}
      {!loading && error ? <div className="accounts-state" role="alert">Não foi possível carregar as contas. {error}</div> : null}
      {!loading && !error && visibleAccounts.length === 0 ? <div className="accounts-state">{filter === 'ACTIVE' ? 'Ainda não existem contas ativas.' : 'Não existem contas encerradas.'}</div> : null}
      {!loading && !error ? visibleAccounts.map((account) => {
        const isActive = account.status === 'ACTIVE'
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
        </article>
      }) : null}
    </div>

    <div className="accounts-total-card">
      <span className="accounts-total-label">Saldo total</span>
      <strong className="accounts-total-value">—</strong>
      <p className="accounts-readonly-note">O saldo calculado será apresentado quando o modelo de saldos estiver disponível.</p>
    </div>

    <div className="accounts-reconciliation-entry" aria-label="Conferência de saldos, interface prevista para fase posterior">
      <div><strong>Conferência de saldos</strong><span>Comparação e histórico serão disponibilizados numa fase posterior.</span></div>
      <span aria-hidden="true">↗</span>
    </div>
  </section>
}
