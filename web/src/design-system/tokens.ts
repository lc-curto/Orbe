export const orbe = {
  colors: {
    background: '#f7f8fc',
    surface: '#ffffff',
    surfaceMuted: '#fafaff',
    primary: '#6254f5',
    primaryDark: '#5044d8',
    primarySoft: '#eeecff',
    text: '#17152e',
    textMuted: '#73758a',
    border: '#e8e9f0',
    success: '#31855b',
    successSoft: '#e5f7ed',
    danger: '#bd4963',
    dangerSoft: '#fff0f3',
    neutral: '#85879a',
    focus: '#aaa3ff',
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { control: 12, card: 20, large: 24, pill: 999 },
  size: { touch: 44, bottomBar: 74 },
  typography: { body: 14, label: 13, title: 18, headline: 28, amount: 36 },
} as const

export type MovementKind = 'income' | 'expense' | 'transfer'

export const movementTone: Record<MovementKind, { color: string; soft: string; sign: string }> = {
  income: { color: orbe.colors.success, soft: orbe.colors.successSoft, sign: '+' },
  expense: { color: orbe.colors.danger, soft: orbe.colors.dangerSoft, sign: '−' },
  transfer: { color: orbe.colors.primary, soft: orbe.colors.primarySoft, sign: '' },
}
