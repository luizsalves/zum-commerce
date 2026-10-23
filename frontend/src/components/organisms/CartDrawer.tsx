import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { brl } from '../../lib/format'
import { Alert } from '../atoms/Alert'
import { QuantityStepper } from '../molecules/QuantityStepper'

export function CartDrawer() {
  const { cart, open, setOpen, busy, error, update, remove } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const goCheckout = () => {
    setOpen(false)
    // Compra só com cadastro: sem login → entrar; a página /checkout confere o cadastro na loja.
    navigate(user ? '/checkout' : '/entrar?next=/checkout')
  }

  const lines = cart?.lines.nodes ?? []

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-stone-900/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-display text-xl">Seu carrinho</h2>
          <button onClick={() => setOpen(false)} className="text-sm text-stone-500 hover:text-stone-900">
            Fechar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="py-16 text-center text-sm text-stone-500">Seu carrinho está vazio.</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => {
                const img = line.merchandise.image ?? line.merchandise.product.featuredImage
                return (
                  <li key={line.id} className="flex gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      {img && <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-sm font-medium">{line.merchandise.product.title}</p>
                      {line.merchandise.title !== 'Default Title' && (
                        <p className="text-xs text-stone-500">{line.merchandise.title}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          min={0}
                          value={line.quantity}
                          disabled={busy}
                          onChange={(q) => update(line.id, q).catch(() => undefined)}
                        />
                        <span className="text-sm font-semibold">{brl(line.cost.totalAmount.amount)}</span>
                      </div>
                      <button
                        disabled={busy}
                        onClick={() => remove(line.id)}
                        className="mt-1 self-start text-xs text-stone-400 hover:text-red-600"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {error && <Alert className="mt-4">{error}</Alert>}
        </div>

        {lines.length > 0 && cart && (
          <div className="space-y-3 border-t border-stone-200 px-5 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal</span>
              <span className="font-semibold">{brl(cart.cost.subtotalAmount.amount)}</span>
            </div>
            <p className="text-xs text-stone-500">Frete calculado no checkout, a partir do seu CEP.</p>
            <button onClick={goCheckout} disabled={busy} className="btn-primary w-full py-3">
              Finalizar compra
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
