import { createContext, useContext } from 'react'
import type { MeResponse } from '../types'

export type AdminState = {
  /** Loja selecionada no painel ('' quando nenhuma). */
  tenantId: string
  tenantName: string
  me: MeResponse
  reloadMe: () => Promise<void>
}

export const AdminContext = createContext<AdminState | null>(null)

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin fora do AdminLayout')
  return ctx
}
