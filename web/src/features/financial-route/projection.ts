const MONEY_SCALE = 10_000n

export function parseMoneyUnits(value: string | number): bigint | null {
  const text = String(value).trim()
  const match = /^(-?)(\d+)(?:\.(\d{1,4}))?$/.exec(text)
  if (!match) return null
  const fraction = (match[3] ?? '').padEnd(4, '0')
  const units = BigInt(match[2]) * MONEY_SCALE + BigInt(fraction)
  return match[1] === '-' ? -units : units
}

export function formatMoneyUnits(value: bigint): string {
  const absolute = value < 0n ? -value : value
  const cents = (absolute + 50n) / 100n
  const whole = cents / 100n
  const fraction = String(cents % 100n).padStart(2, '0')
  const grouped = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(whole)
  return (value < 0n && cents > 0n ? '−' : '') + grouped + ',' + fraction
}

export function isDisplayedNegative(value: bigint): boolean {
  if (value >= 0n) return false
  return ((-value + 50n) / 100n) > 0n
}
