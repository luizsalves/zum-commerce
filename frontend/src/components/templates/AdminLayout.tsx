import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminContext } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import { safeStorage } from '../../lib/safeStorage'
import type { MeResponse } from '../../types'
import { CenterMessage } from '../molecules/CenterMessage'
import { AdminHeader } from '../organisms/AdminHeader'
import { LoginPanel } from '../organisms/LoginPanel'

const TENANT_KEY = 'admin:tenant'

/** Estrutura do painel: login, carga de permissões (/api/me), seleção de loja e menu. */
export function AdminLayout() {
  const { user, loading, signOut } = useAuth()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(safeStorage.get(TENANT_KEY))

  const reloadMe = useCallback(async () => {
    const data = await api<MeResponse>('/api/me')
    setMe(data)
    setTenantId((current) => (data.tenants.some((t) => t.id === current) ? current : (data.tenants[0]?.id ?? null)))
  }, [])

  useEffect(() => {
    if (!user) {
      setMe(null)
      return
    }
    reloadMe().catch((e: Error) => setError(e.message))
  }, [user, reloadMe])

  useEffect(() => {
    if (tenantId) safeStorage.set(TENANT_KEY, tenantId)
  }, [tenantId])

  if (loading) return null

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-50 px-4">
        <LoginPanel title="Painel da loja" subtitle="Entre com a conta que tem acesso ao painel." />
      </div>
    )
  }

  const signOutButton = (
    <button className="btn-ghost" onClick={() => signOut()}>
      Sair
    </button>
  )

  if (error) return <CenterMessage title="Erro ao abrir o painel" text={error} action={signOutButton} />
  if (!me) return <CenterMessage title="Carregando…" />

  if (me.tenants.length === 0 && !me.platformAdmin) {
    return (
      <CenterMessage
        title="Sem acesso"
        text={`A conta ${user.email} ainda não foi liberada em nenhuma loja. Peça acesso à equipe da Zum.`}
        action={signOutButton}
      />
    )
  }

  const current = me.tenants.find((t) => t.id === tenantId)

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminHeader
        me={me}
        email={user.email}
        tenantId={tenantId}
        onTenantChange={setTenantId}
        onSignOut={() => signOut()}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <AdminContext.Provider value={{ tenantId: current?.id ?? '', tenantName: current?.name ?? '', me, reloadMe }}>
          <Outlet />
        </AdminContext.Provider>
      </main>
    </div>
  )
}
