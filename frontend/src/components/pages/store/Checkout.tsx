import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useCart } from '../../../contexts/CartContext'
import { Spinner } from '../../atoms/Spinner'

/** Ponte para o checkout da Shopify: exige login + cadastro e vincula o cliente ao carrinho. */
export function Checkout() {
  const { user, loading, customer } = useAuth()
  const { prepareCheckout, ready } = useCart()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!customer || !ready || started.current) return
    started.current = true
    prepareCheckout({ email: customer.email, phone: customer.phone })
      .then((url) => window.location.assign(url))
      .catch((e: Error) => setError(e.message))
  }, [customer, ready, prepareCheckout])

  if (!loading && !user) return <Navigate to="/entrar?next=/checkout" replace />
  if (user && customer === null) return <Navigate to="/cadastro?next=/checkout" replace />

  return (
    <div className="grid place-items-center px-4 py-24 text-center">
      {error ? (
        <div>
          <p className="font-display text-2xl">Não foi possível abrir o pagamento</p>
          <p className="mt-2 text-sm text-stone-500">{error}</p>
          <Link to="/" className="btn-ghost mt-6">
            Voltar para a loja
          </Link>
        </div>
      ) : (
        <div>
          <Spinner className="mx-auto" />
          <p className="mt-4 text-sm text-stone-500">Levando você para o pagamento seguro…</p>
        </div>
      )}
    </div>
  )
}
