export type AppIconName = 'plus' | 'home' | 'activity' | 'route' | 'wallet' | 'creditCard' | 'settings' | 'more' | 'bell' | 'user' | 'eye' | 'eyeOff' | 'expense' | 'income' | 'transfer' | 'store' | 'salary' | 'house' | 'chevronLeft' | 'chevronRight' | 'logout'

const iconPaths: Record<AppIconName, string> = {
  plus: 'M12 5v14M5 12h14',
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z',
  activity: 'M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-8',
  route: 'M5 19c2.5 0 3.5-2 3.5-4.5S7.5 10 10 10s3.5 2 3.5 4.5S12.5 19 15 19s3.5-2 4-4',
  wallet: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v15H6.5A2.5 2.5 0 0 1 4 17.5v-11ZM4 8h16m-5 5h2',
  creditCard: 'M3 5h18v14H3zM3 10h18M7 15h3',
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
  logout: 'M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6',
}

export function AppIcon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }: { name: AppIconName; size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  )
}
