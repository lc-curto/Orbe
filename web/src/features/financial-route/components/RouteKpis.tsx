import { formatMoney } from '../utils'

export function RouteKpis({ income, expenses }: { income: number; expenses: number }) {
  return <div className="route-kpis">
    <article className="route-kpi"><span>Entradas</span><strong>{formatMoney(income)}</strong><small>Receitas realizadas no mês</small></article>
    <article className="route-kpi"><span>Saídas</span><strong>{formatMoney(-expenses)}</strong><small>Despesas realizadas no mês</small></article>
  </div>
}
