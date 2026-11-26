import { useEffect, useState, type FormEvent } from 'react'
import {
  Button,
  Card,
  H1,
  Paragraph,
  Separator,
  Text,
  XStack,
  YStack,
} from 'tamagui'
import { MovementForm } from './forms/FormSystem'
import { AppShell } from './AppShell'
import { useAuth } from './api/useAuth'
import { useFinanceData } from './api/useFinanceData'
import type { Card as FinancialCard, CardInvoice, Operation } from './api/types'
import { MovementsPage } from './MovementsPage'
import { AccountsPage } from './AccountsPage'
import { CardsPage } from './CardsPage'
import { FinancialRoutePage } from './FinancialRoutePage'
import { MonthSelector } from './MonthSelector'

type IconName = 'plus' | 'home' | 'activity' | 'route' | 'wallet' | 'creditCard' | 'debt' | 'settings' | 'more' | 'bell' | 'user' | 'eye' | 'eyeOff' | 'expense' | 'income' | 'transfer' | 'store' | 'salary' | 'house' | 'chevronLeft' | 'chevronRight'

const iconPaths: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z',
  activity: 'M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-8',
  route: 'M5 19c2.5 0 3.5-2 3.5-4.5S7.5 10 10 10s3.5 2 3.5 4.5S12.5 19 15 19s3.5-2 4-4',
  wallet: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v15H6.5A2.5 2.5 0 0 1 4 17.5v-11ZM4 8h16m-5 5h2',
  creditCard: 'M3 5h18v14H3zM3 10h18M7 15h3',
  debt: 'M12 3v18M5 8h14M5 16h14',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  bell: 'M6 17h12l-1.2-1.8V10a4.8 4.8 0 0 0-9.6 0v5.2L6 17Zm4 3h4',
  user: 'M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  eye: 'M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'm3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.7M6.2 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.6',
  expense: 'M12 5v14m-5-5 5 5 5-5',
  income: 'M12 19V5m5 5-5-5-5 5',
  transfer: 'M5 8h14m-4-3 4 3-4 3M19 16H5m4-3-4 3 4 3',
  store: 'M4 10h16v10H4V10Zm-1 0 2-6h14l2 6M8 14h3m2 0h3',
  salary: 'M4 7h16v12H4V7Zm3-3h10v3H7V4Zm3 7h4',
  house: 'm4 11 8-7 8 7v9H4v-9Zm5 9v-5h6v5',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronRight: 'm9 18 6-6-6-6',
}

function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  )
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

