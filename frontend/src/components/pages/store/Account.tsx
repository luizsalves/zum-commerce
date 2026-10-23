import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

export function Account() {
  const { user, loading, customer, signOut } = useAuth()

  if (!loading && !user) return <Navigate to="/entrar" replace />
  if (user && customer === null) return <Navigate to="/cadastro?next=/minha-conta" replace />

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-3xl">Minha conta</h1>
      {customer ? (
        <div className="card mt-6 space-y-2 p-6 text-sm">
          <p>
            <span className="text-stone-500">Nome:</span> {customer.firstName} {customer.lastName}
          </p>
          <p>
            <span className="text-stone-500">E-mail:</span> {customer.email}
          </p>
          {customer.phone && (
            <p>
              <span className="text-stone-500">Celular:</span> {customer.phone}
            </p>
          )}
          <p className="pt-2 text-xs text-stone-500">
            Seus pedidos e o rastreio chegam no seu e-mail depois da compra.
          </p>
        </div>
      ) : (
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-stone-100" />
      )}
      <button onClick={() => signOut()} className="btn-ghost mt-6">
        Sair
      </button>
    </div>
  )
}
