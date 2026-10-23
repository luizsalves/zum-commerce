import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createStorefront, type Storefront } from '../lib/storefront'
import { loadTenant, resolveTenantId } from '../lib/tenant'
import type { TenantConfig } from '../types'
import { Spinner } from '../components/atoms/Spinner'

type TenantState = { tenant: TenantConfig; storefront: Storefront }

const TenantContext = createContext<TenantState | null>(null)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    resolveTenantId()
      .then(loadTenant)
      .then((t) => {
        setTenant(t)
        document.title = t.name
        if (t.primaryColor) document.documentElement.style.setProperty('--brand', t.primaryColor)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  const value = useMemo(() => (tenant ? { tenant, storefront: createStorefront(tenant) } : null), [tenant])

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="font-display text-2xl">Loja indisponível</p>
          <p className="mt-2 text-sm text-stone-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!value) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner />
      </div>
    )
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant fora do TenantProvider')
  return ctx
}
