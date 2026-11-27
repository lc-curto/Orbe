import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { OrbeDisclosure, OrbeFormToggle } from '../../../design-system/components'
import { OrbeIcon } from '../../../design-system/Icon'
import type { OrbeIconName } from '../../../design-system/Icon'
import { orbe } from '../../../design-system/tokens'
import { useCurrency } from '../../currency/useCurrency'
import { ApiError } from '../../../api/client'
import type { Account, Category } from '../../../api/types'
import { createExpense, createIncome, createRecurrence, createTransfer } from '../../../api/finance'
import './formStyles.css'

type FormKind = 'expense' | 'income' | 'transfer'
type FieldErrors = Record<string, string>

type FormContainerProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  dirty?: boolean
  submitting?: boolean
  fullScreen?: boolean
}

type SelectOption = {
  value: string
  label: string
  secondary?: string
  icon?: OrbeIconName
  disabled?: boolean
}

const formTokens = {
  '--orbe-form-primary': 'var(--orbe-primary)',
  '--orbe-form-primary-dark': 'var(--orbe-primary-dark)',
  '--orbe-form-primary-soft': 'var(--orbe-primary-soft)',
  '--orbe-form-background': 'var(--orbe-bg)',
  '--orbe-form-surface': 'var(--orbe-surface)',
  '--orbe-form-input': 'var(--orbe-input-surface)',
  '--orbe-form-primary-button-text': 'var(--orbe-primary-button-text)',
  '--orbe-form-text': 'var(--orbe-text)',
  '--orbe-form-muted': 'var(--orbe-muted)',
  '--orbe-form-border': 'var(--orbe-border)',
  '--orbe-form-danger': 'var(--orbe-danger)',
  '--orbe-form-danger-soft': 'var(--orbe-danger-soft)',
  '--orbe-form-focus': 'var(--orbe-focus)',
  '--orbe-form-space-lg': `${orbe.space.lg}px`,
  '--orbe-form-space-xl': `${orbe.space.xl}px`,
  '--orbe-form-radius-control': `${orbe.radius.control}px`,
  '--orbe-form-radius-card': `${orbe.radius.card}px`,
} as CSSProperties

function useCloseGuard({ open, dirty = false, submitting = false, onClose }: Pick<FormContainerProps, 'open' | 'dirty' | 'submitting' | 'onClose'>) {
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!open || submitting) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (dirty) setConfirming(true)
      else onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dirty, onClose, open, submitting])

  function requestClose() {
    if (submitting) return
    if (dirty) setConfirming(true)
    else onClose()
  }

  return { confirming, setConfirming, requestClose }
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return mobile
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [locked])
}

function DialogActions({ onCancel, onConfirm, confirmLabel = 'Confirmar', danger = false }: { onCancel: () => void; onConfirm: () => void; confirmLabel?: string; danger?: boolean }) {
  return <div className="orbe-form-actions orbe-dialog-actions"><button type="button" className="orbe-button orbe-button-secondary" onClick={onCancel}>Cancelar</button><button type="button" className={`orbe-button ${danger ? 'orbe-button-danger' : 'orbe-button-primary'}`} onClick={onConfirm}>{confirmLabel}</button></div>
}

