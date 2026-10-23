import { PRODUCT_STATUS } from '../../data/productStatus'
import type { ProductStatus } from '../../types'

export function StatusBadge({ status }: { status: ProductStatus }) {
  const info = PRODUCT_STATUS[status]
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${info?.className ?? 'bg-stone-100'}`}>
      {info?.label ?? status}
    </span>
  )
}
