import type { ReactNode } from 'react'
import type { AuthUser, Category } from '../../../api/types'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'
import { useTheme } from '../../theme/useTheme'

type Props = { user: AuthUser; categories: Category[] }

const currencyOptions: Array<{ value: CurrencySymbol; label: string }> = [
  { value: '$', label: 'Dólar americano (USD · $)' },
  { value: '€', label: 'Euro (EUR · €)' },
  { value: '£', label: 'Libra esterlina (GBP · £)' },
  { value: '¥', label: 'Iene japonês (JPY · ¥)' },
  { value: 'CN¥', label: 'Yuan chinês (CNY · CN¥)' },
  { value: 'CHF', label: 'Franco suíço (CHF)' },
  { value: 'CA$', label: 'Dólar canadiano (CAD · CA$)' },
  { value: 'A$', label: 'Dólar australiano (AUD · A$)' },
  { value: 'R$', label: 'Real brasileiro (BRL · R$)' },
  { value: '₹', label: 'Rupia indiana (INR · ₹)' },
]

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="settings-section"><h2>{title}</h2><div className="settings-section-content">{children}</div></section>
}

function SettingsRow({ title, detail, value }: { title: string; detail?: string; value?: string }) {
  return <div className="settings-row"><div className="settings-row-copy"><strong>{title}</strong>{detail ? <span>{detail}</span> : null}</div>{value ? <span className="settings-row-value">{value}</span> : null}</div>
}

export function SettingsPage({ user, categories }: Props) {
  const { symbol, setSymbol } = useCurrency()
  const { theme, setTheme } = useTheme()
  const darkModeEnabled = theme === 'dark'

  return <section className="settings-page" aria-labelledby="settings-page-title">
    <header className="settings-page-header">
      <h1 id="settings-page-title">Configurações</h1>
      <p>Preferências da tua experiência no Orbe</p>
    </header>
    <div className="settings-layout">
      <SettingsSection title="Preferências">
        <div className="settings-row settings-profile-row">
          <strong className="settings-profile-label">Perfil</strong>
          <strong className="settings-profile-name">{user.name}</strong>
          <span className="settings-profile-email">{user.email}</span>
        </div>
        <div className="settings-row settings-currency-row">
          <div className="settings-row-copy">
            <strong>Moeda principal</strong>
            <span>Altera apenas o símbolo apresentado; não converte valores.</span>
          </div>
          <label className="settings-select-label" htmlFor="settings-currency">
            <span>Moeda</span>
            <select id="settings-currency" value={symbol} onChange={(event) => setSymbol(event.target.value as CurrencySymbol)}>
              {currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
        <details className="settings-categories-details">
          <summary>
            <div className="settings-row-copy">
              <strong>Categorias</strong>
              <span>{categories.length} categorias disponíveis · consulta</span>
            </div>
            <span className="settings-row-value">Ver</span>
          </summary>
          <div className="settings-category-list">
            {categories.length ? categories.map((category) => <span className="settings-category-chip" key={category.id}>{category.name}<small>{category.nature === 'EXPENSE' ? 'Despesa' : 'Receita'}</small></span>) : <p className="settings-category-empty">Não existem categorias disponíveis.</p>}
          </div>
        </details>
        <div className="settings-row settings-theme-row">
          <div className="settings-row-copy">
            <strong>Aparência</strong>
            <span>Escolhe entre o tema claro e escuro da interface.</span>
          </div>
          <button
            type="button"
            className="settings-theme-toggle"
            role="switch"
            aria-checked={darkModeEnabled}
            aria-label="Modo escuro"
            onClick={() => setTheme(darkModeEnabled ? 'light' : 'dark')}
          >
            <span className="settings-theme-switch-track" aria-hidden="true"><span /></span>
            <span>{darkModeEnabled ? 'Escuro' : 'Claro'}</span>
          </button>
        </div>
      </SettingsSection>
      <SettingsSection title="Segurança e dados">
        <SettingsRow title="Segurança" detail="As opções de segurança são geridas pela conta." value="Conta" />
        <SettingsRow title="Dados e cópias de segurança" detail="Exportação e restauro ainda não disponíveis." value="Indisponível" />
      </SettingsSection>
      <SettingsSection title="Sobre o Orbe">
        <SettingsRow title="Orbe" detail="Gestão financeira pessoal" value="Web" />
      </SettingsSection>
      <p className="settings-storage-note">Moeda e tema são preferências locais deste navegador. A moeda altera apenas o símbolo; não modifica os dados financeiros.</p>
    </div>
  </section>
}
