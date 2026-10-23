import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginPanel } from '../../organisms/LoginPanel'
import { useAuth } from '../../../contexts/AuthContext'
import { useTenant } from '../../../contexts/TenantContext'

export function safeNext(next: string | null, fallback = '/minha-conta') {
  // Só aceita caminhos internos (evita redirecionar para outro site).
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback
}

export function Login() {
  const { tenant } = useTenant()
  const { user, customer } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const next = safeNext(params.get('next'))

  useEffect(() => {
    if (!user || customer === undefined) return
    navigate(customer ? next : `/cadastro?next=${encodeURIComponent(next)}`, { replace: true })
  }, [user, customer, next, navigate])

  return (
    <div className="px-4 py-12">
      <LoginPanel title={`Entrar na ${tenant.name}`} subtitle="Para comprar é preciso ter cadastro. Leva menos de um minuto." />
    </div>
  )
}
