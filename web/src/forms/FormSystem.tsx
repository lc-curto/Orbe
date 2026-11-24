import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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

function CloseGuard({ confirming, setConfirming, onClose }: { confirming: boolean; setConfirming: (value: boolean) => void; onClose: () => void }) {
  if (!confirming) return null
  return <div className="orbe-confirm-backdrop" role="presentation"><div className="orbe-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="orbe-confirm-title"><h2 id="orbe-confirm-title">Tem alterações por guardar</h2><p>Pretende sair sem guardar?</p><div className="orbe-form-actions"><button type="button" className="orbe-button orbe-button-secondary" onClick={() => setConfirming(false)}>Continuar a editar</button><button type="button" className="orbe-button orbe-button-danger" onClick={onClose}>Sair sem guardar</button></div></div></div>
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

export function FormModal({ open, title, description, children, onClose, dirty, submitting, fullScreen }: FormContainerProps) {
  const guard = useCloseGuard({ open, dirty, submitting, onClose })
  if (!open) return null
  return createPortal(<div className={`orbe-form-backdrop ${fullScreen ? 'orbe-form-fullscreen' : ''}`} role="presentation"><section className="orbe-form-container orbe-form-modal" role="dialog" aria-modal="true" aria-labelledby="orbe-form-title" onMouseDown={(event) => { if (event.target === event.currentTarget) guard.requestClose() }}><FormHeader title={title} description={description} onClose={guard.requestClose} /><div className="orbe-form-scroll">{children}</div><CloseGuard {...guard} onClose={onClose} /></section></div>, document.body)
}

export function FormSheet(props: FormContainerProps) {
  const guard = useCloseGuard(props)
  if (!props.open) return null
  return createPortal(<div className="orbe-form-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) guard.requestClose() }}><section className="orbe-form-container orbe-form-sheet" role="dialog" aria-modal="true" aria-labelledby="orbe-form-title"><FormHeader title={props.title} description={props.description} onClose={guard.requestClose} /><div className="orbe-form-scroll">{props.children}</div><CloseGuard {...guard} onClose={props.onClose} /></section></div>, document.body)
}

export function FullScreenForm(props: FormContainerProps) {
  return <FormModal {...props} fullScreen />
}

export function ResponsiveFormContainer(props: FormContainerProps) {
  const mobile = useIsMobile()
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return mobile ? <FormSheet {...props} /> : <FormModal {...props} />
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
  return <div className="orbe-money-input"><span>€</span><input id={id} name={id} className="orbe-input" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => onChange(normalizeMoney(value))} placeholder="0,00" disabled={disabled} /></div>
}

export function DateInput({ id, value, onChange, disabled }: { id: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <input id={id} name={id} className="orbe-input" type="date" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
}

export function SelectInput({ id, value, onChange, options, placeholder, disabled }: { id: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; placeholder: string; disabled?: boolean }) {
  return <select id={id} name={id} className="orbe-input" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
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

export function ConfirmDialog({ open, title, description, onConfirm, onCancel }: { open: boolean; title: string; description: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return createPortal(<div className="orbe-confirm-backdrop" role="presentation"><div className="orbe-confirm-dialog" role="alertdialog" aria-modal="true"><h2>{title}</h2><p>{description}</p><div className="orbe-form-actions"><button type="button" className="orbe-button orbe-button-secondary" onClick={onCancel}>Cancelar</button><button type="button" className="orbe-button orbe-button-danger" onClick={onConfirm}>Confirmar</button></div></div></div>, document.body)
}

export function Toast({ message, type = 'info' }: { message: string; type?: 'info' | 'error' }) {
  return <div className={`orbe-form-toast ${type}`} role="status" aria-live="polite">{message}</div>
}

function today() { return new Date().toISOString().slice(0, 10) }
function normalizeMoney(value: string) {
  const clean = value.trim().replace(/€/g, '').replace(/\s/g, '')
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
  const title = kind === 'expense' ? 'Nova despesa' : kind === 'income' ? 'Nova receita' : 'Nova transferência'
  const categories = useMemo(() => kind === 'income' ? [{ value: 'salary', label: 'Salário' }, { value: 'other-income', label: 'Outra receita' }] : [{ value: 'home', label: 'Casa' }, { value: 'food', label: 'Alimentação' }, { value: 'other-expense', label: 'Outra despesa' }], [kind])
  const accounts = [{ value: 'main', label: 'Conta principal' }, { value: 'savings', label: 'Poupança' }]

  function validate() {
    const next: FieldErrors = {}
    if (isTransfer) {
      if (!account) next.account = 'Seleciona uma conta de origem.'
      if (!destination) next.destination = 'Seleciona uma conta de destino.'
      if (account && destination && account === destination) next.destination = 'Não podes transferir dinheiro para a mesma conta de origem.'
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

  return <ResponsiveFormContainer open title={title} description={isTransfer ? 'Regista uma transferência entre contas.' : 'Preenche os dados da operação.'} onClose={onClose} dirty={dirty} submitting={submitting}><form onSubmit={submit} noValidate><FormErrorSummary errors={errors} />{isTransfer ? <><FormField label="Conta de origem" name="account" required error={errors.account}><SelectInput id="account" value={account} onChange={setAccount} options={accounts} placeholder="Seleciona a conta de origem" disabled={submitting} /></FormField><FormField label="Conta de destino" name="destination" required error={errors.destination}><SelectInput id="destination" value={destination} onChange={setDestination} options={accounts} placeholder="Seleciona a conta de destino" disabled={submitting} /></FormField></> : <><FormField label="Descrição" name="description" required error={errors.description}><TextInput id="description" value={description} onChange={setDescription} maxLength={191} placeholder={kind === 'income' ? 'Ex.: Salário' : 'Ex.: Supermercado'} disabled={submitting} /></FormField><FormField label="Categoria" name="category" required error={errors.category}><SelectInput id="category" value={category} onChange={setCategory} options={categories} placeholder="Seleciona uma categoria" disabled={submitting} /></FormField><FormField label="Conta" name="account" required error={errors.account}><SelectInput id="account" value={account} onChange={setAccount} options={accounts} placeholder="Seleciona uma conta" disabled={submitting} /></FormField></>}<FormField label="Valor" name="amount" required error={errors.amount}><MoneyInput id="amount" value={amount} onChange={setAmount} disabled={submitting} /></FormField><FormField label="Data" name="date" required error={errors.date}><DateInput id="date" value={date} onChange={setDate} disabled={submitting} /></FormField>{!isTransfer ? null : <FormField label="Descrição (opcional)" name="description" error={errors.description}><Textarea id="description" value={description} onChange={setDescription} maxLength={191} disabled={submitting} /></FormField>}<FormActions onCancel={onClose} loading={submitting} /></form></ResponsiveFormContainer>
}
