import { PageHeader } from '../../../shared/components/PageHeader'
import { useEffect, useState } from 'react'
import type { AuthUser, Category } from '../../../api/types'
import { AppIcon } from '../../../shared/components/AppIcon'
import type { AppIconName } from '../../../shared/components/AppIcon'
import { useCurrency } from '../../currency/useCurrency'
import type { CurrencySymbol } from '../../currency/types'
import { useTheme } from '../../theme/useTheme'
import type { ThemeMode } from '../../theme/types'

type Props = { user: AuthUser; categories: Category[] }
type SettingsCategory = 'preferences' | 'account' | 'security' | 'data' | 'about' | 'categories'

type CategoryItem = { id: SettingsCategory; title: string; description: string; icon: AppIconName }

const settingsCategories: CategoryItem[] = [
  { id: 'preferences', title: 'Preferências', description: 'Moeda e aparência', icon: 'settings' },
  { id: 'account', title: 'Conta', description: 'Perfil e dados de acesso', icon: 'user' },
  { id: 'security', title: 'Segurança', description: 'Proteção da conta', icon: 'shield' },
  { id: 'data', title: 'Dados e privacidade', description: 'Exportação e cópias de segurança', icon: 'database' },
  { id: 'about', title: 'Sobre o Orbe', description: 'Informação da aplicação', icon: 'info' },
]

const currencyOptions: Array<{ value: CurrencySymbol; label: string }> = [
  { value: '$', label: 'Dólar americano (USD · $)' },
  { value: '€', label: 'Euro (EUR · €)' },
  { value: '¥', label: 'Iene japonês (JPY · ¥)' },
  { value: '£', label: 'Libra esterlina (GBP · £)' },
  { value: 'CN¥', label: 'Yuan chinês (CNY · CN¥)' },
  { value: 'CHF', label: 'Franco suíço (CHF)' },
  { value: 'CA$', label: 'Dólar canadiano (CAD · CA$)' },
  { value: 'A$', label: 'Dólar australiano (AUD · A$)' },
  { value: 'HK$', label: 'Dólar de Hong Kong (HKD · HK$)' },
  { value: 'R$', label: 'Real brasileiro (BRL · R$)' },
]

const themeOptions: Array<{ value: ThemeMode; label: string; icon: AppIconName }> = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'system', label: 'Sistema', icon: 'monitor' },
]

function SettingsNavItem({ item, selected, onSelect }: { item: CategoryItem; selected: boolean; onSelect: () => void }) {
  return <button type="button" className="settings-nav-item" aria-current={selected ? 'page' : undefined} onClick={onSelect}>
    <AppIcon name={item.icon} size={20} />
    <span className="settings-nav-item-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
    <AppIcon name="chevronRight" size={18} />
  </button>
}

function SettingsProfile({ user, onSelect }: { user: AuthUser; onSelect?: () => void }) {
  const content = <>
    <span className="settings-profile-avatar" aria-hidden="true"><AppIcon name="user" size={22} /></span>
    <span className="settings-profile-copy"><strong>{user.name}</strong><small>{user.email}</small></span>
    <AppIcon name="chevronRight" size={18} />
  </>
  return onSelect
    ? <button type="button" className="settings-profile-card settings-profile-button" onClick={onSelect}>{content}</button>
    : <div className="settings-profile-card">{content}</div>
}

function SettingsPageTitle({ title, description }: { title: string; description: string }) {
  return <header className="settings-category-header"><h2>{title}</h2><p>{description}</p></header>
}

