export type OrbeIconName = 'download' | 'eye' | 'eyeOff' | 'minus' | 'plus' | 'exchange' | 'grid' | 'moves' | 'wallet' | 'more' | 'chevronRight'

const paths: Record<OrbeIconName, string> = {
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

export function OrbeIcon({ name, size = 20, color = 'currentColor' }: { name: OrbeIconName; size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
