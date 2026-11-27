export type AppIconName = 'plus' | 'home' | 'activity' | 'route' | 'wallet' | 'creditCard' | 'settings' | 'more' | 'bell' | 'user' | 'eye' | 'eyeOff' | 'expense' | 'income' | 'transfer' | 'store' | 'salary' | 'house' | 'chevronLeft' | 'chevronRight' | 'logout' | 'shield' | 'database' | 'info' | 'tag' | 'sun' | 'moon' | 'monitor'

const iconPaths: Record<AppIconName, string> = {
  plus: 'M12 5v14M5 12h14',
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z',
  activity: 'M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-8',
  route: 'M5 19c2.5 0 3.5-2 3.5-4.5S7.5 10 10 10s3.5 2 3.5 4.5S12.5 19 15 19s3.5-2 4-4',
  wallet: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v15H6.5A2.5 2.5 0 0 1 4 17.5v-11ZM4 8h16m-5 5h2',
  creditCard: 'M3 5h18v14H3zM3 10h18M7 15h3',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm7.4 4a7.4 7.4 0 0 0-.1-1.2l1.7-1.3-1.7-3-2 .8a7.1 7.1 0 0 0-2-1.2L15 4H9l-.3 2.1a7.1 7.1 0 0 0-2 1.2l-2-.8-1.7 3 1.7 1.3a7.4 7.4 0 0 0 0 2.4L3 14.5l1.7 3 2-.8a7.1 7.1 0 0 0 2 1.2L9 20h6l.3-2.1a7.1 7.1 0 0 0 2-1.2l2 .8 1.7-3-1.7-1.3a7.4 7.4 0 0 0 .1-1.2Z',
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
  logout: 'M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6',
  shield: 'M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Zm-3.5 9 2.3 2.3 4.7-4.7',
  database: 'M4 5c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Zm0 0v14c0 1.1 3.6 2 8 2s8-.9 8-2V5m-16 7c0 1.1 3.6 2 8 2s8-.9 8-2m-16 5c0 1.1 3.6 2 8 2s8-.9 8-2',
  info: 'M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  tag: 'm20 13-7 7-10-10V3h7l10 10Zm-12-6h.01',
  sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z',
  monitor: 'M3 4h18v13H3zM8 21h8m-4-4v4',
}

export function AppIcon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }: { name: AppIconName; size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  )
}
