import { NavLink } from 'react-router-dom'
import type { MeResponse } from '../../types'

type Props = {
  me: MeResponse
  email: string | null
  tenantId: string | null
  onTenantChange: (id: string) => void
  onSignOut: () => void
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`

/** Cabeçalho do painel: seletor de loja, menu e saída. */
export function AdminHeader({ me, email, tenantId, onTenantChange, onSignOut }: Props) {
  const hasTenant = me.tenants.some((t) => t.id === tenantId)

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="font-display text-lg font-semibold">Painel</span>
        {me.tenants.length > 0 && (
          <select
            className="input w-auto py-1.5"
            value={tenantId ?? ''}
            onChange={(e) => onTenantChange(e.target.value)}
            aria-label="Loja"
          >
            {me.tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <nav className="flex flex-wrap gap-1">
          {hasTenant && (
            <>
              <NavLink to="/admin" end className={linkClass}>
                Produtos
              </NavLink>
              <NavLink to="/admin/clientes" className={linkClass}>
                Clientes
              </NavLink>
              <NavLink to="/admin/taxas" className={linkClass}>
                Taxas
              </NavLink>
            </>
          )}
          {me.platformAdmin && (
            <NavLink to="/admin/plataforma" className={linkClass}>
              Plataforma
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm text-stone-500">
          {email && <span className="hidden sm:inline">{email}</span>}
          <button className="btn-ghost py-1.5" onClick={onSignOut}>
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