function CloseGuard({ confirming, setConfirming, onClose }: { confirming: boolean; setConfirming: (value: boolean) => void; onClose: () => void }) {
  if (!confirming) return null
  return createPortal(<div className="orbe-confirm-backdrop" role="presentation" style={formTokens}><div className="orbe-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="orbe-confirm-title"><h2 id="orbe-confirm-title">Tem alterações por guardar</h2><p>Se sair agora, as alterações não serão guardadas.</p><DialogActions onCancel={() => setConfirming(false)} onConfirm={onClose} confirmLabel="Sair sem guardar" danger /></div></div>, document.body)
}

export function FormModal({ open, title, description, children, onClose, dirty, submitting, fullScreen }: FormContainerProps) {
  const guard = useCloseGuard({ open, dirty, submitting, onClose })
  if (!open) return null
  return createPortal(<div className={`orbe-form-backdrop ${fullScreen ? 'orbe-form-fullscreen' : ''}`} role="presentation" style={formTokens} onMouseDown={(event) => { if (event.target === event.currentTarget) guard.requestClose() }}><section className="orbe-form-container orbe-form-modal" role="dialog" aria-modal="true" aria-labelledby="orbe-form-title"><FormHeader title={title} description={description} onClose={guard.requestClose} /><div className="orbe-form-scroll">{children}</div><CloseGuard {...guard} onClose={onClose} /></section></div>, document.body)
}

export function FormSheet(props: FormContainerProps) {
  const guard = useCloseGuard(props)
  if (!props.open) return null
  return createPortal(<div className="orbe-form-backdrop" role="presentation" style={formTokens} onMouseDown={(event) => { if (event.target === event.currentTarget) guard.requestClose() }}><section className="orbe-form-container orbe-form-sheet" role="dialog" aria-modal="true" aria-labelledby="orbe-form-title"><div className="orbe-sheet-handle" aria-hidden="true" /><FormHeader title={props.title} description={props.description} onClose={guard.requestClose} /><div className="orbe-form-scroll">{props.children}</div><CloseGuard {...guard} onClose={props.onClose} /></section></div>, document.body)
}

export function FullScreenForm(props: FormContainerProps) {
  return <FormModal {...props} fullScreen />
}

export function ResponsiveFormContainer(props: FormContainerProps) {
  const mobile = useIsMobile()
  useBodyScrollLock(props.open)
  if (!props.open) return null
  if (props.fullScreen) return <FullScreenForm {...props} />
  return mobile ? <FormSheet {...props} /> : <FormModal {...props} />
}

export function MultiStepForm({ open, title, description, steps, onClose, onComplete, dirty, submitting = false, initialStep = 0 }: { open: boolean; title: string; description?: string; steps: Array<{ title: string; content: ReactNode }>; onClose: () => void; onComplete: () => void; dirty?: boolean; submitting?: boolean; initialStep?: number }) {
  const [step, setStep] = useState(initialStep)
  const mobile = useIsMobile()
  const guard = useCloseGuard({ open, dirty, submitting, onClose })
  useBodyScrollLock(open)
  if (!open || !steps.length) return null
  const current = Math.min(Math.max(step, 0), steps.length - 1)
  const last = current === steps.length - 1
  const content = <><div className="orbe-step-meta"><span>Etapa {current + 1} de {steps.length}</span><div className="orbe-step-progress" aria-label={`Etapa ${current + 1} de ${steps.length}`}>{steps.map((item, index) => <span key={item.title} className={index <= current ? 'is-active' : ''} />)}</div><h3>{steps[current].title}</h3></div><div className="orbe-form-step-content">{steps[current].content}</div><footer className="orbe-form-actions"><button type="button" className="orbe-button orbe-button-secondary" onClick={() => current > 0 ? setStep(current - 1) : guard.requestClose()} disabled={submitting}>{current > 0 ? 'Voltar' : 'Cancelar'}</button><button type="button" className="orbe-button orbe-button-primary" onClick={() => last ? onComplete() : setStep(current + 1)} disabled={submitting}>{last ? 'Concluir' : 'Continuar'}</button></footer></>
  const container = <section className="orbe-form-container orbe-form-fullscreen-container" role="dialog" aria-modal="true" aria-labelledby="orbe-form-title"><FormHeader title={title} description={description} onClose={guard.requestClose} /><div className="orbe-form-scroll">{content}</div><CloseGuard {...guard} onClose={onClose} /></section>
  return createPortal(<div className={`orbe-form-backdrop orbe-form-fullscreen ${mobile ? 'orbe-form-fullscreen-mobile' : ''}`} role="presentation" style={formTokens}>{container}</div>, document.body)
}

function FormHeader({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  return <header className="orbe-form-header"><div><h2 id="orbe-form-title">{title}</h2>{description ? <p>{description}</p> : null}</div><button type="button" className="orbe-icon-close" aria-label="Fechar" onClick={onClose}>×</button></header>
}

export function FormField({ label, name, error, required, children }: { label: string; name: string; error?: string; required?: boolean; children: ReactNode }) {
  return <div className={`orbe-field ${error ? 'has-error' : ''}`}><label htmlFor={name}>{label}{required ? <span aria-hidden="true"> *</span> : null}</label>{children}{error ? <p className="orbe-field-error" role="alert">{error}</p> : null}</div>
}

export function TextInput({ id, value, onChange, placeholder, maxLength, disabled }: { id: string; value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number; disabled?: boolean }) {
  return <input id={id} name={id} className="orbe-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} disabled={disabled} />
}

export function Textarea({ id, value, onChange, maxLength, disabled }: { id: string; value: string; onChange: (value: string) => void; maxLength?: number; disabled?: boolean }) {
  return <textarea id={id} name={id} className="orbe-input orbe-textarea" value={value} onChange={(event) => onChange(event.target.value)} maxLength={maxLength} disabled={disabled} />
}

export function MoneyInput({ id, value, onChange, disabled }: { id: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const { symbol } = useCurrency()
  return <div className="orbe-money-input"><span aria-hidden="true">{symbol}</span><input id={id} name={id} className="orbe-input orbe-money-input-control" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => onChange(normalizeMoney(value))} placeholder="0,00" disabled={disabled} /></div>
}

function dateFromOffset(offset: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

export function DateInput({ id, value, onChange, disabled }: { id: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const shortcuts = [{ label: 'Hoje', value: dateFromOffset(0) }, { label: 'Ontem', value: dateFromOffset(-1) }]
  return <div className="orbe-date-control"><input id={id} name={id} className="orbe-input" type="date" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} /><div className="orbe-date-shortcuts" aria-label="Atalhos de data">{shortcuts.map((shortcut) => <button key={shortcut.label} type="button" className={`orbe-shortcut ${value === shortcut.value ? 'is-selected' : ''}`} onClick={() => onChange(shortcut.value)} disabled={disabled}>{shortcut.label}</button>)}<button type="button" className={`orbe-shortcut ${value !== shortcuts[0].value && value !== shortcuts[1].value ? 'is-selected' : ''}`} onClick={() => document.getElementById(id)?.focus()} disabled={disabled}>Escolher data</button></div></div>
}

function OptionList({ id, value, onChange, options, emptyMessage }: { id: string; value: string; onChange: (value: string) => void; options: SelectOption[]; emptyMessage: string }) {
  if (!options.length) return <div className="orbe-option-empty" role="status">{emptyMessage}</div>
  return <div className="orbe-option-list" role="listbox" aria-label={id}>{options.map((option) => <button key={option.value} type="button" role="option" aria-selected={value === option.value} className={`orbe-option ${value === option.value ? 'is-selected' : ''}`} onClick={() => onChange(option.value)} disabled={option.disabled}><span className="orbe-option-icon">{option.icon ? <OrbeIcon name={option.icon} size={17} color="currentColor" /> : <span aria-hidden="true">•</span>}</span><span className="orbe-option-copy"><strong>{option.label}</strong>{option.secondary ? <small>{option.secondary}</small> : null}</span>{value === option.value ? <span className="orbe-option-check" aria-hidden="true">✓</span> : null}</button>)}</div>
}

export function CategoryList({ id = 'category', value, onChange, options, emptyMessage = 'Não existem categorias disponíveis.' }: { id?: string; value: string; onChange: (value: string) => void; options: SelectOption[]; emptyMessage?: string }) {
  return <OptionList id={id} value={value} onChange={onChange} options={options} emptyMessage={emptyMessage} />
}

export function AccountList({ id = 'account', value, onChange, options, emptyMessage = 'Não existem contas disponíveis.' }: { id?: string; value: string; onChange: (value: string) => void; options: SelectOption[]; emptyMessage?: string }) {
  return <OptionList id={id} value={value} onChange={onChange} options={options} emptyMessage={emptyMessage} />
}

export function SelectInput({ id, value, onChange, options, placeholder, disabled }: { id: string; value: string; onChange: (value: string) => void; options: SelectOption[]; placeholder: string; disabled?: boolean }) {
  return <select id={id} name={id} className="orbe-input orbe-select-input" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled || options.length === 0}>
    <option value="" disabled>{placeholder}</option>
    {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.secondary ? `${option.label} · ${option.secondary}` : option.label}</option>)}
  </select>
}

