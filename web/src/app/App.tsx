import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Text, Row, Stack } from '../design-system/primitives'
import { MovementForm } from '../features/movements/components/MovementForm'
import { AppShell } from './AppShell'
import { AppIcon, type AppIconName } from '../shared/components/AppIcon'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { LoginScreen } from '../features/auth/pages/LoginScreen'
import { MobileDashboard } from '../features/dashboard/components/MobileDashboard'
import { useAuth } from '../api/useAuth'
import { useFinanceData } from '../api/useFinanceData'
import type { Operation } from '../api/types'
import { MovementsPage } from '../features/movements/pages/MovementsPage'
import { AccountsPage } from '../features/accounts/pages/AccountsPage'
import { CardsPage } from '../features/cards/pages/CardsPage'
import { FinancialRoutePage } from '../features/financial-route/pages/FinancialRoutePage'
import { formatCurrency } from '../features/currency/formatCurrency'
import { useCurrency } from '../features/currency/useCurrency'
import type { CurrencySymbol } from '../features/currency/types'
import { ReportsPage } from '../features/reports/pages/ReportsPage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'

function formatMoney(amount: string, symbol: CurrencySymbol = '€'): string {
  return formatCurrency(amount, symbol)
}

function currentMonthKey(): string {
  const now = new Date()
  return String(now.getFullYear()) + '-' + String(now.getMonth() + 1).padStart(2, '0')
}

function amountToUnits(value: string): bigint {
  const negative = value.startsWith('-')
  const normalized = negative ? value.slice(1) : value
  const parts = normalized.split('.')
  const whole = parts[0] || '0'
  const fraction = (parts[1] || '').padEnd(4, '0').slice(0, 4)
  const units = BigInt(whole) * 10000n + BigInt(fraction)
  return negative ? -units : units
}

function unitsToAmount(value: bigint): string {
  const negative = value < 0n
  const absolute = negative ? -value : value
  const whole = absolute / 10000n
  const fraction = String(absolute % 10000n).padStart(4, '0')
  return (negative ? '-' : '') + String(whole) + '.' + fraction
}

function sumAmounts(values: string[]): string {
  return unitsToAmount(values.reduce((total, value) => total + amountToUnits(value), 0n))
}

function movementView(operation: Operation, symbol: CurrencySymbol) {
  const isExpense = operation.operation_type === 'EXPENSE'
  const isIncome = operation.operation_type === 'INCOME'
  const tone = isExpense ? '#c2415d' : isIncome ? '#16805b' : '#175cd3'
  const icon = isExpense ? 'expense' : isIncome ? 'income' : 'transfer'
  const sign = isExpense ? '− ' : isIncome ? '+ ' : ''
  const state = operation.state === 'PENDING' ? 'Pendente' : 'Realizada'
  return {
    icon: icon as AppIconName,
    name: operation.description || (operation.operation_type === 'TRANSFER' ? 'Transferência' : isExpense ? 'Despesa' : 'Receita'),
    meta: `${operation.operation_type} · ${state}`,
    amount: `${sign}${formatMoney(operation.amount, symbol)}`,
    tone,
    iconColor: tone,
  }
}

function FinanceStatus({ loading, error, authenticated }: { loading: boolean; error: string | null; authenticated: boolean }) {
  if (loading) return <Text className="finance-read-status" color="#667085" fontSize={13}>A carregar dados financeiros…</Text>
  if (error) return <Text className="finance-read-status" color="#c2415d" fontSize={13}>{error}</Text>
  if (!authenticated) return <Text className="finance-read-status" color="#667085" fontSize={13}>Inicie sessão para carregar os seus dados financeiros.</Text>
  return null
}

