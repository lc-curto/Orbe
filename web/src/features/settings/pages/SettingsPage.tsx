import type { ReactNode } from 'react'
import type { AuthUser, Category } from '../../../api/types'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'

type Props = { user: AuthUser; categories: Category[] }

const currencyOptions: Array<{ value: CurrencySymbol; label: string }> = [
  { value: '€', label: 'Euro (€)' },
  { value: '$', label: 'Dólar ($)' },
  { value: '£', label: 'Libra (£)' },
  { value: 'CHF', label: 'Franco suíço (CHF)' },
]

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="settings-section"><h2>{title}</h2><div className="settings-section-content">{children}</div></section>
}

function SettingsRow({ title, detail, value }: { title: string; detail?: string; value?: string }) {
  return <div className="settings-row"><div className="settings-row-copy"><strong>{title}</strong>{detail ? <span>{detail}</span> : null}</div>{value ? <span className="settings-row-value">{value}</span> : null}</div>
}

export function SettingsPage({ user, categories }: Props) {
  const { symbol, setSymbol } = useCurrency()
  return <section className="settings-page" aria-labelledby="settings-page-title">
    <header className="settings-page-header"><div><h1 id="settings-page-title">Configurações</h1><p>Preferências da tua experiência no Orbe</p></div></header>
    <div className="settings-layout">
      <SettingsSection title="Preferências">
        <SettingsRow title="Perfil" detail={user.email} value={user.name} />
        <div className="settings-row settings-currency-row"><div className="settings-row-copy"><strong>Moeda principal</strong><span>Altera apenas o símbolo apresentado. Os valores não são convertidos nem modificados.</span></div><label className="settings-select-label" htmlFor="settings-currency"><span>Moeda</span><select id="settings-currency" value={symbol} onChange={(event) => setSymbol(event.target.value as CurrencySymbol)}>{currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
        <details className="settings-categories-details">
          <summary><div className="settings-row-copy"><strong>Categorias</strong><span>{categories.length} categorias disponíveis · consulta</span></div><span className="settings-row-value">Ver</span></summary>
          <div className="settings-category-list">{categories.length ? categories.map((category) => <span className="settings-category-chip" key={category.id}>{category.name}<small>{category.nature === 'EXPENSE' ? 'Despesa' : 'Receita'}</small></span>) : <p className="settings-category-empty">Não existem categorias disponíveis.</p>}</div>
        </details>
        <SettingsRow title="Aparência" detail="Tema claro ativo; outros temas ainda não estão disponíveis." value="Claro" />
      </SettingsSection>
      <SettingsSection title="Segurança e dados">
        <SettingsRow title="Segurança" detail="As opções de segurança são geridas pela conta e ainda não têm painel próprio." value="Conta" />
        <SettingsRow title="Dados e cópias de segurança" detail="A exportação e o restauro ainda não estão disponíveis na interface." value="Indisponível" />
      </SettingsSection>
      <SettingsSection title="Sobre o Orbe">
        <SettingsRow title="Orbe" detail="Gestão financeira pessoal" value="Web" />
      </SettingsSection>
      <p className="settings-storage-note">A preferência de símbolo é guardada neste navegador. A alteração é apenas visual e não sincroniza nem converte dados financeiros.</p>
    </div>
  </section>
}
