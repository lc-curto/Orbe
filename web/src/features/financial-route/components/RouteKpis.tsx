import { OrbeCard } from '../../../design-system/components'
import { formatMoney } from '../utils'

export function RouteKpis({ income, expenses }: { income: number; expenses: number }) {
  return <div className="route-kpis">
    <OrbeCard className="route-kpi"><span>Entradas</span><strong>{formatMoney(income)}</strong><small>Receitas realizadas no mês</small></OrbeCard>
    <OrbeCard className="route-kpi"><span>Saídas</span><strong>{formatMoney(-expenses)}</strong><small>Despesas realizadas no mês</small></OrbeCard>
  </div>
}
