import { Text } from 'tamagui'
import { OrbeSectionHeader } from './design-system/components'
import { DebtKpis } from './features/debts/components/DebtKpis'
import { DebtList } from './features/debts/components/DebtList'
import type { DebtListItem } from './features/debts/types'

type Props = {
  debts?: DebtListItem[] | null
  loading?: boolean
  error?: string | null
}

export function DebtPage({ debts = null, loading = false, error = null }: Props) {
  return <section className="debts-page" aria-labelledby="debts-page-title">
    <header className="debts-page-header">
      <div>
        <h1 id="debts-page-title">Dívidas</h1>
        <p>Acompanhe os valores em aberto e as prestações das suas dívidas.</p>
      </div>
    </header>

    <DebtKpis debts={debts} />

    <section className="debts-section" aria-labelledby="debts-list-title">
      <OrbeSectionHeader title="As minhas dívidas" />
      <DebtList debts={debts} loading={loading} error={error} />
    </section>
    <Text className="debts-page-note" color="#73758a" fontSize={12}>A criação e gestão de dívidas será disponibilizada quando os contratos e formulários financeiros forem definidos.</Text>
  </section>
}