export function FormErrorSummary({ errors }: { errors: FieldErrors }) {
  const messages = Object.values(errors)
  if (!messages.length) return null
  return <div className="orbe-error-summary" role="alert"><strong>Verifica os campos do formulário.</strong><ul>{messages.map((message) => <li key={message}>{message}</li>)}</ul></div>
}

export function FormActions({ onCancel, loading = false, submitLabel = 'Guardar' }: { onCancel: () => void; loading?: boolean; submitLabel?: string }) {
  return <footer className="orbe-form-actions"><button type="button" className="orbe-button orbe-button-secondary" onClick={onCancel} disabled={loading}>Cancelar</button><button type="submit" className="orbe-button orbe-button-primary" disabled={loading}>{loading ? 'A guardar…' : submitLabel}</button></footer>
}

export function FormLayout({ children, onSubmit }: { children: ReactNode; onSubmit: (event: FormEvent) => void }) {
  return <form onSubmit={onSubmit} noValidate>{children}</form>
}

export function LoadingState({ label = 'A carregar…' }: { label?: string }) {
  return <div className="orbe-state" role="status"><span className="orbe-spinner" aria-hidden="true" />{label}</div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="orbe-state orbe-state-error" role="alert"><strong>Não foi possível carregar.</strong><span>{message}</span>{onRetry ? <button type="button" className="orbe-button orbe-button-secondary" onClick={onRetry}>Tentar novamente</button> : null}</div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="orbe-state"><strong>{title}</strong><span>{description}</span>{action}</div>
}

