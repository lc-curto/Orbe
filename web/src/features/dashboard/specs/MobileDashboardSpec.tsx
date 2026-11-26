import { useState } from 'react'
import { Button, Card, Separator, Text, Theme, XStack, YStack } from 'tamagui'

type MobileIconName = 'download' | 'eye' | 'eyeOff' | 'minus' | 'plus' | 'exchange' | 'grid' | 'moves' | 'wallet' | 'more' | 'chevronRight'

const paths: Record<MobileIconName, string> = {
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 21h16',
  eye: 'M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'm3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.7M6.2 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.6',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
  exchange: 'M5 8h14m-4-3 4 3-4 3M19 16H5m4-3-4 3 4 3',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  moves: 'M5 8h14m-4-3 4 3-4 3M19 16H5m4-3-4 3 4 3',
  wallet: 'M4 7a2 2 0 0 1 2-2h13v14H6a2 2 0 0 1-2-2V7Zm0 2h15m-5 4h2',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  chevronRight: 'm9 18 6-6-6-6',
}

function MobileIcon({ name, size = 20, color = 'currentColor' }: { name: MobileIconName; size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

const surface = { borderWidth: 1, borderColor: '#e8e9f0' as const }

export default function MobileDashboardSpec() {
  const [hidden, setHidden] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [active, setActive] = useState('Início')

  function notify(message: string) {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 2200)
  }

  return (
    <Theme name="light">
      <YStack className="mobile-spec-shell" backgroundColor="#f7f8fc" minHeight="100vh">
        <YStack className="mobile-spec-content" width="100%" maxWidth={480} marginHorizontal="auto" padding={20} gap={20}>
          <XStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <YStack gap={4}>
              <Text fontSize={28} lineHeight={34} fontWeight="800" color="#17152e">Boa tarde, Lucas Curto!</Text>
              <Text color="#73758a" fontSize={15}>Terça, 24 de novembro</Text>
            </YStack>
            <Button aria-label="Exportar dashboard" onPress={() => notify('Exportação preparada')} width={44} height={44} borderRadius={14} padding={0} {...surface} backgroundColor="#ffffff"><MobileIcon name="download" size={19} color="#6254f5" /></Button>
          </XStack>

          <YStack gap={8}>
            <Text color="#73758a" fontSize={13} fontWeight="600">MÊS DE REFERÊNCIA</Text>
            <Button onPress={() => notify('Seletor de mês')} height={48} paddingHorizontal={16} borderRadius={14} {...surface} backgroundColor="#ffffff" style={{ justifyContent: 'space-between' }}>
              <XStack width="100%" style={{ justifyContent: 'space-between', alignItems: 'center' }}><Text color="#17152e" fontWeight="700">Novembro 2026</Text><MobileIcon name="chevronRight" size={18} color="#8a8ca0" /></XStack>
            </Button>
          </YStack>

          <Card className="mobile-spec-balance" borderRadius={24} padding={20} backgroundColor="#6254f5" borderWidth={0}>
            <YStack gap={16}>
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text color="#e8e5ff" fontSize={13} fontWeight="800" letterSpacing={1}>SALDO DISPONÍVEL</Text>
                <Button aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'} onPress={() => setHidden(!hidden)} width={36} height={36} padding={0} borderWidth={0} backgroundColor="rgba(255,255,255,0.14)" borderRadius={12}><MobileIcon name={hidden ? 'eyeOff' : 'eye'} size={18} color="#ffffff" /></Button>
              </XStack>
              <YStack gap={4}><Text color="#ffffff" fontSize={36} fontWeight="800">{hidden ? '••••••' : '1.000,00 €'}</Text><Text color="#e8e5ff" fontSize={14}>Contas bancárias e dinheiro</Text></YStack>
              <Separator borderColor="rgba(255,255,255,0.25)" />
              <XStack style={{ justifyContent: 'space-between' }}>
                {[['Receitas', '1.000,00 €'], ['Despesas', '162,00 €'], ['Resultado', '+838,00 €']].map(([label, value]) => <YStack key={label} gap={4} flex={1}><Text color="#e8e5ff" fontSize={12}>{label}</Text><Text color="#ffffff" fontSize={14} fontWeight="800">{hidden ? '••••' : value}</Text></YStack>)}
              </XStack>
            </YStack>
          </Card>

          <YStack gap={12}>
            <Text fontSize={18} fontWeight="800" color="#17152e">Ações rápidas</Text>
            <XStack gap={10}>
              {[['minus', 'Despesa'], ['plus', 'Receita'], ['exchange', 'Câmbio']].map(([icon, label]) => <Button key={label} onPress={() => notify(`${label} selecionado`)} flex={1} height={82} padding={8} borderRadius={16} {...surface} backgroundColor="#ffffff"><YStack gap={8} style={{ alignItems: 'center', justifyContent: 'center' }}><YStack width={32} height={32} borderRadius={999} backgroundColor="#eeecff" style={{ alignItems: 'center', justifyContent: 'center' }}><MobileIcon name={icon as MobileIconName} size={16} color="#6254f5" /></YStack><Text color="#17152e" fontSize={12} fontWeight="700">{label}</Text></YStack></Button>)}
            </XStack>
          </YStack>

          <Card {...surface} borderRadius={20} padding={18} backgroundColor="#ffffff">
            <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={14}><Text color="#17152e" fontSize={18} fontWeight="800">Despesas por categoria</Text><Button onPress={() => notify('A mostrar todas as despesas')} borderWidth={0} backgroundColor="transparent" padding={0} color="#6254f5" fontSize={13} fontWeight="700">Ver todas</Button></XStack>
            <YStack gap={16}>
              {[['Casa', '162,00 €', 88], ['Juros', '1,00 €', 12]].map(([label, value, width]) => <YStack key={String(label)} gap={7}><XStack style={{ justifyContent: 'space-between' }}><Text color="#45465a" fontSize={14}>{label}</Text><Text color="#17152e" fontSize={14} fontWeight="700">{value}</Text></XStack><YStack height={7} borderRadius={999} backgroundColor="#eeecff"><YStack width={`${width}%`} height={7} borderRadius={999} backgroundColor="#6254f5" /></YStack></YStack>)}
            </YStack>
          </Card>

          <Card {...surface} borderRadius={20} padding={18} backgroundColor="#ffffff">
            <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={14}><Text color="#17152e" fontSize={18} fontWeight="800">Cartões</Text><Button onPress={() => notify('A abrir cartões')} borderWidth={0} backgroundColor="transparent" padding={0} color="#6254f5" fontSize={13} fontWeight="700">Ver todos</Button></XStack>
            <Card borderRadius={16} padding={14} backgroundColor="#fafaff" borderWidth={1} borderColor="#eeecff"><XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}><YStack gap={5}><Text color="#73758a" fontSize={12}>Fatura do cartão</Text><Text color="#17152e" fontSize={22} fontWeight="800">12,00 €</Text></YStack><Text color="#31855b" backgroundColor="#e5f7ed" borderRadius={999} paddingHorizontal={10} paddingVertical={6} fontSize={12} fontWeight="700">Em aberto</Text></XStack></Card>
          </Card>
        </YStack>

        {feedback ? <XStack className="mobile-spec-toast" role="status" aria-live="polite"><Text color="#ffffff" fontWeight="700">{feedback}</Text></XStack> : null}
        <XStack className="mobile-spec-bottom-bar" backgroundColor="#ffffff" borderTopWidth={1} borderColor="#e8e9f0" paddingHorizontal={8} paddingTop={8} paddingBottom={8}>
          {[['Início', 'grid'], ['Movimentos', 'moves'], ['Novo', 'plus'], ['Contas', 'wallet'], ['Mais', 'more']].map(([label, icon]) => <Button key={label} onPress={() => { setActive(label); notify(label === 'Novo' ? 'Criar novo movimento' : `${label} selecionado`) }} flex={1} height={58} padding={0} borderWidth={0} backgroundColor="transparent" color={active === label ? '#6254f5' : '#85879a'}><YStack gap={4} style={{ alignItems: 'center', justifyContent: 'center' }}>{label === 'Novo' ? <YStack width={48} height={48} marginTop={-24} borderRadius={999} backgroundColor="#6254f5" style={{ alignItems: 'center', justifyContent: 'center' }}><MobileIcon name="plus" size={22} color="#ffffff" /></YStack> : <MobileIcon name={icon as MobileIconName} size={19} color="currentColor" />}<Text fontSize={11} fontWeight={active === label ? '700' : '500'}>{label}</Text></YStack></Button>)}
        </XStack>
      </YStack>
    </Theme>
  )
}
