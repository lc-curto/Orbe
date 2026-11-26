import { OrbeIcon } from '../../../design-system/Icon'
import { orbe } from '../../../design-system/tokens'
import type { DebtListItem } from '../types'

type Props = {
  debts: DebtListItem[] | null
  loading: boolean
  error: string | null
}

function amount(value: string | number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function money(value: number): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

function DebtRow({ debt }: { debt: DebtListItem }) {
  const total = amount(debt.totalAmount)
  const paid = amount(debt.paidAmount)
  const progress = total > 0 ? Math.max(0, Math.min(100, paid / total * 100)) : 0

  return <article className="debts-list-item">
    <div className="debts-item-icon"><OrbeIcon name="wallet" size={20} color={orbe.colors.primary} /></div>
    <div className="debts-item-content">
      <div className="debts-item-heading">
        <div className="debts-item-name">
          <strong>{debt.name}</strong>
          <span>{debt.typeLabel}</span>
        </div>
      </div>
      <div className="debts-item-amounts">
        <div><span>Em aberto</span><strong>{money(amount(debt.openBalance))}</strong></div>
        <div><span>Prestação mensal</span><strong>{money(amount(debt.monthlyPayment))}</strong></div>
      </div>
      <div className="debts-progress-track" role="progressbar" aria-label={`Valor liquidado de ${debt.name}`} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="debts-progress-labels">
        <span>Liquidado {money(paid)}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  </article>
}

export function DebtList({ debts, loading, error }: Props) {
  if (loading) return <div className="debts-state" role="status">A carregar dívidas…</div>
  if (error) return <div className="debts-state" role="alert">Não foi possível carregar as dívidas. {error}</div>
  if (debts === null) return <div className="debts-state debts-state-unavailable">
    <span className="debts-state-icon"><OrbeIcon name="wallet" size={22} color={orbe.colors.textMuted} /></span>
    <strong>Dados de dívidas ainda não ligados</strong>
    <p>A interface está preparada. Os valores serão apresentados quando o read model financeiro for definido numa fase posterior. Não são usados valores simulados.</p>
  </div>
  if (debts.length === 0) return <div className="debts-state">Ainda não existem dívidas registadas.</div>

  return <div className="debts-list">{debts.map((debt) => <DebtRow key={debt.id} debt={debt} />)}</div>
}
