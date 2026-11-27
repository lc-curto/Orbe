import { useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { OrbeIcon } from '../../../design-system/Icon'
import type { OrbeIconName } from '../../../design-system/Icon'
import { orbe } from '../../../design-system/tokens'
import { useCurrency } from '../../currency/useCurrency'
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
  '--orbe-form-primary': orbe.colors.primary,
  '--orbe-form-primary-dark': orbe.colors.primaryDark,
  '--orbe-form-primary-soft': orbe.colors.primarySoft,
  '--orbe-form-background': orbe.colors.background,
  '--orbe-form-surface': orbe.colors.surface,
  '--orbe-form-text': orbe.colors.text,
  '--orbe-form-muted': orbe.colors.textMuted,
  '--orbe-form-border': orbe.colors.border,
  '--orbe-form-danger': orbe.colors.danger,
  '--orbe-form-danger-soft': orbe.colors.dangerSoft,
  '--orbe-form-focus': orbe.colors.focus,
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
  return <div className={disabled ? 'orbe-select-disabled' : ''}><OptionList id={id} value={value} onChange={onChange} options={options.map((option) => ({ ...option, disabled: disabled || option.disabled }))} emptyMessage={placeholder} /></div>
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

export function MovementForm({ kind, onClose, onUnavailable }: { kind: FormKind; onClose: () => void; onUnavailable: (message: string) => void }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [account, setAccount] = useState('')
  const [date, setDate] = useState(today)
  const [destination, setDestination] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const dirty = Boolean(description || amount || category || account || destination)
  const isTransfer = kind === 'transfer'
  const title = kind === 'expense' ? 'Novo gasto' : kind === 'income' ? 'Novo rendimento' : 'Nova transferência'
  const categories: SelectOption[] = useMemo(() => [], [])
  const accounts: SelectOption[] = useMemo(() => [], [])

  function validate() {
    const next: FieldErrors = {}
    if (isTransfer) {
      if (!account) next.account = 'Seleciona uma conta de origem.'
      if (!destination) next.destination = 'Seleciona uma conta de destino.'
      if (account && destination && account === destination) next.destination = 'A conta de origem e a conta de destino devem ser diferentes.'
    } else {
      if (!description.trim()) next.description = 'Introduz uma descrição.'
      if (!category) next.category = 'Seleciona uma categoria.'
      if (!account) next.account = 'Seleciona uma conta.'
    }
    if (!validMoney(amount)) next.amount = 'O valor deve ser superior a zero.'
    if (!date) next.date = 'Introduz uma data válida.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    window.setTimeout(() => { setSubmitting(false); onUnavailable('A integração deste formulário aguarda um endpoint de API confirmado. Nenhuma operação foi registada.') }, 350)
  }

  return <ResponsiveFormContainer open title={title} description={isTransfer ? 'Regista uma transferência entre contas.' : 'Preenche os dados da operação.'} onClose={onClose} dirty={dirty} submitting={submitting}><form onSubmit={submit} noValidate><FormErrorSummary errors={errors} />{isTransfer ? <><FormField label="Conta de origem" name="account" required error={errors.account}><AccountList id="account" value={account} onChange={setAccount} options={accounts} emptyMessage="Não existem contas disponíveis para selecionar a origem." /></FormField><div className="orbe-transfer-direction" aria-hidden="true"><span />↓<span /></div><FormField label="Conta de destino" name="destination" required error={errors.destination}><AccountList id="destination" value={destination} onChange={setDestination} options={accounts} emptyMessage="Não existem contas disponíveis para selecionar o destino." /></FormField></> : <><FormField label="Descrição" name="description" required error={errors.description}><TextInput id="description" value={description} onChange={setDescription} maxLength={191} placeholder={kind === 'income' ? 'Ex.: Salário' : 'Ex.: Supermercado'} disabled={submitting} /></FormField><FormField label="Categoria" name="category" required error={errors.category}><CategoryList id="category" value={category} onChange={setCategory} options={categories} /></FormField><FormField label="Conta" name="account" required error={errors.account}><AccountList id="account" value={account} onChange={setAccount} options={accounts} /></FormField></>}<FormField label="Valor" name="amount" required error={errors.amount}><MoneyInput id="amount" value={amount} onChange={setAmount} disabled={submitting} /></FormField><FormField label="Data" name="date" required error={errors.date}><DateInput id="date" value={date} onChange={setDate} disabled={submitting} /></FormField>{isTransfer ? <FormField label="Descrição (opcional)" name="description" error={errors.description}><Textarea id="description" value={description} onChange={setDescription} maxLength={191} disabled={submitting} /></FormField> : null}<FormActions onCancel={onClose} loading={submitting} /></form></ResponsiveFormContainer>
}