function LoginScreen() {
  const { login, register, requestPasswordReset, resetPassword, loading, error, clearError } = useAuth()
  const initialParams = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
  const hasResetLink = Boolean(initialParams.get('token'))
  const [mode, setMode] = useState<AuthMode>(hasResetLink ? 'reset' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(initialParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setFormError(null)
    setSuccess(null)
    clearError()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (mode === 'register' && !name.trim()) return setFormError('Introdu o teu nome.')
    if (!normalizedEmail) return setFormError('Introdu um email válido.')
    if ((mode === 'login' || mode === 'register' || mode === 'reset') && !password) return setFormError('Introdu a palavra-passe.')
    if ((mode === 'register' || mode === 'reset') && password !== passwordConfirmation) return setFormError('As palavras-passe não coincidem.')

    setFormError(null)
    setSuccess(null)
    clearError()
    try {
      if (mode === 'login') await login(normalizedEmail, password)
      if (mode === 'register') await register(name.trim(), normalizedEmail, password, passwordConfirmation)
      if (mode === 'forgot') setSuccess(await requestPasswordReset(normalizedEmail))
      if (mode === 'reset') {
        const token = new URLSearchParams(window.location.search).get('token') ?? ''
        setSuccess(await resetPassword(normalizedEmail, token, password, passwordConfirmation))
        setPassword('')
        setPasswordConfirmation('')
        setMode('login')
      }
    } catch {
      // A mensagem do provider é apresentada no formulário.
    }
  }

  const message = formError ?? error
  const title = mode === 'login' ? 'Iniciar sessão' : mode === 'register' ? 'Criar conta' : mode === 'forgot' ? 'Recuperar palavra-passe' : 'Definir nova palavra-passe'
  const description = mode === 'login' ? 'Entra na tua conta para consultar as tuas finanças.' : mode === 'register' ? 'Cria a tua conta para começar a organizar as tuas finanças.' : mode === 'forgot' ? 'Enviaremos instruções para o teu email, se existir uma conta associada.' : 'Escolhe uma palavra-passe nova para a tua conta.'

  return (
    <YStack className="auth-screen" backgroundColor="#f7f9fc" minHeight="100vh" padding={24} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <YStack className="auth-card" backgroundColor="#ffffff" borderWidth={1} borderColor="#e4e7ec" borderRadius={24} padding={32} width="100%" maxWidth={440} gap={24}>
        <YStack gap={8}><Text color="#175cd3" fontSize={28} fontWeight="800">Orbe</Text><H1 fontSize={28} letterSpacing={-0.6}>{title}</H1><Paragraph color="#667085" margin={0}>{description}</Paragraph></YStack>
        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === 'register' ? <><label className="auth-label" htmlFor="auth-name">Nome</label><input className="auth-input" id="auth-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="O teu nome" disabled={loading} autoFocus /></> : null}
          <label className="auth-label" htmlFor="auth-email">Email</label><input className="auth-input" id="auth-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.pt" disabled={loading} autoFocus={mode !== 'register'} />
          {mode === 'login' || mode === 'register' || mode === 'reset' ? <><label className="auth-label" htmlFor="auth-password">Palavra-passe</label><div className="auth-password-field"><input className="auth-input" id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Introduz a tua palavra-passe" disabled={loading} /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} disabled={loading}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></> : null}
          {mode === 'register' || mode === 'reset' ? <><label className="auth-label" htmlFor="auth-password-confirmation">Confirmar palavra-passe</label><input className="auth-input" id="auth-password-confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Repete a palavra-passe" disabled={loading} /></> : null}
          {message ? <div className="auth-error" role="alert">{message}</div> : null}
          {success ? <div className="auth-success" role="status">{success}</div> : null}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'A processar…' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : mode === 'forgot' ? 'Enviar instruções' : 'Alterar palavra-passe'}</button>
        </form>
        <YStack gap={10} style={{ alignItems: 'center' }}>
          {mode === 'login' ? <><button className="auth-link" type="button" onClick={() => changeMode('forgot')}>Esqueci-me da palavra-passe</button><Text color="#667085" fontSize={13}>Ainda não tens conta? <button className="auth-link" type="button" onClick={() => changeMode('register')}>Criar conta</button></Text></> : <button className="auth-link" type="button" onClick={() => changeMode('login')}>Voltar a iniciar sessão</button>}
        </YStack>
      </YStack>
    </YStack>
  )
}

function formatMoney(amount: string): string {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(amount))
}

