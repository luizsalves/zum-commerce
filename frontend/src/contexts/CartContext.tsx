import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { safeStorage } from '../lib/safeStorage'
import type { Cart } from '../lib/storefront'
import { useTenant } from './TenantContext'

type CartState = {
  cart: Cart | null
  /** true depois de tentar recuperar o carrinho salvo */
  ready: boolean
  open: boolean
  busy: boolean
  error: string | null
  setOpen: (open: boolean) => void
  add: (variantId: string, quantity?: number) => Promise<void>
  update: (lineId: string, quantity: number) => Promise<void>
  remove: (lineId: string) => Promise<void>
  /** Vincula o cliente e devolve a URL do checkout da Shopify. */
  prepareCheckout: (buyer: { email: string; phone?: string | null }) => Promise<string>
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { tenant, storefront } = useTenant()
  const storageKey = `cart:${tenant.id}`
  const [cart, setCart] = useState<Cart | null>(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(
    (c: Cart | null) => {
      setCart(c)
      if (c) safeStorage.set(storageKey, c.id)
      else safeStorage.remove(storageKey)
    },
    [storageKey],
  )

  // Recupera o carrinho salvo (o carrinho some depois que o pedido é finalizado ou expira).
  useEffect(() => {
    const id = safeStorage.get(storageKey)
    if (!id) {
      setReady(true)
      return
    }
    storefront
      .getCart(id)
      .then((c) => save(c))
      .catch(() => save(null))
      .finally(() => setReady(true))
  }, [storefront, storageKey, save])

  const run = useCallback(async (fn: () => Promise<Cart>) => {
    setBusy(true)
    setError(null)
    try {
      const c = await fn()
      save(c)
      return c
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no carrinho.')
      throw e
    } finally {
      setBusy(false)
    }
  }, [save])

  const value: CartState = {
    cart,
    ready,
    open,
    busy,
    error,
    setOpen,
    add: async (variantId, quantity = 1) => {
      const lines = [{ merchandiseId: variantId, quantity }]
      await run(() => (cart ? storefront.addLines(cart.id, lines) : storefront.createCart(lines)))
      setOpen(true)
    },
    update: async (lineId, quantity) => {
      if (!cart) return
      await run(() =>
        quantity <= 0 ? storefront.removeLine(cart.id, lineId) : storefront.updateLine(cart.id, lineId, quantity),
      )
    },
    remove: async (lineId) => {
      if (!cart) return
      await run(() => storefront.removeLine(cart.id, lineId))
    },
    prepareCheckout: async (buyer) => {
      if (!cart || cart.totalQuantity === 0) throw new Error('Seu carrinho está vazio.')
      const updated = await run(() => storefront.setBuyer(cart.id, buyer))
      return updated.checkoutUrl
    },
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart fora do CartProvider')
  return ctx
}