export function ConfirmDialog({ open, title, description, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }: { open: boolean; title: string; description: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; danger?: boolean }) {
  useBodyScrollLock(open)
  const mobile = useIsMobile()
  if (!open) return null
  return createPortal(<div className={`orbe-confirm-backdrop ${mobile ? 'orbe-confirm-mobile' : ''}`} role="presentation" style={formTokens} onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}><div className="orbe-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="orbe-confirm-title"><h2 id="orbe-confirm-title">{title}</h2><p>{description}</p><DialogActions onCancel={onCancel} onConfirm={onConfirm} confirmLabel={confirmLabel} danger={danger} /></div></div>, document.body)
}

export function Toast({ message, type = 'info' }: { message: string; type?: 'info' | 'error' }) {
  return <div className={`orbe-form-toast ${type}`} role="status" aria-live="polite" style={formTokens}>{message}</div>
}

function today() { return dateFromOffset(0) }
function normalizeMoney(value: string) {
  const clean = value.trim().replace(/[€$£]/g, '').replace(/CHF/g, '').replace(/\s/g, '')
  if (!clean || /^-/.test(clean) || /[^\d.,]/.test(clean)) return ''
  if (/^\d{1,3}\.\d{3},\d{1,4}$/.test(clean)) return clean.replace(/\./g, '').replace(',', '.')
  if (/^\d{1,3},\d{3}\.\d{1,4}$/.test(clean)) return clean.replace(/,/g, '')
  if (/^\d+,\d{1,4}$/.test(clean)) return clean.replace(',', '.')
  if (/^\d+\.\d{1,4}$/.test(clean)) return clean
  if (/^\d+$/.test(clean)) return `${clean}.00`
  return ''
}

function validMoney(value: string) {
  const normalized = normalizeMoney(value)
  if (!normalized) return false
  const [whole, fraction] = normalized.split('.')
  return !/^0+$/.test(whole) || !/^0+$/.test(fraction ?? '')
}