function movementView(operation: Operation) {
  const isExpense = operation.operation_type === 'EXPENSE'
  const isIncome = operation.operation_type === 'INCOME'
  const tone = isExpense ? '#c2415d' : isIncome ? '#16805b' : '#175cd3'
  const icon = isExpense ? 'expense' : isIncome ? 'income' : 'transfer'
  const sign = isExpense ? '− ' : isIncome ? '+ ' : ''
  const state = operation.state === 'PENDING' ? 'Pendente' : 'Realizada'
  return {
    icon: icon as IconName,
    name: operation.description || (operation.operation_type === 'TRANSFER' ? 'Transferência' : isExpense ? 'Despesa' : 'Receita'),
    meta: `${operation.operation_type} · ${state}`,
    amount: `${sign}${formatMoney(operation.amount)}`,
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

const border = { borderWidth: 1, borderColor: '#e4e7ec' as const }
const centered = { alignItems: 'center' as const, justifyContent: 'center' as const }

function SummaryCard({ label, amount, detail, tone }: { label: string; amount: string; detail: string; tone?: string }) {
  return (
    <Card {...border} borderRadius={16} padding={20} flex={1} minWidth={0} backgroundColor="#ffffff">
      <YStack gap={8}>
        <Text color="#667085" fontSize={16}>{label}</Text>
        <Text color={tone ?? '#101828'} fontSize={28} fontWeight="800">{amount}</Text>
        <Text color="#667085" fontSize={14}>{detail}</Text>
      </YStack>
    </Card>
  )
}

function MobileDashboard({ period, month, onMonthChange, card, invoice, setActiveKey, notify, userName }: {
  period: { label: string; shortLabel: string; date: string; income: string; expenses: string }
  month: string
  onMonthChange: (month: string) => void
  card?: FinancialCard
  invoice?: CardInvoice
  setActiveKey: (value: string) => void
  notify: (message: string) => void
  userName: string
}) {
  const [hidden, setHidden] = useState(false)

  return (
    <YStack className="mobile-dashboard" backgroundColor="#f7f9fc" minHeight="100vh">
      <YStack className="mobile-dashboard-content" gap={16}>
        <XStack className="mobile-dashboard-header" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <YStack className="mobile-dashboard-greeting" flex={1} minWidth={0} gap={4}>
            <Text className="mobile-dashboard-greeting-text" color="#101828" fontWeight="800" numberOfLines={1}>Bom dia, {userName.split(' ')[0]}</Text>
            <Text className="mobile-dashboard-date" color="#667085" fontSize={13}>{period.date}</Text>
          </YStack>
          <MonthSelector month={month} onMonthChange={onMonthChange} minMonth="2026-11" maxMonth="2026-12" className="dashboard-month-selector" />
        </XStack>
        <Card className="mobile-balance-card" borderRadius={18} padding={18} backgroundColor="#175cd3" borderWidth={0}>
          <YStack gap={12}><XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}><Text color="#dbeafe" fontSize={11} fontWeight="800" letterSpacing={1}>SALDO DISPONÍVEL</Text><Button onPress={() => setHidden((value) => !value)} aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'} width={30} height={30} padding={0} borderRadius={9} borderWidth={0} backgroundColor="rgba(255,255,255,0.14)"><Icon name={hidden ? 'eyeOff' : 'eye'} size={15} color="#ffffff" /></Button></XStack><YStack gap={2}><Text color="#ffffff" fontSize={30} fontWeight="800">{hidden ? '••••••' : '€ 2.840,50'}</Text><Text color="#dbeafe" fontSize={12}>Todas as contas</Text></YStack><Separator borderColor="rgba(255,255,255,0.24)" /><XStack style={{ justifyContent: 'space-between' }}>{[['Receitas', period.income], ['Despesas', period.expenses], ['Resultado', '+ € 2.054,20']].map(([label, value]) => <YStack key={label} gap={3} flex={1}><Text color="#dbeafe" fontSize={11}>{label}</Text><Text color="#ffffff" fontSize={13} fontWeight="800">{hidden ? '••••' : value}</Text></YStack>)}</XStack></YStack>
        </Card>
        <Card {...border} borderRadius={16} padding={16} backgroundColor="#ffffff"><XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={12}><Text color="#101828" fontSize={16} fontWeight="800">Despesas por categoria</Text><Button onPress={() => notify('A mostrar despesas por categoria')} borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontSize={12} fontWeight="700">Ver todas</Button></XStack><YStack gap={12}>{[['Casa', '€ 162,00', 82], ['Juros', '€ 1,00', 12]].map(([label, value, width]) => <YStack key={String(label)} gap={5}><XStack style={{ justifyContent: 'space-between' }}><Text color="#475467" fontSize={12}>{label}</Text><Text color="#101828" fontSize={12} fontWeight="700">{value}</Text></XStack><YStack height={5} borderRadius={99} backgroundColor="#e6f0ff"><YStack width={`${width}%`} height={5} borderRadius={99} backgroundColor="#175cd3" /></YStack></YStack>)}</YStack></Card>
        <Card {...border} borderRadius={16} padding={16} backgroundColor="#ffffff"><XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={10}><Text color="#101828" fontSize={16} fontWeight="800">Cartões</Text><Button onPress={() => setActiveKey('Cartões')} borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontSize={12} fontWeight="700">Ver todos</Button></XStack>{invoice ? <XStack padding={12} borderRadius={12} backgroundColor="#f7f9fc" style={{ justifyContent: 'space-between', alignItems: 'center' }}><YStack gap={3}><Text color="#667085" fontSize={11}>{card?.name ?? invoice.card?.name ?? 'Fatura do cartão'}</Text><Text color="#101828" fontSize={19} fontWeight="800">{formatMoney(invoice.summary.open_amount)}</Text></YStack><Text color="#087f70" backgroundColor="#e6f4f1" borderRadius={99} paddingHorizontal={9} paddingVertical={5} fontSize={11} fontWeight="700">{invoice.cycle_state}</Text></XStack> : card ? <Text color="#667085" fontSize={13}>{card.name} · sem faturas disponíveis.</Text> : <Text color="#667085" fontSize={13}>Sem cartões disponíveis.</Text>}</Card>
      </YStack>
    </YStack>
  )
}

export default function App() {
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
  const [periodIndex, setPeriodIndex] = useState(0)
  const [routeMonth, setRouteMonth] = useState('2026-11')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [activeForm, setActiveForm] = useState<'expense' | 'income' | 'transfer' | null>(null)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [morePagesOpen, setMorePagesOpen] = useState(false)

  useEffect(() => {
    setAddMenuOpen(false)
    setMorePagesOpen(false)
  }, [activeKey, movementTab])

  useEffect(() => {
    setRouteMonth(`2026-${String(periodIndex + 11).padStart(2, '0')}`)
  }, [periodIndex])

  if (authLoading && user === null) {
    return <YStack className="auth-screen" backgroundColor="#f7f9fc" minHeight="100vh" style={{ justifyContent: 'center', alignItems: 'center' }}><Text color="#667085">A verificar a sessão…</Text></YStack>
  }

  if (user === null) return <LoginScreen />

  const movements = finance.data.operations.slice(0, 4).map(movementView)
  const card = finance.data.cards[0]
  const invoice = finance.data.invoices[0]

  const periods = [
    { label: 'novembro de 2026', shortLabel: 'Nov/26', date: 'Seg, 23 nov. 2026', income: '+ € 3.200,00', expenses: '− € 1.145,80' },
    { label: 'dezembro de 2026', shortLabel: 'Dez/26', date: 'Ter, 01 dez. 2026', income: '+ € 2.850,00', expenses: '− € 980,20' },
  ]
  const period = periods[periodIndex]

  function toggleSidebar() {
    setSidebarOpen((value) => {
      const next = !value
      try { window.localStorage.setItem('orbe.sidebar.open', String(next)) } catch { /* storage opcional */ }
      return next
    })
  }

  const navigation = [
    { icon: 'home' as IconName, label: 'Início' },
    { icon: 'activity' as IconName, label: 'Movimentos' },
    { icon: 'route' as IconName, label: 'Rota' },
    { icon: 'wallet' as IconName, label: 'Contas' },
    { icon: 'more' as IconName, label: 'Mais' },
  ]
  const morePages = [
    { icon: 'creditCard' as IconName, label: 'Cartões' },
    { icon: 'debt' as IconName, label: 'Dívidas' },
    { icon: 'activity' as IconName, label: 'Relatórios' },
    { icon: 'settings' as IconName, label: 'Configurações' },
  ]
  const sidebarGroups = [
    { title: 'Principal', pages: navigation.filter((item) => ['Início', 'Movimentos', 'Rota'].includes(item.label)) },
    { title: 'Gestão financeira', pages: [{ icon: 'wallet' as IconName, label: 'Contas' }, ...morePages.slice(0, 2)] },
    { title: 'Ferramentas', pages: morePages.slice(2) },
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
    ? [{ label: 'Nova conta', icon: 'wallet' as IconName, kind: 'unavailable' as const, message: 'A criação de contas será disponibilizada na fase de formulários.' }]
    : activeKey === 'Cartões'
      ? [{ label: 'Novo cartão', icon: 'wallet' as IconName, kind: 'unavailable' as const, message: 'A criação de cartões será disponibilizada na fase de formulários.' }]
      : activeKey === 'Dívidas'
        ? [{ label: 'Nova dívida', icon: 'wallet' as IconName, kind: 'unavailable' as const, message: 'A criação de dívidas será disponibilizada na fase de formulários.' }]
        : activeKey === 'Rota'
          ? [{ label: 'Nova projeção', icon: 'route' as IconName, kind: 'unavailable' as const, message: 'A criação de projeções ficará disponível quando o contrato da Rota Financeira estiver definido.' }]
          : ['Relatórios', 'Configurações'].includes(activeKey)
            ? [{ label: 'Sem ações de criação nesta página', icon: 'wallet' as IconName, kind: 'unavailable' as const, message: activeKey === 'Relatórios' ? 'A criação de relatórios ainda não está disponível.' : 'As Configurações não têm ações de criação.' }]
            : activeKey === 'Movimentos' && movementTab === 'schedules'
            ? [{ label: 'Nova programação', icon: 'route' as IconName, kind: 'unavailable' as const, message: 'A criação de programações será disponibilizada na fase de formulários.' }]
            : [
                { label: 'Nova despesa', icon: 'expense' as IconName, kind: 'expense' as const },
                { label: 'Nova receita', icon: 'income' as IconName, kind: 'income' as const },
                { label: 'Nova transferência', icon: 'transfer' as IconName, kind: 'transfer' as const },
              ]

  function changeMovementMonth(value: string) {
    const nextIndex = value === '2026-12' ? 1 : 0
    setPeriodIndex(nextIndex)
  }

  return (
    <AppShell>
        <FinanceStatus loading={finance.loading} error={finance.error} authenticated={user !== null} />
        <XStack className="desktop-layout" flex={1}>
          <YStack className={`desktop-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`} padding={20} borderRightWidth={1} borderColor="#eaecf0" backgroundColor="#ffffff">
            <XStack style={{ justifyContent: sidebarOpen ? 'space-between' : 'center', alignItems: 'center' }} marginBottom={40}>
              {sidebarOpen ? <Text fontSize={28} fontWeight="800" color="#101828">Orbe</Text> : null}
              <Button onPress={toggleSidebar} aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'} width={40} height={40} borderRadius={10} padding={0} borderWidth={1} borderColor="#e4e7ec" backgroundColor={sidebarOpen ? 'transparent' : '#f7f9fc'}>
                <Icon name={sidebarOpen ? 'chevronLeft' : 'chevronRight'} size={18} color="#667085" />
              </Button>
            </XStack>
            <YStack className="desktop-sidebar-navigation" gap={18} flex={1}>
              {sidebarGroups.map((group) => <YStack key={group.title} gap={7}>
                {sidebarOpen ? <Text color="#98a2b3" fontSize={10} fontWeight="800" letterSpacing={1}>{group.title.toUpperCase()}</Text> : null}
                {group.pages.map((item) => <Button key={item.label} onPress={() => setActiveKey(item.label)} aria-label={item.label} aria-current={activeKey === item.label ? 'page' : undefined} style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }} borderWidth={0} backgroundColor={activeKey === item.label ? '#e6f4f1' : 'transparent'} color={activeKey === item.label ? '#087f70' : '#475467'}>
                  <XStack gap={10} style={{ alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}><Icon name={item.icon} size={16} />{sidebarOpen ? <Text>{item.label}</Text> : null}</XStack>
                </Button>)}
              </YStack>)}
            </YStack>
            <YStack className="sidebar-footer" gap={8} borderTopWidth={1} borderColor="#eaecf0" paddingTop={14}>
              <Button onPress={() => notify("Não existem notificações novas")} aria-label="Notificações" borderWidth={0} backgroundColor="transparent" color="#475467" paddingHorizontal={sidebarOpen ? 12 : 0} height={42} justifyContent={sidebarOpen ? "flex-start" : "center"}>
                <XStack alignItems="center" gap={10}><Icon name="bell" size={17} />{sidebarOpen ? <Text fontSize={13}>Notificações</Text> : null}</XStack>
              </Button>
              <YStack className="account-menu" alignItems={sidebarOpen ? "stretch" : "center"}>
                <Button className="sidebar-profile-button" onPress={() => setAccountMenuOpen((value) => !value)} aria-label="Abrir perfil" aria-expanded={accountMenuOpen} borderWidth={0} backgroundColor={accountMenuOpen ? "#f2f4f7" : "transparent"} color="#475467" paddingHorizontal={sidebarOpen ? 12 : 0} height={44} justifyContent={sidebarOpen ? "flex-start" : "center"}>
                  <XStack className="sidebar-profile-copy" alignItems="center" gap={10}><Icon name="user" size={17} />{sidebarOpen ? <YStack className="sidebar-profile-name-wrap" gap={2} alignItems="flex-start"><Text className="sidebar-profile-name" fontSize={13} fontWeight="700">{user.name}</Text></YStack> : null}</XStack>
                </Button>
                {accountMenuOpen ? <YStack className="account-dropdown sidebar-account-dropdown" gap={6}><Text color="#101828" fontSize={12} fontWeight="700">{user.name}</Text><Button className="logout-button" onPress={() => { setAccountMenuOpen(false); setLogoutError(null); void logout().catch(() => setLogoutError("Não foi possível terminar a sessão. Tenta novamente.")) }} disabled={authLoading} borderWidth={0} backgroundColor="transparent" padding={10} color="#c2415d" fontSize={12}>Terminar sessão</Button></YStack> : null}
              </YStack>
            </YStack>
          </YStack>

          <YStack className={`main-content ${activeKey === 'Movimentos' ? 'movements-mode' : ''} ${activeKey === 'Rota' ? 'route-mode' : ''} ${activeKey === 'Contas' ? 'accounts-mode' : ''} ${activeKey === 'Cartões' ? 'cards-mode' : ''}`} flex={1} padding={20} gap={20} maxWidth={1280} marginHorizontal="auto" width="100%">
            {activeKey === 'Contas' ? <AccountsPage accounts={finance.data.accounts} loading={finance.loading} error={finance.error} /> : null}
            {activeKey === 'Cartões' ? <CardsPage cards={finance.data.cards} operations={finance.data.operations} loading={finance.loading} error={finance.error} /> : null}
            {activeKey === 'Rota' ? <FinancialRoutePage operations={finance.data.operations} month={routeMonth} onMonthChange={setRouteMonth} /> : null}\n            {['Dívidas', 'Relatórios', 'Configurações'].includes(activeKey) ? <YStack gap={12}><H1 fontSize={30}>{activeKey}</H1><Paragraph color="#667085">Esta página está prevista na navegação do Orbe e será implementada numa etapa posterior.</Paragraph></YStack> : null}
            {activeKey === 'Movimentos' ? <MovementsPage tab={movementTab} setTab={setMovementTab} operations={finance.data.operations} recurrences={finance.data.recurrences} accounts={finance.data.accounts} categories={finance.data.categories} month={`${2026}-${String(periodIndex + 11).padStart(2, '0')}`} onMonthChange={changeMovementMonth} onNotify={notify} /> : null}
            <XStack className="desktop-dashboard-header" style={{ justifyContent: "space-between", alignItems: "center" }} gap={20}>
              <YStack gap={4} flex={1} minWidth={0}>
                <H1 fontSize={36} letterSpacing={-1.2}>Bom dia, {user.name.split(' ')[0]}</H1>
                <Paragraph color="#667085" margin={0}>{period.date}</Paragraph>
              </YStack>
              <MonthSelector month={`2026-${String(periodIndex + 11).padStart(2, '0')}`} onMonthChange={changeMovementMonth} minMonth="2026-11" maxMonth="2026-12" className="desktop-month-selector" />
            </XStack>

            {authError || logoutError ? <Text className="auth-inline-error" color="#c2415d" fontSize={13} role="alert">{logoutError ?? authError}</Text> : null}

            <XStack className="dashboard-kpi-row" flexWrap="nowrap" gap={16}>
              <Card {...border} borderRadius={16} padding={20} flex={1} minWidth={0} backgroundColor="#175cd3">
                <YStack gap={8}>
                  <Text color="#dbeafe" fontSize={16}>Saldo disponível</Text>
                  <Text color="#ffffff" fontSize={34} fontWeight="800">€ 2.840,50</Text>
                  <Text color="#dbeafe" fontSize={14}>Todas as contas</Text>
                </YStack>
              </Card>
              <SummaryCard label="Receitas" amount={period.income} detail={`Realizadas em ${period.label}`} tone="#16805b" />
              <SummaryCard label="Despesas" amount={period.expenses} detail={`Realizadas em ${period.label}`} tone="#c2415d" />
            </XStack>

            <Card className="desktop-categories-card" {...border} borderRadius={16} padding={20} backgroundColor="#ffffff">
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={16}>
                <YStack gap={3}><Text fontSize={18} fontWeight="700">Despesas por categoria</Text><Text color="#667085" fontSize={13}>Distribuição das despesas em {period.label}</Text></YStack>
                <Button onPress={() => notify('A mostrar despesas por categoria')} aria-label="Ver todas as despesas por categoria" borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontWeight="700">Ver todas →</Button>
              </XStack>
              <XStack gap={28} flexWrap="wrap">
                {[['Casa', '€ 162,00', '82%', '#175cd3'], ['Juros', '€ 1,00', '12%', '#087f70']].map(([label, value, width, color]) => <YStack key={label} flex={1} minWidth={220} gap={7}><XStack style={{ justifyContent: 'space-between' }}><Text color="#475467" fontSize={13}>{label}</Text><Text color="#101828" fontSize={13} fontWeight="700">{value}</Text></XStack><YStack height={7} borderRadius={99} backgroundColor="#eef2f6"><YStack width={width} height={7} borderRadius={99} backgroundColor={color} /></YStack></YStack>)}
              </XStack>
            </Card>

            <Card {...border} borderRadius={16} padding={20} backgroundColor="#ffffff">
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={8}>
                <Text fontSize={18} fontWeight="700">Últimos movimentos</Text>
                <Button onPress={() => { setActiveKey('Movimentos') }} aria-label="Ver todos os movimentos" borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontWeight="700">Ver todos →</Button>
              </XStack>
              <YStack>
                {movements.length === 0 ? <Text color="#667085" paddingVertical={16}>Sem movimentos disponíveis.</Text> : movements.map((movement, index) => (
                  <YStack key={movement.name}>
                    <XStack paddingVertical={16} gap={12} style={centered}>
                      <YStack width={38} height={38} borderRadius={16} backgroundColor="#f2f4f7" style={centered}>
                        <Icon name={movement.icon} size={17} color={movement.iconColor} />
                      </YStack>
                      <YStack flex={1} gap={4}>
                        <Text fontWeight="700">{movement.name}</Text>
                        <Text color="#667085" fontSize={14}>{movement.meta}</Text>
                      </YStack>
                      <Text color={movement.tone} fontWeight="700">{movement.amount}</Text>
                    </XStack>
                    {index < movements.length - 1 ? <Separator /> : null}
                  </YStack>
                ))}
              </YStack>
            </Card>
          </YStack>
        </XStack>
        {activeKey === 'Cartões' ? <div className="mobile-page-shell cards-mobile-shell"><CardsPage cards={finance.data.cards} operations={finance.data.operations} loading={finance.loading} error={finance.error} /></div> : activeKey === 'Contas' ? <div className="mobile-page-shell accounts-mobile-shell"><AccountsPage accounts={finance.data.accounts} loading={finance.loading} error={finance.error} /></div> : activeKey === 'Movimentos' ? <div className="mobile-page-shell"><MovementsPage tab={movementTab} setTab={setMovementTab} operations={finance.data.operations} recurrences={finance.data.recurrences} accounts={finance.data.accounts} categories={finance.data.categories} month={`${2026}-${String(periodIndex + 11).padStart(2, '0')}`} onMonthChange={changeMovementMonth} onNotify={notify} /></div> : activeKey === 'Rota' ? <div className="mobile-page-shell route-mobile-shell"><FinancialRoutePage operations={finance.data.operations} month={routeMonth} onMonthChange={setRouteMonth} /></div> : ['Dívidas', 'Relatórios', 'Configurações'].includes(activeKey) ? <div className="mobile-page-shell"><YStack className="main-content" gap={12}><Text color="#101828" fontSize={24} fontWeight="800">{activeKey}</Text><Text color="#667085">Esta página está prevista na navegação do Orbe e será implementada numa etapa posterior.</Text></YStack></div> : <MobileDashboard period={period} month={`2026-${String(periodIndex + 11).padStart(2, '0')}`} onMonthChange={changeMovementMonth} card={card} invoice={invoice} setActiveKey={setActiveKey} notify={notify} userName={user.name} />}
        {feedback ? <XStack className="feedback-toast" role="status" aria-live="polite"><Text color="#ffffff" fontWeight="600">{feedback}</Text></XStack> : null}
        <XStack className="mobile-bottom-bar" backgroundColor="#ffffff" borderTopWidth={1} borderColor="#eaecf0" paddingHorizontal={8} paddingTop={8} paddingBottom={8}>
          {navigation.map((item) => <Button key={item.label} onPress={() => { if (item.label === 'Mais') { setMorePagesOpen((value) => !value); return } setMorePagesOpen(false); setActiveKey(item.label) }} aria-label={item.label} aria-expanded={item.label === 'Mais' ? morePagesOpen : undefined} aria-current={activeKey === item.label || (item.label === 'Mais' && morePages.some((page) => page.label === activeKey)) ? 'page' : undefined} flex={1} height={56} padding={0} borderWidth={0} backgroundColor={(item.label === 'Mais' ? morePagesOpen || morePages.some((page) => page.label === activeKey) : activeKey === item.label) ? '#e6f4f1' : 'transparent'} color={(item.label === 'Mais' ? morePagesOpen || morePages.some((page) => page.label === activeKey) : activeKey === item.label) ? '#087f70' : '#667085'}>
            <YStack gap={4} style={{ alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={18} /><Text fontSize={11} fontWeight="700">{item.label}</Text></YStack>
          </Button>)}
        </XStack>
        {morePagesOpen ? <>
          <button className="mobile-more-panel-dismiss" type="button" aria-label="Fechar menu Mais" onClick={() => setMorePagesOpen(false)} />
          <section className="mobile-more-pages-panel" role="menu" aria-label="Páginas secundárias">
            <h2>Mais páginas</h2>
            {morePages.map((page) => <button key={page.label} className="mobile-more-page-item" type="button" role="menuitem" onClick={() => { setMorePagesOpen(false); setActiveKey(page.label) }}><Icon name={page.icon} size={18} /><span>{page.label}</span></button>)}
          </section>
        </> : null}
        {addMenuOpen ? <><button className="add-fab-dismiss" type="button" aria-label="Fechar opções de criação" onClick={() => setAddMenuOpen(false)} /><div className="add-fab-menu" role="menu" aria-label={`Criar na página ${activeKey}`}>
          {fabActions.map((action) => <button key={action.label} className="add-fab-menu-item" type="button" role="menuitem" onClick={() => { setAddMenuOpen(false); if (action.kind === 'unavailable') notify(action.message); else openForm(action.kind) }}><Icon name={action.icon} size={18} color={action.kind === 'expense' ? '#c2415d' : action.kind === 'income' ? '#16805b' : action.kind === 'transfer' ? '#175cd3' : '#667085'} /><span>{action.label}</span></button>)}
        </div></> : null}
        {!['Relatórios', 'Configurações'].includes(activeKey) ? <button className="app-add-fab" type="button" onClick={handleAddFabClick} aria-label={`Adicionar na página ${activeKey}`} aria-expanded={addMenuOpen} title={`Adicionar — ${activeKey}`}>
          <Icon name="plus" size={26} color="#ffffff" strokeWidth={2.2} />
        </button> : null}
        {activeForm ? <MovementForm kind={activeForm} onClose={() => setActiveForm(null)} onUnavailable={(message) => { setActiveForm(null); notify(message) }} /> : null}
    </AppShell>
  )
}
