import type { ProductStatus } from '../types'

export const PRODUCT_STATUS: Record<ProductStatus, { label: string; option: string; className: string }> = {
  ACTIVE: { label: 'Ativo', option: 'Ativo (aparece na loja)', className: 'bg-emerald-50 text-emerald-700' },
  DRAFT: { label: 'Rascunho', option: 'Rascunho', className: 'bg-amber-50 text-amber-700' },
  ARCHIVED: { label: 'Arquivado', option: 'Arquivado', className: 'bg-stone-100 text-stone-500' },
}
