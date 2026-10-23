import { Outlet } from 'react-router-dom'
import { useTenant } from '../../contexts/TenantContext'
import { WhatsAppButton } from '../atoms/WhatsAppButton'
import { CartDrawer } from '../organisms/CartDrawer'
import { StoreFooter } from '../organisms/StoreFooter'
import { StoreHeader } from '../organisms/StoreHeader'

/** Estrutura da vitrine: cabeçalho, conteúdo da página, rodapé, carrinho lateral e WhatsApp. */
export function StoreLayout() {
  const { tenant } = useTenant()
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StoreFooter />
      <WhatsAppButton phone={tenant.whatsapp} />
      <CartDrawer />
    </div>
  )
}
