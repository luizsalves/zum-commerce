/**
 * Taxas de cada loja, em %. Ficam em tenants/{id}/private/fees.
 * O lojista copia os valores do painel do Mercado Pago (ou outro gateway) uma única vez.
 */
export type FeeSettings = {
  gateway: string
  shopifyPlan: 'basic' | 'grow' | 'advanced' | 'plus'
  shopifyPct: number
  creditPct: number // crédito à vista
  credit12Pct: number // crédito 12x sem juros (pior caso); 0 = não oferece
  pixPct: number
  boletoFixed: number // valor fixo por boleto (R$); 0 = não oferece
}

export const SHOPIFY_PLAN_PCT: Record<FeeSettings['shopifyPlan'], number> = {
  basic: 2,
  grow: 1,
  advanced: 0.6,
  plus: 0.2,
}

export const DEFAULT_FEES: FeeSettings = {
  gateway: 'Mercado Pago',
  shopifyPlan: 'basic',
  shopifyPct: 2,
  creditPct: 0,
  credit12Pct: 0,
  pixPct: 0,
  boletoFixed: 0,
}

const round = (v: number) => Math.round(v * 100) / 100

export type FeeRow = {
  key: string
  label: string
  shopifyFee: number
  gatewayFee: number
  net: number
  profit: number
  margin: number
}

/** Quanto sobra de cada venda, por forma de pagamento. */
export function simulate(price: number, cost: number, fees: FeeSettings): FeeRow[] {
  const shopifyFee = round(price * (fees.shopifyPct / 100))

  const row = (key: string, label: string, gatewayFee: number): FeeRow => {
    const net = round(price - shopifyFee - gatewayFee)
    const profit = round(net - cost)
    return { key, label, shopifyFee, gatewayFee: round(gatewayFee), net, profit, margin: price > 0 ? round((profit / price) * 100) : 0 }
  }

  const rows = [
    row('pix', 'Pix', price * (fees.pixPct / 100)),
    row('credit', 'Cartão à vista', price * (fees.creditPct / 100)),
  ]
  if (fees.credit12Pct > 0) rows.push(row('credit12', 'Cartão 12x sem juros', price * (fees.credit12Pct / 100)))
  if (fees.boletoFixed > 0) rows.push(row('boleto', 'Boleto', fees.boletoFixed))
  return rows
}

/** Preço de venda necessário para receber `desiredNet` líquido numa forma de pagamento. */
export function priceForNet(desiredNet: number, gatewayPct: number, fees: FeeSettings, fixed = 0): number {
  const divisor = 1 - fees.shopifyPct / 100 - gatewayPct / 100
  if (divisor <= 0) return 0
  return Math.ceil(((desiredNet + fixed) / divisor) * 100) / 100
}
