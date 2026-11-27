type MonthSelectorProps = {
  month: string
  onMonthChange: (month: string) => void
  minMonth?: string
  maxMonth?: string
  className?: string
}

function shiftMonth(value: string, offset: number) {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function shortMonthLabel(value: string) {
  const date = new Date(`${value}-01T12:00:00`)
  const month = new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(date).replace('.', '')
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`
}

export function MonthSelector({ month, onMonthChange, minMonth, maxMonth, className = '' }: MonthSelectorProps) {
  const previous = shiftMonth(month, -1)
  const next = shiftMonth(month, 1)
  const canGoPrevious = !minMonth || previous >= minMonth
  const canGoNext = !maxMonth || next <= maxMonth

  return (
    <div className={`orbe-month-selector ${className}`} role="group" aria-label="Navegação por mês">
      <span className="orbe-month-selector-label" aria-label="Mês selecionado">{shortMonthLabel(month)}</span>
      <div className="orbe-month-selector-navigation">
        <button className="orbe-month-selector-arrow" type="button" aria-label="Mês anterior" disabled={!canGoPrevious} onClick={() => onMonthChange(previous)}>
          <span aria-hidden="true">‹</span>
        </button>
        <button className="orbe-month-selector-arrow" type="button" aria-label="Mês seguinte" disabled={!canGoNext} onClick={() => onMonthChange(next)}>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  )
}
