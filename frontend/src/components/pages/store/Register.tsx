import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useTenant } from '../../../contexts/TenantContext'
import { api } from '../../../lib/api'
import type { CustomerProfile } from '../../../types'
import { safeNext } from './Login'
import { Alert } from '../../atoms/Alert'

/** Completa o cadastro na loja: cria o cliente na Shopify vinculado à conta (Google, Facebook ou e-mail). */
export function Register() {
  const { tenant } = useTenant()
  const { user, loading, customer, refreshCustomer } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptsMarketing, setAcceptsMarketing] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const parts = (user?.displayName ?? '').trim().split(/\s+/)
    if (parts[0]) setFirstName(parts[0])
    if (parts.length > 1) setLastName(parts.slice(1).join(' '))
  }, [user])

  useEffect(() => {
    if (customer) navigate(next, { replace: true })
  }, [customer, next, navigate])

  if (!loading && !user) return <Navigate to={`/entrar?next=${encodeURIComponent(next)}`} replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api<CustomerProfile>('/api/store/customers/register', {
        tenantId: tenant.id,
        body: { firstName, lastName, phone, acceptsMarketing },
      })
      await refreshCustomer()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-4 py-12">
      <form onSubmit={onSubmit} className="card mx-auto w-full max-w-sm space-y-4 p-6">
        <div>
          <h1 className="font-display text-2xl">Complete seu cadastro</h1>
          <p className="mt-1 text-sm text-stone-500">{user?.email}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Nome</label>
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Sobrenome</label>
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Celular / WhatsApp</label>
          <input
            className="input"
            type="tel"
            inputMode="tel"
            placeholder="(35) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            className="mt-0.5 accent-brand"
            checked={acceptsMarketing}
            onChange={(e) => setAcceptsMarketing(e.target.checked)}
          />
          Quero receber novidades e promoções por e-mail
        </label>
        {error && <Alert>{error}</Alert>}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? 'Salvando…' : 'Concluir cadastro'}
        </button>
      </form>
    </div>
  )
}
