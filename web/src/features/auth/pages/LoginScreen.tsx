import { useState, type FormEvent } from 'react'
import { H1, Paragraph, Text, YStack } from 'tamagui'
import { useAuth } from '../../../api/useAuth'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

export function LoginScreen() {
  const { login, register, requestPasswordReset, resetPassword, loading, error, clearError } = useAuth()
  const initialParams = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
  const hasResetLink = Boolean(initialParams.get('token'))
  const [mode, setMode] = useState<AuthMode>(hasResetLink ? 'reset' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(initialParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setFormError(null)
    setSuccess(null)
    clearError()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (mode === 'register' && !name.trim()) return setFormError('Introdu o teu nome.')
    if (!normalizedEmail) return setFormError('Introdu um email válido.')
    if ((mode === 'login' || mode === 'register' || mode === 'reset') && !password) return setFormError('Introdu a palavra-passe.')
    if ((mode === 'register' || mode === 'reset') && password !== passwordConfirmation) return setFormError('As palavras-passe não coincidem.')

    setFormError(null)
    setSuccess(null)
    clearError()
    try {
      if (mode === 'login') await login(normalizedEmail, password)
      if (mode === 'register') await register(name.trim(), normalizedEmail, password, passwordConfirmation)
      if (mode === 'forgot') setSuccess(await requestPasswordReset(normalizedEmail))
      if (mode === 'reset') {
        const token = new URLSearchParams(window.location.search).get('token') ?? ''
        setSuccess(await resetPassword(normalizedEmail, token, password, passwordConfirmation))
        setPassword('')
        setPasswordConfirmation('')
        setMode('login')
      }
    } catch {
      // A mensagem do provider é apresentada no formulário.
    }
  }

  const message = formError ?? error
  const title = mode === 'login' ? 'Iniciar sessão' : mode === 'register' ? 'Criar conta' : mode === 'forgot' ? 'Recuperar palavra-passe' : 'Definir nova palavra-passe'
  const description = mode === 'login' ? 'Entra na tua conta para consultar as tuas finanças.' : mode === 'register' ? 'Cria a tua conta para começar a organizar as tuas finanças.' : mode === 'forgot' ? 'Enviaremos instruções para o teu email, se existir uma conta associada.' : 'Escolhe uma palavra-passe nova para a tua conta.'

  return (
    <YStack className="auth-screen" backgroundColor="#f7f9fc" minHeight="100vh" padding={24} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <YStack className="auth-card" backgroundColor="#ffffff" borderWidth={1} borderColor="#e4e7ec" borderRadius={24} padding={32} width="100%" maxWidth={440} gap={24}>
        <YStack gap={8}><Text color="#175cd3" fontSize={28} fontWeight="800">Orbe</Text><H1 fontSize={28} letterSpacing={-0.6}>{title}</H1><Paragraph color="#667085" margin={0}>{description}</Paragraph></YStack>
        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === 'register' ? <><label className="auth-label" htmlFor="auth-name">Nome</label><input className="auth-input" id="auth-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="O teu nome" disabled={loading} autoFocus /></> : null}
          <label className="auth-label" htmlFor="auth-email">Email</label><input className="auth-input" id="auth-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.pt" disabled={loading} autoFocus={mode !== 'register'} />
          {mode === 'login' || mode === 'register' || mode === 'reset' ? <><label className="auth-label" htmlFor="auth-password">Palavra-passe</label><div className="auth-password-field"><input className="auth-input" id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Introduz a tua palavra-passe" disabled={loading} /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} disabled={loading}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></> : null}
          {mode === 'register' || mode === 'reset' ? <><label className="auth-label" htmlFor="auth-password-confirmation">Confirmar palavra-passe</label><input className="auth-input" id="auth-password-confirmation" name="password_confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Repete a palavra-passe" disabled={loading} /></> : null}
          {message ? <div className="auth-error" role="alert">{message}</div> : null}
          {success ? <div className="auth-success" role="status">{success}</div> : null}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'A processar…' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : mode === 'forgot' ? 'Enviar instruções' : 'Alterar palavra-passe'}</button>
        </form>
        <YStack gap={10} style={{ alignItems: 'center' }}>
          {mode === 'login' ? <><button className="auth-link" type="button" onClick={() => changeMode('forgot')}>Esqueci-me da palavra-passe</button><Text color="#667085" fontSize={13}>Ainda não tens conta? <button className="auth-link" type="button" onClick={() => changeMode('register')}>Criar conta</button></Text></> : <button className="auth-link" type="button" onClick={() => changeMode('login')}>Voltar a iniciar sessão</button>}
        </YStack>
      </YStack>
    </YStack>
  )
}