export default function App() {
  const { symbol: currencySymbol } = useCurrency()
  const { user, loading: authLoading, error: authError, logout } = useAuth()
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const finance = useFinanceData(user)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const saved = window.localStorage.getItem('orbe.sidebar.open')
      if (saved !== null) return saved === 'true'
      return !window.matchMedia('(max-width: 1199px)').matches
    } catch {
      return true
    }
  })
  const [activeKey, setActiveKey] = useState('Início')
  const [movementTab, setMovementTab] = useState<'movements' | 'schedules'>('movements')
  const [periodMonth, setPeriodMonth] = useState(() => currentMonthKey())
  const [routeMonth, setRouteMonth] = useState(() => currentMonthKey())
  const [reportsMonth, setReportsMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuAnchorRef = useRef<HTMLSpanElement>(null)
  const accountMenuPopoverRef = useRef<HTMLDivElement>(null)
  const [accountMenuPosition, setAccountMenuPosition] = useState({ top: 12, left: 84, width: 240 })
  const [feedback, setFeedback] = useState('')
  const [activeForm, setActiveForm] = useState<'expense' | 'income' | 'transfer' | null>(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [morePagesOpen, setMorePagesOpen] = useState(false)

  function navigateTo(page: string) {
    setActiveKey(page)
    setAddMenuOpen(false)
    setMorePagesOpen(false)
  }

  function changeMovementTab(tab: 'movements' | 'schedules') {
    setMovementTab(tab)
    setAddMenuOpen(false)
    setMorePagesOpen(false)
  }

  useEffect(() => {
    if (!accountMenuOpen) return

    const updatePosition = () => {
      const anchor = accountMenuAnchorRef.current
      if (!anchor) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const width = Math.min(240, viewportWidth - 24)
      const height = accountMenuPopoverRef.current?.getBoundingClientRect().height ?? 112
      const rect = anchor.getBoundingClientRect()
      let left: number
      let top: number

      if (sidebarOpen) {
        left = rect.left
        top = rect.top - height - 8
        if (top < 12) top = rect.bottom + 8
      } else {
        left = rect.right + 12
        if (left + width > viewportWidth - 12) left = rect.left - width - 12
        top = rect.bottom - height
      }

      left = Math.max(12, Math.min(left, viewportWidth - width - 12))
      top = Math.max(12, Math.min(top, viewportHeight - height - 12))
      setAccountMenuPosition({ top, left, width })
    }

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (accountMenuAnchorRef.current?.contains(target) || accountMenuPopoverRef.current?.contains(target)) return
      setAccountMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false)
        accountMenuAnchorRef.current?.querySelector('button')?.focus()
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('pointerdown', handleOutsidePointer)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('pointerdown', handleOutsidePointer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountMenuOpen, sidebarOpen])

  if (authLoading && user === null) {
    return <Stack className="auth-screen" backgroundColor="#f7f9fc" minHeight="100vh" style={{ justifyContent: 'center', alignItems: 'center' }}><Text color="#667085">A verificar a sessão…</Text></Stack>
  }

  if (user === null) return <LoginScreen />

  const movements = finance.data.operations.slice(0, 4).map((operation) => movementView(operation, currencySymbol))
  const card = finance.data.cards[0]
  const invoice = finance.data.invoices[0]

  const [selectedYear, selectedMonth] = periodMonth.split('-').map(Number)
  const selectedDate = new Date(selectedYear, selectedMonth - 1, 1)
  const periodLabel = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(selectedDate)
  const todayLabel = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())
  const realizedMonthOperations = finance.data.operations.filter((operation) => operation.state === 'REALIZED' && operation.effective_at?.slice(0, 7) === periodMonth)
  const periodIncome = sumAmounts(realizedMonthOperations.filter((operation) => operation.operation_type === 'INCOME').map((operation) => operation.amount))
  const periodExpenses = sumAmounts(realizedMonthOperations.filter((operation) => operation.operation_type === 'EXPENSE').map((operation) => operation.amount))
  const expenseCategories = new Map<string, bigint>()
  realizedMonthOperations.filter((operation) => operation.operation_type === 'EXPENSE').forEach((operation) => {
    const name = operation.category?.name ?? 'Sem categoria'
    expenseCategories.set(name, (expenseCategories.get(name) ?? 0n) + amountToUnits(operation.amount))
  })
  const totalExpenseUnits = amountToUnits(periodExpenses)
  const dashboardCategories = [...expenseCategories.entries()].sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : a[0].localeCompare(b[0], 'pt-PT')).slice(0, 5).map(([name, amount]) => ({
    name,
    amount: formatMoney(unitsToAmount(amount), currencySymbol),
    percentage: totalExpenseUnits > 0n ? Number((amount * 100n + totalExpenseUnits / 2n) / totalExpenseUnits) : 0,
  }))
  const period = { label: periodLabel, date: todayLabel }
  const displayPeriod = {
    label: periodLabel,
    shortLabel: new Intl.DateTimeFormat('pt-PT', { month: 'short', year: '2-digit' }).format(selectedDate),
    date: todayLabel,
    income: finance.loading ? 'A carregar…' : '+ ' + formatMoney(periodIncome, currencySymbol),
    expenses: finance.loading ? 'A carregar…' : '− ' + formatMoney(periodExpenses, currencySymbol),
  }

  function toggleSidebar() {
    setSidebarOpen((value) => {
      const next = !value
      try { window.localStorage.setItem('orbe.sidebar.open', String(next)) } catch { /* storage opcional */ }
      return next
    })
  }

  const navigation = [
    { icon: 'home' as AppIconName, label: 'Início' },
    { icon: 'activity' as AppIconName, label: 'Movimentos' },
    { icon: 'route' as AppIconName, label: 'Rota' },
    { icon: 'wallet' as AppIconName, label: 'Contas' },
    { icon: 'more' as AppIconName, label: 'Mais' },
  ]
  const morePages = [
    { icon: 'creditCard' as AppIconName, label: 'Cartões' },
    { icon: 'activity' as AppIconName, label: 'Relatórios' },
    { icon: 'settings' as AppIconName, label: 'Configurações' },
  ]
  const sidebarGroups = [
    { title: 'Principal', pages: navigation.filter((item) => ['Início', 'Movimentos', 'Rota'].includes(item.label)) },
    { title: 'Gestão financeira', pages: [{ icon: 'wallet' as AppIconName, label: 'Contas' }, ...morePages.slice(0, 1)] },
    { title: 'Ferramentas', pages: morePages.slice(1) },
  ]

  function notify(message: string) {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 2400)
  }

  function openForm(kind: 'expense' | 'income' | 'transfer') {
    setActiveForm(kind)
  }

  function handleAddFabClick() {
    setAddMenuOpen((value) => !value)
  }

  const fabActions = activeKey === 'Contas'
    ? [{ label: 'Nova conta', icon: 'wallet' as AppIconName, kind: 'unavailable' as const, message: 'A criação de contas será disponibilizada na fase de formulários.' }]
    : activeKey === 'Cartões'
      ? [{ label: 'Novo cartão', icon: 'wallet' as AppIconName, kind: 'unavailable' as const, message: 'A criação de cartões será disponibilizada na fase de formulários.' }]
      : ['Relatórios', 'Configurações'].includes(activeKey)
            ? [{ label: 'Sem ações de criação nesta página', icon: 'wallet' as AppIconName, kind: 'unavailable' as const, message: activeKey === 'Relatórios' ? 'A criação de relatórios ainda não está disponível.' : 'As Configurações não têm ações de criação.' }]
            : [
                { label: 'Novo gasto', icon: 'expense' as AppIconName, kind: 'expense' as const },
                { label: 'Novo rendimento', icon: 'income' as AppIconName, kind: 'income' as const },
                { label: 'Nova transferência', icon: 'transfer' as AppIconName, kind: 'transfer' as const },
              ]

  function changeMovementMonth(value: string) {
    setPeriodMonth(value)
  }

  return (
    <AppShell>
        <FinanceStatus loading={finance.loading} error={finance.error} authenticated={user !== null} />
        <div className="desktop-layout">
          <Stack className={`desktop-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`} padding="20px 16px" borderRightWidth={1} borderColor="#eaecf0" backgroundColor="#ffffff">
            <Row style={{ justifyContent: sidebarOpen ? 'space-between' : 'center', alignItems: 'center' }} marginBottom={28}>
              {sidebarOpen ? <Text fontSize={28} fontWeight="800" color="#101828">Orbe</Text> : null}
              <Button onPress={toggleSidebar} aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'} width={40} height={40} borderRadius={10} padding={0} borderWidth={1} borderColor="#e4e7ec" backgroundColor={sidebarOpen ? 'transparent' : '#f7f9fc'}>
                <AppIcon name={sidebarOpen ? 'chevronLeft' : 'chevronRight'} size={18} color="#667085" />
              </Button>
            </Row>
            <Stack className="desktop-sidebar-navigation" gap={18} flex={1}>
              {sidebarGroups.map((group) => <Stack key={group.title} gap={7}>
                {sidebarOpen ? <Text color="#98a2b3" fontSize={10} fontWeight="800" letterSpacing={1}>{group.title.toUpperCase()}</Text> : null}
                {group.pages.map((item) => <Button key={item.label} onPress={() => navigateTo(item.label)} aria-label={item.label} aria-current={activeKey === item.label ? 'page' : undefined} style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }} borderWidth={0} backgroundColor={activeKey === item.label ? '#e6f4f1' : 'transparent'} color={activeKey === item.label ? '#087f70' : '#475467'}>
                  <Row gap={10} style={{ alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}><AppIcon name={item.icon} size={sidebarOpen ? 18 : 20} strokeWidth={2} />{sidebarOpen ? <Text>{item.label}</Text> : null}</Row>
                </Button>)}
              </Stack>)}
            </Stack>
            <Stack className="sidebar-footer" gap={8} borderTopWidth={1} borderColor="#eaecf0" paddingTop={14}>
              <Button onPress={() => notify("Não existem notificações novas")} aria-label="Notificações" borderWidth={0} backgroundColor="transparent" color="#475467" paddingHorizontal={sidebarOpen ? 12 : 0} height={42} justifyContent={sidebarOpen ? "flex-start" : "center"}>
                <Row alignItems="center" gap={10}><AppIcon name="bell" size={20} strokeWidth={2} />{sidebarOpen ? <Text fontSize={13}>Notificações</Text> : null}</Row>
              </Button>
              <Stack className="account-menu" alignItems={sidebarOpen ? "stretch" : "center"}>
                <span ref={accountMenuAnchorRef} className="account-menu-anchor">
                  <Button className="sidebar-profile-button" onPress={() => setAccountMenuOpen((value) => !value)} aria-label="Abrir perfil" aria-expanded={accountMenuOpen} borderWidth={0} backgroundColor={accountMenuOpen ? "#f2f4f7" : "transparent"} color="#475467" paddingHorizontal={sidebarOpen ? 12 : 0} height={44} justifyContent={sidebarOpen ? "flex-start" : "center"}>
                    <Row className="sidebar-profile-copy" alignItems="center" gap={10}><AppIcon name="user" size={20} strokeWidth={2} />{sidebarOpen ? <Stack className="sidebar-profile-name-wrap" gap={2} alignItems="flex-start"><Text className="sidebar-profile-name" fontSize={13} fontWeight="700">{user.name}</Text></Stack> : null}</Row>
                  </Button>
                </span>
                {accountMenuOpen && typeof document !== 'undefined' ? createPortal(
                  <div
                    ref={accountMenuPopoverRef}
                    className="sidebar-account-popover"
                    role="menu"
                    aria-label="Menu da conta"
                    style={{ top: accountMenuPosition.top, left: accountMenuPosition.left, width: accountMenuPosition.width }}
                  >
                    <div className="sidebar-account-popover-header">
                      <span className="sidebar-account-avatar"><AppIcon name="user" size={18} /></span>
                      <span className="sidebar-account-identity">
                        <strong title={user.name}>{user.name}</strong>
                        <small>Conta Orbe</small>
                      </span>
                    </div>
                    <button
                      className="sidebar-account-menu-action"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false)
                        setLogoutError(null)
                        void logout().catch(() => setLogoutError("Não foi possível terminar a sessão. Tenta novamente."))
                      }}
                      disabled={authLoading}
                    >
                      <AppIcon name="logout" size={17} />
                      <span>Terminar sessão</span>
                    </button>
                  </div>,
                  document.body,
                ) : null}
              </Stack>
            </Stack>
          </Stack>

          <Stack className={`main-content ${activeKey === 'Movimentos' ? 'movements-mode' : ''} ${activeKey === 'Rota' ? 'route-mode' : ''} ${activeKey === 'Contas' ? 'accounts-mode' : ''} ${activeKey === 'Cartões' ? 'cards-mode' : ''} ${activeKey === 'Relatórios' ? 'reports-mode' : ''} ${activeKey === 'Configurações' ? 'settings-mode' : ''}`} flex={1}>
            {activeKey === 'Contas' ? <AccountsPage accounts={finance.data.accounts} loading={finance.loading} error={finance.error} /> : null}
            {activeKey === 'Cartões' ? <CardsPage cards={finance.data.cards} operations={finance.data.operations} loading={finance.loading} error={finance.error} /> : null}
            {activeKey === 'Rota' ? <FinancialRoutePage operations={finance.data.operations} month={routeMonth} onMonthChange={setRouteMonth} /> : null}            {activeKey === 'Relatórios' ? <ReportsPage operations={finance.data.operations} loading={finance.loading} error={finance.error} month={reportsMonth} onMonthChange={setReportsMonth} /> : null}
            {activeKey === 'Configurações' ? <SettingsPage user={user} categories={finance.data.categories} /> : null}
            {activeKey === 'Movimentos' ? <MovementsPage tab={movementTab} setTab={changeMovementTab} operations={finance.data.operations} recurrences={finance.data.recurrences} accounts={finance.data.accounts} categories={finance.data.categories} month={periodMonth} onMonthChange={changeMovementMonth} onNotify={notify} /> : null}
            {activeKey === 'Início' ? <DashboardPage period={period} userName={user.name} displayPeriod={displayPeriod} month={periodMonth} onMonthChange={changeMovementMonth} currencySymbol={currencySymbol} movements={movements} categories={dashboardCategories} loading={finance.loading} card={card} invoice={invoice} setActiveKey={navigateTo} authError={authError} logoutError={logoutError} /> : null}
          </Stack>
        </div>
        {activeKey === 'Cartões' ? <div className="mobile-page-shell cards-mobile-shell"><CardsPage cards={finance.data.cards} operations={finance.data.operations} loading={finance.loading} error={finance.error} /></div> : activeKey === 'Contas' ? <div className="mobile-page-shell accounts-mobile-shell"><AccountsPage accounts={finance.data.accounts} loading={finance.loading} error={finance.error} /></div> : activeKey === 'Movimentos' ? <div className="mobile-page-shell"><MovementsPage tab={movementTab} setTab={changeMovementTab} operations={finance.data.operations} recurrences={finance.data.recurrences} accounts={finance.data.accounts} categories={finance.data.categories} month={periodMonth} onMonthChange={changeMovementMonth} onNotify={notify} /></div> : activeKey === 'Rota' ? <div className="mobile-page-shell route-mobile-shell"><FinancialRoutePage operations={finance.data.operations} month={routeMonth} onMonthChange={setRouteMonth} /></div> : activeKey === 'Relatórios' ? <div className="mobile-page-shell reports-mobile-shell"><ReportsPage operations={finance.data.operations} loading={finance.loading} error={finance.error} month={reportsMonth} onMonthChange={setReportsMonth} /></div> : activeKey === 'Configurações' ? <div className="mobile-page-shell"><SettingsPage user={user} categories={finance.data.categories} /></div> : <div className="mobile-page-shell mobile-dashboard-shell"><MobileDashboard period={displayPeriod} month={periodMonth} onMonthChange={changeMovementMonth} card={card} invoice={invoice} setActiveKey={navigateTo} userName={user.name} authError={authError} logoutError={logoutError} movements={movements} categories={dashboardCategories} loading={finance.loading} /></div>}
        {feedback ? <Row className="feedback-toast" role="status" aria-live="polite"><Text color="#ffffff" fontWeight="600">{feedback}</Text></Row> : null}
        <div className="mobile-bottom-bar">
          {navigation.map((item) => <Button key={item.label} onPress={() => { if (item.label === 'Mais') { setMorePagesOpen((value) => !value); return } navigateTo(item.label) }} aria-label={item.label} aria-expanded={item.label === 'Mais' ? morePagesOpen : undefined} aria-current={activeKey === item.label || (item.label === 'Mais' && morePages.some((page) => page.label === activeKey)) ? 'page' : undefined} flex={1} height={56} padding={0} borderWidth={0} backgroundColor={(item.label === 'Mais' ? morePagesOpen || morePages.some((page) => page.label === activeKey) : activeKey === item.label) ? '#e6f4f1' : 'transparent'} color={(item.label === 'Mais' ? morePagesOpen || morePages.some((page) => page.label === activeKey) : activeKey === item.label) ? '#087f70' : '#667085'}>
            <Stack gap={4} style={{ alignItems: 'center', justifyContent: 'center' }}><AppIcon name={item.icon} size={18} /><Text fontSize={11} fontWeight="700">{item.label}</Text></Stack>
          </Button>)}
        </div>
        {morePagesOpen ? <>
          <button className="mobile-more-panel-dismiss" type="button" aria-label="Fechar menu Mais" onClick={() => setMorePagesOpen(false)} />
          <section className="mobile-more-pages-panel" role="menu" aria-label="Páginas secundárias">
            <h2>Mais páginas</h2>
            {morePages.map((page) => <button key={page.label} className="mobile-more-page-item" type="button" role="menuitem" onClick={() => { navigateTo(page.label) }}><AppIcon name={page.icon} size={18} /><span>{page.label}</span></button>)}
          </section>
        </> : null}
        {addMenuOpen ? <><button className="add-fab-dismiss" type="button" aria-label="Fechar opções de criação" onClick={() => setAddMenuOpen(false)} /><div className="add-fab-menu" role="menu" aria-label={`Criar na página ${activeKey}`}>
          {fabActions.map((action) => <button key={action.label} className="add-fab-menu-item" type="button" role="menuitem" onClick={() => { setAddMenuOpen(false); if (action.kind === 'unavailable') notify(action.message); else openForm(action.kind) }}><AppIcon name={action.icon} size={18} color={action.kind === 'expense' ? '#c2415d' : action.kind === 'income' ? '#16805b' : action.kind === 'transfer' ? '#175cd3' : '#667085'} /><span>{action.label}</span></button>)}
        </div></> : null}
        {!['Relatórios', 'Configurações'].includes(activeKey) ? <button className="app-add-fab" type="button" onClick={handleAddFabClick} aria-label={`Adicionar na página ${activeKey}`} aria-expanded={addMenuOpen} title={`Adicionar — ${activeKey}`}>
          <AppIcon name="plus" size={26} color="#ffffff" strokeWidth={2.2} />
        </button> : null}
        {activeForm ? <MovementForm kind={activeForm} onClose={() => setActiveForm(null)} onUnavailable={(message) => { setActiveForm(null); notify(message) }} /> : null}
    </AppShell>
  )
}