export function MovementForm({
  kind,
  accounts: accountRecords,
  categories: categoryRecords,
  onClose,
  onSuccess,
}: {
  kind: FormKind
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onSuccess: (message: string) => void
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [account, setAccount] = useState('')
  const [date, setDate] = useState(today)
  const [entryMode, setEntryMode] = useState<'single' | 'recurrence'>('single')
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY')
  const [endAt, setEndAt] = useState('')
  const [destination, setDestination] = useState('')
  const [operationState, setOperationState] = useState<'REALIZED' | 'PENDING'>('REALIZED')
  const [outState, setOutState] = useState<'REALIZED' | 'PENDING'>('REALIZED')
  const [inState, setInState] = useState<'REALIZED' | 'PENDING'>('REALIZED')
  const [outDate, setOutDate] = useState(today)
  const [inDate, setInDate] = useState(today)
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false)
  const [transferDetailsOpen, setTransferDetailsOpen] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const idempotencyKey = useRef(`orbe-movement-${window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`)
  const isTransfer = kind === 'transfer'
  const isRecurring = !isTransfer && entryMode === 'recurrence'
  const title = kind === 'expense' ? 'Novo gasto' : kind === 'income' ? 'Novo rendimento' : 'Nova transferência'
  const nature = kind === 'income' ? 'INCOME' : 'EXPENSE'
  const accounts: SelectOption[] = useMemo(
    () => accountRecords.filter((item) => item.status === 'ACTIVE').map((item) => ({
      value: String(item.id),
      label: item.name,
      secondary: ({ BANK: 'Conta bancária', CASH: 'Dinheiro', WALLET: 'Carteira' } as Record<string, string>)[item.account_type] ?? item.account_type,
    })),
    [accountRecords],
  )
  const categories: SelectOption[] = useMemo(
    () => categoryRecords.filter((item) => item.status === 'ACTIVE' && item.nature === nature).map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
    [categoryRecords, nature],
  )
  const dirty = Boolean(description || amount || category || account || destination || endAt
    || entryMode !== 'single' || frequency !== 'MONTHLY'
    || operationState !== 'REALIZED' || outState !== 'REALIZED' || inState !== 'REALIZED'
    || outDate !== today() || inDate !== today() || date !== today())

  function toggleRecurrence(enabled: boolean) {
    setEntryMode(enabled ? 'recurrence' : 'single')
    if (enabled) {
      setAccount('')
      setOperationState('REALIZED')
      setMoreOptionsOpen(true)
    } else {
      setFrequency('MONTHLY')
      setEndAt('')
    }
  }

  function togglePending(enabled: boolean) {
    setOperationState(enabled ? 'PENDING' : 'REALIZED')
    setAccount('')
  }

  function validate() {
    const next: FieldErrors = {}
    if (isTransfer) {
      if (!account) next.account = 'Seleciona uma conta de origem.'
      if (!destination) next.destination = 'Seleciona uma conta de destino.'
      if (account && destination && account === destination) next.destination = 'A conta de origem e a conta de destino devem ser diferentes.'
      if (!outDate) next.outDate = 'Introduz uma data válida para a saída.'
      if (!inDate) next.inDate = 'Introduz uma data válida para a entrada.'
    } else {
      if (!description.trim()) next.description = 'Introduz uma descrição.'
      if (!category) next.category = 'Seleciona uma categoria.'
      if (isRecurring) {
        if (!date) next.date = 'Introduz a data da primeira ocorrência.'
        if (endAt && date && endAt < date) next.endAt = 'A data de fim não pode ser anterior à primeira ocorrência.'
      } else {
        if (operationState === 'REALIZED' && !account) next.account = 'Seleciona uma conta para o movimento realizado.'
        if (!date) next.date = 'Introduz uma data válida.'
      }
    }
    if (!validMoney(amount)) next.amount = 'O valor deve ser superior a zero.'
    setErrors(next)
    if (next.endAt) setMoreOptionsOpen(true)
    if (isTransfer && (next.outDate || next.inDate)) setTransferDetailsOpen(true)
    return Object.keys(next).length === 0
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting || !validate()) return
    setSubmitting(true)
    setErrors({})
    try {
      const normalizedAmount = normalizeMoney(amount)
      if (isRecurring) {
        await createRecurrence({
          nature,
          amount: normalizedAmount,
          category_id: Number(category),
          description: description.trim(),
          frequency,
          first_occurrence_at: date,
          end_at: endAt || undefined,
          idempotency_key: idempotencyKey.current,
        })
        onSuccess(kind === 'income' ? 'Programação de rendimento criada.' : 'Programação de gasto criada.')
      } else if (isTransfer) {
        await createTransfer({
          amount: normalizedAmount,
          description: description.trim() || undefined,
          idempotency_key: idempotencyKey.current,
          legs: {
            out: {
              account_id: Number(account),
              state: outState,
              ...(outState === 'REALIZED' ? { effective_at: outDate } : { planned_at: outDate }),
            },
            in: {
              account_id: Number(destination),
              state: inState,
              ...(inState === 'REALIZED' ? { effective_at: inDate } : { planned_at: inDate }),
            },
          },
        })
        onSuccess('Transferência registada com sucesso.')
      } else {
        const input = {
          amount: normalizedAmount,
          category_id: Number(category),
          description: description.trim(),
          state: operationState,
          ...(operationState === 'REALIZED' ? { account_id: Number(account), effective_at: date } : { planned_at: date }),
          idempotency_key: idempotencyKey.current,
        }
        if (kind === 'income') await createIncome(input)
        else await createExpense(input)
        onSuccess(operationState === 'PENDING'
          ? kind === 'income' ? 'Rendimento pendente criado.' : 'Gasto pendente criado.'
          : kind === 'income' ? 'Rendimento registado com sucesso.' : 'Gasto registado com sucesso.')
      }
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
        const fieldMap: Record<string, string> = {
          amount: 'amount',
          category_id: 'category',
          account_id: 'account',
          'legs.out.account_id': 'account',
          'legs.in.account_id': 'destination',
          'legs.out.effective_at': 'outDate',
          'legs.out.planned_at: 'outDate',
          'legs.in.effective_at': 'inDate',
          'legs.in.planned_at': 'inDate',
          effective_at: 'date',
          planned_at: 'date',
          first_occurrence_at: 'date',
          end_at: 'endAt',
          financial: 'form',
        }
        const next: FieldErrors = {}
        Object.entries(error.errors).forEach(([key, messages]) => {
          const field = fieldMap[key] ?? 'form'
          next[field] = messages[0] ?? error.message
        })
        setErrors(next)
        if (next.endAt) setMoreOptionsOpen(true)
        if (isTransfer && (next.outDate || next.inDate)) setTransferDetailsOpen(true)
      } else {
        setErrors({ form: error instanceof Error ? error.message : 'Não foi possível guardar o movimento. Tenta novamente.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const legDateLabel = (state: 'REALIZED' | 'PENDING', direction: 'out' | 'in') =>
    `Data ${state === 'REALIZED' ? 'efetiva' : 'prevista'} da ${direction === 'out' ? 'saída' : 'entrada'}`
  const transferDetailsSummary = outDate === today() && inDate === today() && outState === 'REALIZED' && inState === 'REALIZED'
    ? 'Hoje · ambas realizadas'
    : 'Datas ou estados personalizados'

  return <ResponsiveFormContainer open title={title} description={isTransfer ? 'Regista uma transferência entre contas.' : 'Preenche os dados essenciais.'} onClose={onClose} dirty={dirty} submitting={submitting}>
    <form className="orbe-movement-form" onSubmit={submit} noValidate>
      <FormErrorSummary errors={errors} />
      {isTransfer ? <>
        <FormField label="Valor" name="amount" required error={errors.amount}>
          <MoneyInput id="amount" value={amount} onChange={setAmount} disabled={submitting} />
        </FormField>
        <FormField label="Conta de origem" name="account" required error={errors.account}>
          <SelectInput id="account" value={account} onChange={setAccount} options={accounts} placeholder="Selecionar conta de origem" disabled={submitting} />
        </FormField>
        <div className="orbe-transfer-direction" aria-hidden="true"><span />↓<span /></div>
        <FormField label="Conta de destino" name="destination" required error={errors.destination}>
          <SelectInput id="destination" value={destination} onChange={setDestination} options={accounts.filter((item) => item.value !== account)} placeholder="Selecionar conta de destino" disabled={submitting || !account} />
        </FormField>
        <OrbeDisclosure title="Mais detalhes" description={transferDetailsSummary} open={transferDetailsOpen} onOpenChange={setTransferDetailsOpen}>
          <OrbeFormToggle id="outStatePending" label="Marcar saída como pendente" description="A saída ainda não foi realizada." checked={outState === 'PENDING'} onChange={(checked) => setOutState(checked ? 'PENDING' : 'REALIZED')} disabled={submitting} />
          <FormField label={legDateLabel(outState, 'out')} name="outDate" required error={errors.outDate}>
            <DateInput id="outDate" value={outDate} onChange={setOutDate} disabled={submitting} />
          </FormField>
          <OrbeFormToggle id="inStatePending" label="Marcar entrada como pendente" description="A entrada ainda não foi realizada." checked={inState === 'PENDING'} onChange={(checked) => setInState(checked ? 'PENDING' : 'REALIZED')} disabled={submitting} />
          <FormField label={legDateLabel(inState, 'in')} name="inDate" required error={errors.inDate}>
            <DateInput id="inDate" value={inDate} onChange={setInDate} disabled={submitting} />
          </FormField>
          <FormField label="Descrição (opcional)" name="description" error={errors.description}>
            <Textarea id="description" value={description} onChange={setDescription} maxLength={500} disabled={submitting} />
          </FormField>
        </OrbeDisclosure>
      </> : <>
        <FormField label="Descrição" name="description" required error={errors.description}>
          <TextInput id="description" value={description} onChange={setDescription} maxLength={500} placeholder={kind === 'income' ? 'Ex.: Salário' : 'Ex.: Supermercado'} disabled={submitting} />
        </FormField>
        <FormField label="Valor" name="amount" required error={errors.amount}>
          <MoneyInput id="amount" value={amount} onChange={setAmount} disabled={submitting} />
        </FormField>
        <FormField label="Categoria" name="category" required error={errors.category}>
          <SelectInput id="category" value={category} onChange={setCategory} options={categories} placeholder="Selecionar categoria" disabled={submitting} />
        </FormField>
        {!isRecurring && operationState === 'REALIZED' ? <FormField label="Conta" name="account" required error={errors.account}>
          <SelectInput id="account" value={account} onChange={setAccount} options={accounts} placeholder="Selecionar conta" disabled={submitting} />
        </FormField> : null}
        <FormField label={isRecurring ? 'Primeira ocorrência' : operationState === 'REALIZED' ? 'Data efetiva' : 'Data prevista'} name="date" required error={errors.date}>
          <DateInput id="date" value={date} onChange={setDate} disabled={submitting} />
        </FormField>
        <OrbeDisclosure title="Mais opções" description={isRecurring ? 'Programação recorrente ativa' : 'Recorrência e estado'} open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
          <OrbeFormToggle id="entryModeRecurrence" label="Programar recorrência" description="Criar esta operação com frequência definida." checked={isRecurring} onChange={toggleRecurrence} disabled={submitting} />
          {isRecurring ? <>
            <FormField label="Periodicidade" name="frequency" required>
              <SelectInput id="frequency" value={frequency} onChange={(value) => setFrequency(value as 'DAILY' | 'WEEKLY' | 'MONTHLY')} options={[{ value: 'DAILY', label: 'Diária' }, { value: 'WEEKLY', label: 'Semanal' }, { value: 'MONTHLY', label: 'Mensal' }]} placeholder="Selecionar periodicidade" disabled={submitting} />
            </FormField>
            <FormField label="Data de fim (opcional)" name="endAt" error={errors.endAt}>
              <DateInput id="endAt" value={endAt} onChange={setEndAt} disabled={submitting} />
            </FormField>
          </> : <OrbeFormToggle id="operationStatePending" label="Marcar como pendente" description="Ainda não foi realizado; não exige conta." checked={operationState === 'PENDING'} onChange={togglePending} disabled={submitting} />}
        </OrbeDisclosure>
      </>}
      <FormActions onCancel={onClose} loading={submitting} submitLabel={isRecurring ? 'Criar programação' : isTransfer ? 'Guardar transferência' : kind === 'income' ? 'Guardar rendimento' : 'Guardar gasto'} />
    </form>
  </ResponsiveFormContainer>
}
