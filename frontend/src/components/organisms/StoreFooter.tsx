import { useTenant } from '../../contexts/TenantContext'

export function StoreFooter() {
  const { tenant } = useTenant()
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
        <span>
          © {new Date().getFullYear()} {tenant.name}
        </span>
        <span>Pagamento seguro processado pela Shopify</span>
      </div>
    </footer>
  )
}
