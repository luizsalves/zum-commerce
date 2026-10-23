import { useState, type FormEvent } from 'react'
import { friendlyAuthError, useAuth } from '../../contexts/AuthContext'
import { Alert } from '../atoms/Alert'

/** Login/criação de conta com Google, Facebook ou e-mail e senha. Usado na loja e no painel. */
export function LoginPanel({ title, subtitle }: { title: string; subtitle?: string }) {
  const { signInGoogle, signInFacebook, signInEmail, signUpEmail, resetPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const attempt = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      await fn()
    } catch (e) {
      setError(friendlyAuthError(e))
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    attempt(() => (mode === 'login' ? signInEmail(email, password) : signUpEmail(name, email, password)))
  }

  const onReset = () => {
    if (!email.trim()) {
      setError('Digite seu e-mail acima para receber o link de nova senha.')
      return
    }
    attempt(async () => {
      await resetPassword(email)
      setInfo('Enviamos um link para criar uma nova senha no seu e-mail.')
    })
  }

  return (
    <div className="card mx-auto w-full max-w-sm p-6">
      <h1 className="font-display text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}

      <div className="mt-6 space-y-2">
        <button disabled={busy} onClick={() => attempt(signInGoogle)} className="btn-ghost w-full">
          Continuar com Google
        </button>
        <button disabled={busy} onClick={() => attempt(signInFacebook)} className="btn-ghost w-full">
          Continuar com Facebook
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> ou com e-mail <span className="h-px flex-1 bg-stone-200" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === 'signup' && (
          <input className="input" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input
          className="input"
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Senha"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={busy} className="btn-primary w-full">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      {error && <Alert className="mt-3">{error}</Alert>}
      {info && <Alert tone="success" className="mt-3">{info}</Alert>}

      <div className="mt-4 flex justify-between text-sm">
        <button className="text-brand hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
        </button>
        {mode === 'login' && (
          <button className="text-stone-500 hover:underline" onClick={onReset}>
            Esqueci a senha
          </button>
        )}
      </div>
    </div>
  )
}
