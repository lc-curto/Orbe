import type { ReactNode } from 'react'
import { Button, Card, Text, Row, Stack } from './primitives'
import { OrbeIcon } from './Icon'
import type { OrbeIconName } from './Icon'
import { movementTone, orbe } from './tokens'
import type { MovementKind } from './tokens'

export function OrbeCard({ children, className, muted = false }: { children: ReactNode; className?: string; muted?: boolean }) {
  return <Card className={className} borderWidth={1} borderColor={orbe.colors.border} borderRadius={orbe.radius.card} padding={orbe.space.xl} backgroundColor={muted ? orbe.colors.surfaceMuted : orbe.colors.surface}>{children}</Card>
}

export function OrbeIconButton({ icon, label, onPress, disabled = false }: { icon: OrbeIconName; label: string; onPress?: () => void; disabled?: boolean }) {
  return <Button aria-label={label} onPress={onPress} disabled={disabled} width={orbe.size.touch} height={orbe.size.touch} borderRadius={orbe.radius.control} padding={0} borderWidth={1} borderColor={orbe.colors.border} backgroundColor={orbe.colors.surface}><OrbeIcon name={icon} size={18} color={orbe.colors.textMuted} /></Button>
}

export function OrbeSectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <Row style={{ justifyContent: 'space-between', alignItems: 'center' }} marginBottom={orbe.space.md}><Text color={orbe.colors.text} fontSize={orbe.typography.title} fontWeight="800">{title}</Text>{action ? <Button onPress={onAction} aria-label={action} borderWidth={0} backgroundColor="transparent" padding={0} color={orbe.colors.primary} fontSize={orbe.typography.label} fontWeight="700">{action}</Button> : null}</Row>
}

export function OrbeAmount({ value, kind, large = false }: { value: string; kind: MovementKind; large?: boolean }) {
  const tone = movementTone[kind]
  return <Text color={tone.color} fontSize={large ? orbe.typography.amount : 14} fontWeight="800" fontVariant="tabular-nums">{kind === 'transfer' ? value : `${tone.sign} ${value}`}</Text>
}

export function OrbeBadge({ children, tone = 'success' }: { children: ReactNode; tone?: 'success' | 'neutral' }) {
  const colors = tone === 'success' ? { backgroundColor: orbe.colors.successSoft, color: orbe.colors.success } : { backgroundColor: orbe.colors.primarySoft, color: orbe.colors.primary }
  return <Text backgroundColor={colors.backgroundColor} color={colors.color} borderRadius={orbe.radius.pill} paddingHorizontal={10} paddingVertical={6} fontSize={12} fontWeight="700">{children}</Text>
}

export function OrbeBottomBar({ active, onSelect }: { active: string; onSelect: (label: string) => void }) {
  const items: Array<[string, OrbeIconName]> = [['Início', 'grid'], ['Movimentos', 'moves'], ['Novo', 'plus'], ['Contas', 'wallet'], ['Mais', 'more']]
  return <Row className="orbe-bottom-bar" backgroundColor={orbe.colors.surface} borderTopWidth={1} borderColor={orbe.colors.border} paddingHorizontal={8} paddingTop={8} paddingBottom={8}>{items.map(([label, icon]) => <Button key={label} onPress={() => onSelect(label)} aria-label={label} flex={1} height={58} padding={0} borderWidth={0} backgroundColor="transparent" color={active === label ? orbe.colors.primary : orbe.colors.neutral}><Stack gap={4} style={{ alignItems: 'center', justifyContent: 'center' }}>{label === 'Novo' ? <Stack width={48} height={48} marginTop={-24} borderRadius={orbe.radius.pill} backgroundColor={orbe.colors.primary} style={{ alignItems: 'center', justifyContent: 'center' }}><OrbeIcon name="plus" size={22} color="#ffffff" /></Stack> : <OrbeIcon name={icon} size={19} color="currentColor" />}<Text color="currentColor" fontSize={11} fontWeight={active === label ? '700' : '500'}>{label}</Text></Stack></Button>)}</Row>
}