function PreferencesContent({ categories, onSelectCategories }: { categories: Category[]; onSelectCategories: () => void }) {
  const { symbol, setSymbol } = useCurrency()
  const { theme, setTheme } = useTheme()

  return <div className="settings-content-stack">
    <section className="settings-preference-group" aria-labelledby="settings-currency-title">
      <div className="settings-preference-copy"><h3 id="settings-currency-title">Moeda de apresentação</h3><p>Altera apenas o símbolo apresentado; não converte valores.</p></div>
      <label className="settings-select-label" htmlFor="settings-currency">
        <span>Símbolo</span>
        <select id="settings-currency" value={symbol} onChange={(event) => setSymbol(event.target.value as CurrencySymbol)}>
          {currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
    </section>
    <section className="settings-preference-group" aria-labelledby="settings-appearance-title">
      <div className="settings-preference-copy"><h3 id="settings-appearance-title">Aparência</h3><p>Escolhe como o Orbe é apresentado neste dispositivo.</p></div>
      <div className="settings-theme-options" role="group" aria-label="Tema da interface">
        {themeOptions.map((option) => <button key={option.value} type="button" className="settings-theme-option" aria-pressed={theme === option.value} onClick={() => setTheme(option.value)}><AppIcon name={option.icon} size={18} /><span>{option.label}</span></button>)}
      </div>
    </section>
    <button type="button" className="settings-inline-navigation" onClick={onSelectCategories}>
      <span className="settings-inline-icon"><AppIcon name="tag" size={20} /></span>
      <span className="settings-inline-copy"><strong>Categorias</strong><small>{categories.length} categorias disponíveis · consulta</small></span>
      <AppIcon name="chevronRight" size={18} />
    </button>
    <p className="settings-note">Moeda e tema são preferências locais deste navegador. A moeda altera apenas o símbolo; não modifica os dados financeiros.</p>
  </div>
}

function SettingsCategoryContent({ category, user, categories, onSelectCategory }: { category: SettingsCategory; user: AuthUser; categories: Category[]; onSelectCategory: (category: SettingsCategory) => void }) {
  if (category === 'preferences') return <PreferencesContent categories={categories} onSelectCategories={() => onSelectCategory('categories')} />
  if (category === 'account') return <div className="settings-content-stack">
    <section className="settings-detail-card"><span className="settings-detail-label">Nome</span><strong>{user.name}</strong></section>
    <section className="settings-detail-card"><span className="settings-detail-label">Email</span><strong className="settings-break-word">{user.email}</strong></section>
    <p className="settings-note">Os dados de perfil e as opções de acesso são geridos pela tua conta.</p>
  </div>
  if (category === 'security') return <div className="settings-content-stack"><section className="settings-information-panel"><span className="settings-information-icon"><AppIcon name="shield" size={22} /></span><div><h3>Segurança da conta</h3><p>As opções de segurança e autenticação são geridas pela conta.</p></div></section></div>
  if (category === 'data') return <div className="settings-content-stack"><section className="settings-information-panel"><span className="settings-information-icon"><AppIcon name="database" size={22} /></span><div><h3>Exportação e cópias de segurança</h3><p>Exportação, cópias de segurança e restauro ainda não estão disponíveis no Orbe.</p><span className="settings-status">Indisponível</span></div></section></div>
  if (category === 'categories') return <div className="settings-content-stack">
    {categories.length ? <div className="settings-category-list">{categories.map((item) => <div className="settings-category-item" key={item.id}><span className="settings-category-item-name">{item.name}</span><span className="settings-category-item-type">{item.nature === 'EXPENSE' ? 'Despesa' : 'Receita'}</span></div>)}</div> : <div className="settings-empty-state"><AppIcon name="tag" size={24} /><strong>Sem categorias</strong><p>Não existem categorias disponíveis para consulta.</p></div>}
  </div>
  return <div className="settings-content-stack"><section className="settings-detail-card"><span className="settings-detail-label">Aplicação</span><strong>Orbe</strong><span>Gestão financeira pessoal</span></section><section className="settings-detail-card"><span className="settings-detail-label">Plataforma</span><strong>Web</strong></section></div>
}

export function SettingsPage({ user, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('preferences')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches)
  const activeItem = settingsCategories.find((item) => item.id === activeCategory) ?? settingsCategories[0]

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1024px)')
    const updateViewport = () => setIsMobile(media.matches)
    updateViewport()
    media.addEventListener('change', updateViewport)
    return () => media.removeEventListener('change', updateViewport)
  }, [])

  const selectCategory = (category: SettingsCategory) => {
    setActiveCategory(category)
    setMobileDetailOpen(isMobile)
    if (isMobile) window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const returnToOverview = () => {
    setMobileDetailOpen(false)
    setActiveCategory('preferences')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return <section className="settings-page" aria-labelledby="settings-page-title">
    {(!isMobile || !mobileDetailOpen) ? <PageHeader title="Configurações" titleId="settings-page-title" description="Personaliza a tua experiência no Orbe." className="settings-page-header" /> : null}
    {isMobile
      ? mobileDetailOpen
        ? <div className="settings-mobile-detail">
            <div className="settings-mobile-back"><button type="button" onClick={returnToOverview} aria-label="Voltar às configurações"><AppIcon name="chevronLeft" size={20} /><span>Configurações</span></button></div>
            <SettingsPageTitle title={activeItem.title} description={activeItem.description} />
            <SettingsCategoryContent category={activeCategory} user={user} categories={categories} onSelectCategory={selectCategory} />
          </div>
        : <div className="settings-mobile-overview">
            <SettingsProfile user={user} onSelect={() => selectCategory('account')} />
            <nav className="settings-mobile-category-list" aria-label="Categorias de configurações">
              {settingsCategories.map((item) => <SettingsNavItem key={item.id} item={item} selected={false} onSelect={() => selectCategory(item.id)} />)}
            </nav>
          </div>
      : <div className="settings-desktop-layout">
          <aside className="settings-sidebar" aria-label="Navegação de configurações">
            <SettingsProfile user={user} onSelect={() => selectCategory('account')} />
            <nav className="settings-sidebar-nav">{settingsCategories.map((item) => <SettingsNavItem key={item.id} item={item} selected={activeCategory === item.id} onSelect={() => selectCategory(item.id)} />)}</nav>
          </aside>
          <div className="settings-category-panel"><SettingsPageTitle title={activeItem.title} description={activeItem.description} /><SettingsCategoryContent category={activeCategory} user={user} categories={categories} onSelectCategory={selectCategory} /></div>
        </div>}
  </section>
}
