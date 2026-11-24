import { useState } from 'react'
import {
  Button,
  Card,
  H1,
  Paragraph,
  Separator,
  Text,
  Theme,
  XStack,
  YStack,
} from 'tamagui'

type IconName = 'home' | 'activity' | 'route' | 'wallet' | 'more' | 'bell' | 'user' | 'eye' | 'eyeOff' | 'expense' | 'income' | 'transfer' | 'store' | 'salary' | 'house' | 'chevronLeft' | 'chevronRight'

const iconPaths: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z',
  activity: 'M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-8',
  route: 'M5 19c2.5 0 3.5-2 3.5-4.5S7.5 10 10 10s3.5 2 3.5 4.5S12.5 19 15 19s3.5-2 4-4',
  wallet: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v15H6.5A2.5 2.5 0 0 1 4 17.5v-11ZM4 8h16m-5 5h2',
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

const movements = [
  { icon: 'store' as IconName, name: 'Supermercado Silva', meta: 'Despesa · Alimentação', amount: '− € 120,45', tone: '#c2415d', iconColor: '#c2415d' },
  { icon: 'salary' as IconName, name: 'Salário', meta: 'Receita · Trabalho', amount: '+ € 2.400,00', tone: '#16805b', iconColor: '#16805b' },
  { icon: 'transfer' as IconName, name: 'Transferência', meta: 'Entre contas · Conta principal → Poupança', amount: '€ 300,00', tone: '#175cd3', iconColor: '#175cd3' },
  { icon: 'house' as IconName, name: 'Renda', meta: 'Despesa · Habitação', amount: '− € 750,00', tone: '#c2415d', iconColor: '#c2415d' },
]

const border = { borderWidth: 1, borderColor: '#e4e7ec' as const }
const centered = { alignItems: 'center' as const, justifyContent: 'center' as const }

function SummaryCard({ label, amount, detail, tone }: { label: string; amount: string; detail: string; tone?: string }) {
  return (
    <Card {...border} borderRadius={20} padding={20} flex={1} minWidth={220} backgroundColor="#ffffff">
      <YStack gap={8}>
        <Text color="#667085" fontSize={16}>{label}</Text>
        <Text color={tone ?? '#101828'} fontSize={28} fontWeight="800">{amount}</Text>
        <Text color="#667085" fontSize={14}>{detail}</Text>
      </YStack>
    </Card>
  )
}

function QuickAction({ icon, label, detail, color }: { icon: IconName; label: string; detail: string; color: string }) {
  return (
    <XStack {...border} flex={1} minWidth={180} height={76} borderRadius={16} backgroundColor="#ffffff" paddingHorizontal={16} style={{ justifyContent: 'flex-start' }}>
      <XStack gap={12} style={centered}>
        <YStack width={40} height={40} borderRadius={16} backgroundColor={color === '#175cd3' ? '#e6f0ff' : '#e6f4f1'} style={centered}>
          <Icon name={icon} size={19} color={color} />
        </YStack>
        <YStack style={{ alignItems: 'flex-start' }} gap={4}>
          <Text fontWeight="700">{label}</Text>
          <Text color="#667085" fontSize={14}>{detail}</Text>
        </YStack>
      </XStack>
    </XStack>
  )
}

