import type { FeeSettings } from '../lib/fees'

export type FeeNumberField = 'creditPct' | 'credit12Pct' | 'pixPct' | 'boletoFixed'

/** Campos da tela de taxas. */
export const FEE_FIELDS: { key: FeeNumberField; label: string; hint: string; unit: '%' | 'R$' }[] = [
  { key: 'creditPct', label: 'Cartão de crédito à vista', hint: 'Taxa no prazo de recebimento que você usa', unit: '%' },
  { key: 'credit12Pct', label: 'Cartão em 12x sem juros', hint: 'Deixe 0 se não oferece parcelamento sem juros', unit: '%' },
  { key: 'pixPct', label: 'Pix', hint: '', unit: '%' },
  { key: 'boletoFixed', label: 'Boleto (valor fixo por boleto)', hint: 'Deixe 0 se não oferece boleto', unit: 'R$' },
]

/** Planos da Shopify e a taxa por venda quando a loja usa gateway externo (caso de todo lojista no Brasil). */
export const SHOPIFY_PLANS: { value: FeeSettings['shopifyPlan']; label: string }[] = [
  { value: 'basic', label: 'Basic: 2% por venda' },
  { value: 'grow', label: 'Grow: 1% por venda' },
  { value: 'advanced', label: 'Advanced: 0,6% por venda' },
  { value: 'plus', label: 'Plus: 0,2% por venda' },
]
