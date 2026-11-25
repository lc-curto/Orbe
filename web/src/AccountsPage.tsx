import type { Account } from './api/types'

type Props = {
  accounts: Account[]
  loading: boolean
  error: string | null
}

const accountTypeLabel: Record<Account['account_type'], string> = {
  BANK: 'Conta bancária',
  CASH: 'Dinheiro',
  WALLET: 'Carteira digital',
}

function AccountIcon({ type }: { type: Account['account_type'] }) {
  const symbol = type === 'BANK' ? '▤' : type === 'CASH' ? '◉' : '▣'
  return <span className="accounts-row-icon" aria-hidden="true">{symbol}</span>
}

export function AccountsPage({ accounts, loading, error }: Props) {
  const activeAccounts = accounts.filter((account) => account.status === 'ACTIVE')

  return <section className="accounts-page" aria-labelledby="accounts-page-title">
    <header className="accounts-page-header">
      <h1 id="accounts-page-title">Contas</h1>
      <button className="primary-button" type="button" disabled aria-label="Adicionar conta — disponível na fase de formulários">+ Adicionar</button>
    </header>

    <div className="accounts-total-card">
      <span className="accounts-total-label">Saldo total</span>
      <strong className="accounts-total-value">—</strong>
      <p className="accounts-readonly-note">O saldo calculado será apresentado quando o modelo de saldos estiver disponível.</p>
    </div>

    <section aria-labelledby="accounts-list-title">
      <h2 className="accounts-section-title" id="accounts-list-title">As minhas contas</h2>
      <div className="accounts-list">
        {loading ? <div className="accounts-state" role="status">A carregar contas…</div> : null}
        {!loading && error ? <div className="accounts-state" role="alert">Não foi possível carregar as contas. {error}</div> : null}
        {!loading && !error && activeAccounts.length === 0 ? <div className="accounts-state">Ainda não existem contas registadas.</div> : null}
        {!loading && !error ? activeAccounts.map((account) => <article className="accounts-row" key={account.id}>
          <AccountIcon type={account.account_type} />
          <div className="accounts-row-main">
            <strong>{account.name}</strong>
            <span>{accountTypeLabel[account.account_type]}</span>
          </div>
          <div className="accounts-row-balance" aria-label="Saldo não disponível">—</div>
        </article>) : null}
      </div>
      {!loading && !error && activeAccounts.length > 0 ? <p className="accounts-readonly-note">Os saldos estão temporariamente indisponíveis nesta fase de interface.</p> : null}
    </section>

    <div className="accounts-reconciliation-entry" aria-label="Conferência de saldos, interface prevista para fase posterior">
      <div><strong>Conferência de saldos</strong><span>Comparação e histórico serão disponibilizados numa fase posterior.</span></div>
      <span aria-hidden="true">↗</span>
    </div>
  </section>
}
