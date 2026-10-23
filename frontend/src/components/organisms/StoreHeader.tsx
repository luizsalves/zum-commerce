import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useTenant } from '../../contexts/TenantContext'
import { SearchBar } from '../molecules/SearchBar'

/** Cabeçalho da vitrine: logo, busca, conta e carrinho. */
export function StoreHeader() {
  const { tenant } = useTenant()
  const { user } = useAuth()
  const { cart, setOpen } = useCart()

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} alt={tenant.name} className="h-9 w-auto" />
          ) : (
            <span className="font-display text-xl font-semibold text-brand">{tenant.name}</span>
          )}
        </Link>

        <SearchBar className="hidden flex-1 sm:block" />

        <nav className="ml-auto flex items-center gap-2">
          <Link to={user ? '/minha-conta' : '/entrar'} className="btn-ghost rounded-full px-3 py-2">
            {user ? 'Minha conta' : 'Entrar'}
          </Link>
          <button onClick={() => setOpen(true)} className="btn-primary relative rounded-full px-4 py-2">
            Carrinho
            {cart && cart.totalQuantity > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-semibold text-brand">
                {cart.totalQuantity}
              </span>
            )}
          </button>
        </nav>
      </div>
      <SearchBar className="px-4 pb-3 sm:hidden" />
    </header>
  )
}
