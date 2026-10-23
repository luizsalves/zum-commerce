import type { ReactNode } from 'react'
import { useAdmin } from '../../contexts/AdminContext'

/** Mostra aviso quando a página do painel precisa de uma loja selecionada. */
export function RequireTenant({ children }: { children: ReactNode }) {
  const { tenantId } = useAdmin()
  if (!tenantId) {
    return <p className="text-sm text-stone-500">Cadastre ou selecione uma loja na aba Plataforma.</p>
  }
  return <>{children}</>
}