function MobileDashboard({ period, navigation, activeKey, setActiveKey, notify }: {
  period: { label: string; shortLabel: string; date: string; income: string; expenses: string }
  navigation: Array<{ icon: IconName; label: string }>
  activeKey: string
  setActiveKey: (value: string) => void
  notify: (message: string) => void
}) {
  const [hidden, setHidden] = useState(false)

  return (
    <YStack className="mobile-dashboard" backgroundColor="#f7f9fc" minHeight="100vh">
      <YStack className="mobile-dashboard-content" gap={16}>
        <XStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <YStack gap={3}><Text color="#101828" fontSize={22} fontWeight="800">Bom dia, Lucas</Text><Text color="#667085" fontSize={13}>{period.date}</Text></YStack>
          <Button onPress={() => notify('Seletor de mês')} aria-label="Selecionar mês" height={38} paddingHorizontal={12} borderRadius={12} {...border} backgroundColor="#ffffff"><XStack gap={6} style={{ alignItems: 'center' }}><Text color="#101828" fontSize={12} fontWeight="700">{period.shortLabel}</Text><Icon name="chevronRight" size={15} color="#667085" /></XStack></Button>
        </XStack>
        <Card className="mobile-balance-card" borderRadius={18} padding={18} backgroundColor="#175cd3" borderWidth={0}>
          <YStack gap={12}><XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}><Text color="#dbeafe" fontSize={11} fontWeight="800" letterSpacing={1}>SALDO DISPONÍVEL</Text><Button onPress={() => setHidden((value) => !value)} aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'} width={30} height={30} padding={0} borderRadius={9} borderWidth={0} backgroundColor="rgba(255,255,255,0.14)"><Icon name={hidden ? 'eyeOff' : 'eye'} size={15} color="#ffffff" /></Button></XStack><YStack gap={2}><Text color="#ffffff" fontSize={30} fontWeight="800">{hidden ? '••••••' : '€ 2.840,50'}</Text><Text color="#dbeafe" fontSize={12}>Todas as contas</Text></YStack><Separator borderColor="rgba(255,255,255,0.24)" /><XStack style={{ justifyContent: 'space-between' }}>{[['Receitas', period.income], ['Despesas', period.expenses], ['Resultado', '+ € 2.054,20']].map(([label, value]) => <YStack key={label} gap={3} flex={1}><Text color="#dbeafe" fontSize={11}>{label}</Text><Text color="#ffffff" fontSize={13} fontWeight="800">{hidden ? '••••' : value}</Text></YStack>)}</XStack></YStack>
        </Card>
        <YStack gap={9}><Text color="#101828" fontSize={16} fontWeight="800">Ações rápidas</Text><XStack gap={9}>{[['expense', 'Despesa'], ['income', 'Receita'], ['transfer', 'Câmbio']].map(([icon, label]) => <Button key={label} onPress={() => notify(`${label} selecionado`)} flex={1} height={72} padding={8} borderRadius={14} {...border} backgroundColor="#ffffff"><YStack gap={7} style={{ alignItems: 'center', justifyContent: 'center' }}><YStack width={28} height={28} borderRadius={10} backgroundColor="#e6f0ff" style={centered}><Icon name={icon as IconName} size={15} color="#175cd3" /></YStack><Text color="#101828" fontSize={11} fontWeight="700">{label}</Text></YStack></Button>)}</XStack></YStack>
        <Card {...border} borderRadius={16} padding={16} backgroundColor="#ffffff"><XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={12}><Text color="#101828" fontSize={16} fontWeight="800">Despesas por categoria</Text><Button onPress={() => notify('A mostrar despesas por categoria')} borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontSize={12} fontWeight="700">Ver todas</Button></XStack><YStack gap={12}>{[['Casa', '€ 162,00', 82], ['Juros', '€ 1,00', 12]].map(([label, value, width]) => <YStack key={String(label)} gap={5}><XStack style={{ justifyContent: 'space-between' }}><Text color="#475467" fontSize={12}>{label}</Text><Text color="#101828" fontSize={12} fontWeight="700">{value}</Text></XStack><YStack height={5} borderRadius={99} backgroundColor="#e6f0ff"><YStack width={`${width}%`} height={5} borderRadius={99} backgroundColor="#175cd3" /></YStack></YStack>)}</YStack></Card>
        <Card {...border} borderRadius={16} padding={16} backgroundColor="#ffffff"><XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={10}><Text color="#101828" fontSize={16} fontWeight="800">Cartões</Text><Button onPress={() => notify('A abrir cartões')} borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontSize={12} fontWeight="700">Ver todos</Button></XStack><XStack padding={12} borderRadius={12} backgroundColor="#f7f9fc" style={{ justifyContent: 'space-between', alignItems: 'center' }}><YStack gap={3}><Text color="#667085" fontSize={11}>Fatura do cartão</Text><Text color="#101828" fontSize={19} fontWeight="800">€ 12,00</Text></YStack><Text color="#087f70" backgroundColor="#e6f4f1" borderRadius={99} paddingHorizontal={9} paddingVertical={5} fontSize={11} fontWeight="700">Em aberto</Text></XStack></Card>
      </YStack>
      <XStack className="mobile-dashboard-nav" backgroundColor="#ffffff" borderTopWidth={1} borderColor="#eaecf0" paddingHorizontal={6} paddingTop={6} paddingBottom={6}>{navigation.map((item) => <Button key={item.label} onPress={() => { setActiveKey(item.label); notify(`${item.label} selecionado`) }} flex={1} height={50} padding={0} borderWidth={0} borderRadius={10} backgroundColor={activeKey === item.label ? '#e6f4f1' : 'transparent'} color={activeKey === item.label ? '#087f70' : '#667085'}><YStack gap={3} style={{ alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={17} /><Text fontSize={10} fontWeight={activeKey === item.label ? '700' : '500'}>{item.label}</Text></YStack></Button>)}</XStack>
    </YStack>
  )
}

export default function App() {
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
  const [periodIndex, setPeriodIndex] = useState(0)
  const [feedback, setFeedback] = useState('')

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

  function notify(message: string) {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 2400)
  }

  return (
    <Theme name="light">
      <YStack flex={1} backgroundColor="#f8fafc" minHeight="100vh">
        <XStack className="desktop-layout" flex={1}>
          <YStack className={`desktop-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`} padding={20} borderRightWidth={1} borderColor="#eaecf0" backgroundColor="#ffffff">
            <XStack style={{ justifyContent: sidebarOpen ? 'space-between' : 'center', alignItems: 'center' }} marginBottom={40}>
              {sidebarOpen ? <Text fontSize={28} fontWeight="800" color="#101828">Orbe</Text> : null}
              <Button onPress={toggleSidebar} aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'} width={40} height={40} borderRadius={10} padding={0} borderWidth={1} borderColor="#e4e7ec" backgroundColor={sidebarOpen ? 'transparent' : '#f7f9fc'}>
                <Icon name={sidebarOpen ? 'chevronLeft' : 'chevronRight'} size={18} color="#667085" />
              </Button>
            </XStack>
            <YStack gap={8} flex={1}>
              {navigation.map((item) => (
                <Button key={item.label} onPress={() => { setActiveKey(item.label); notify(`${item.label} selecionado`) }} aria-label={item.label} aria-current={activeKey === item.label ? 'page' : undefined} style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }} borderWidth={0} backgroundColor={activeKey === item.label ? '#e6f4f1' : 'transparent'} color={activeKey === item.label ? '#087f70' : '#475467'}>
                  <XStack gap={10} style={{ alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}><Icon name={item.icon} size={16} />{sidebarOpen ? <Text>{item.label}</Text> : null}</XStack>
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack className="main-content" flex={1} padding={20} gap={20} maxWidth={1280} marginHorizontal="auto" width="100%">
            <XStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <YStack gap={4}>
                <H1 fontSize={36} letterSpacing={-1.2}>Bom dia, Lucas</H1>
                <Paragraph color="#667085">{period.date}</Paragraph>
              </YStack>
              <XStack gap={12}>
                <Button onPress={() => notify('Não existem notificações novas')} aria-label="Notificações" width={44} height={44} borderRadius={999} {...border} padding={0}><Icon name="bell" size={17} color="#344054" /></Button>
                <Button onPress={() => notify('Perfil do utilizador')} aria-label="Perfil" width={44} height={44} borderRadius={999} {...border} padding={0}><Icon name="user" size={17} color="#344054" /></Button>
              </XStack>
            </XStack>

            <XStack style={{ justifyContent: 'flex-end' }}>
              <XStack borderWidth={1} borderColor="#d0d5dd" borderRadius={999} backgroundColor="#ffffff" paddingHorizontal={12} paddingVertical={8} gap={16} style={centered}>
                <Button onPress={() => setPeriodIndex(Math.max(0, periodIndex - 1))} aria-label="Período anterior" disabled={periodIndex === 0} width={36} height={36} padding={0} borderWidth={0} backgroundColor="transparent"><Icon name="chevronLeft" size={17} color="#667085" /></Button>
                <Text aria-label={`Período selecionado: ${period.label}`} fontWeight="700">{period.shortLabel}</Text>
                <Button onPress={() => setPeriodIndex(Math.min(periods.length - 1, periodIndex + 1))} aria-label="Período seguinte" disabled={periodIndex === periods.length - 1} width={36} height={36} padding={0} borderWidth={0} backgroundColor="transparent"><Icon name="chevronRight" size={17} color="#667085" /></Button>
              </XStack>
            </XStack>

            <XStack flexWrap="wrap" gap={16}>
              <Card {...border} borderRadius={20} padding={20} flex={1} minWidth={260} backgroundColor="#175cd3">
                <YStack gap={8}>
                  <Text color="#dbeafe" fontSize={16}>Saldo total</Text>
                  <Text color="#ffffff" fontSize={34} fontWeight="800">€ 2.840,50</Text>
                  <Text color="#dbeafe" fontSize={14}>Todas as contas</Text>
                </YStack>
              </Card>
              <SummaryCard label="Receitas" amount={period.income} detail={`Realizadas em ${period.label}`} tone="#16805b" />
              <SummaryCard label="Despesas" amount={period.expenses} detail={`Realizadas em ${period.label}`} tone="#c2415d" />
            </XStack>

            <XStack flexWrap="wrap" gap={16}>
              <Button onPress={() => notify('A abrir registo de despesa')} flex={1} minWidth={180} padding={0} borderWidth={0} backgroundColor="transparent"><QuickAction icon="expense" label="Despesa" detail="Registar despesa" color="#175cd3" /></Button>
              <Button onPress={() => notify('A abrir registo de receita')} flex={1} minWidth={180} padding={0} borderWidth={0} backgroundColor="transparent"><QuickAction icon="income" label="Receita" detail="Registar receita" color="#087f70" /></Button>
              <Button onPress={() => notify('A abrir transferência entre contas')} flex={1} minWidth={180} padding={0} borderWidth={0} backgroundColor="transparent"><QuickAction icon="transfer" label="Transferir" detail="Entre contas" color="#175cd3" /></Button>
            </XStack>

            <Card className="desktop-categories-card" {...border} borderRadius={20} padding={20} backgroundColor="#ffffff">
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={16}>
                <YStack gap={3}><Text fontSize={18} fontWeight="700">Despesas por categoria</Text><Text color="#667085" fontSize={13}>Distribuição das despesas em {period.label}</Text></YStack>
                <Button onPress={() => notify('A mostrar despesas por categoria')} aria-label="Ver todas as despesas por categoria" borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontWeight="700">Ver todas →</Button>
              </XStack>
              <XStack gap={28} flexWrap="wrap">
                {[['Casa', '€ 162,00', '82%', '#175cd3'], ['Juros', '€ 1,00', '12%', '#087f70']].map(([label, value, width, color]) => <YStack key={label} flex={1} minWidth={220} gap={7}><XStack style={{ justifyContent: 'space-between' }}><Text color="#475467" fontSize={13}>{label}</Text><Text color="#101828" fontSize={13} fontWeight="700">{value}</Text></XStack><YStack height={7} borderRadius={99} backgroundColor="#eef2f6"><YStack width={width} height={7} borderRadius={99} backgroundColor={color} /></YStack></YStack>)}
              </XStack>
            </Card>

            <Card {...border} borderRadius={20} padding={20} backgroundColor="#ffffff">
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={8}>
                <Text fontSize={18} fontWeight="700">Últimos movimentos</Text>
                <Button onPress={() => { setActiveKey('Movimentos'); notify('A mostrar todos os movimentos') }} aria-label="Ver todos os movimentos" borderWidth={0} backgroundColor="transparent" padding={0} color="#087f70" fontWeight="700">Ver todos →</Button>
              </XStack>
              <YStack>
                {movements.map((movement, index) => (
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
        <MobileDashboard period={period} navigation={navigation} activeKey={activeKey} setActiveKey={setActiveKey} notify={notify} />
        {feedback ? <XStack className="feedback-toast" role="status" aria-live="polite"><Text color="#ffffff" fontWeight="600">{feedback}</Text></XStack> : null}
        <XStack className="mobile-bottom-bar" backgroundColor="#ffffff" borderTopWidth={1} borderColor="#eaecf0" paddingHorizontal={8} paddingTop={8} paddingBottom={8}>
          {navigation.map((item) => (
            <Button key={item.label} onPress={() => { setActiveKey(item.label); notify(`${item.label} selecionado`) }} aria-label={item.label} aria-current={activeKey === item.label ? 'page' : undefined} flex={1} height={56} padding={0} borderWidth={0} backgroundColor={activeKey === item.label ? '#e6f4f1' : 'transparent'} color={activeKey === item.label ? '#087f70' : '#667085'}>
              <YStack gap={4} style={{ alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={18} /><Text fontSize={11} fontWeight={activeKey === item.label ? '700' : '500'}>{item.label}</Text></YStack>
            </Button>
          ))}
        </XStack>
      </YStack>
    </Theme>
  )
}
