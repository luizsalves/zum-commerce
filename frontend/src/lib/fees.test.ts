import { describe, expect, it } from 'vitest'
import { DEFAULT_FEES, priceForNet, simulate, type FeeSettings } from './fees'

const fees: FeeSettings = {
  ...DEFAULT_FEES,
  shopifyPct: 2,
  creditPct: 4.98,
  credit12Pct: 0,
  pixPct: 0.99,
  boletoFixed: 0,
}

describe('simulate', () => {
  it('desconta Shopify e gateway do preço (exemplo de R$ 79,90)', () => {
    const [pix, credit] = simulate(79.9, 30, fees)

    expect(credit.shopifyFee).toBe(1.6)
    expect(credit.gatewayFee).toBe(3.98)
    expect(credit.net).toBe(74.32)
    expect(credit.profit).toBe(44.32)

    expect(pix.gatewayFee).toBe(0.79)
    expect(pix.net).toBe(77.51)
  })

  it('só mostra 12x e boleto quando configurados', () => {
    expect(simulate(100, 0, fees).map((r) => r.key)).toEqual(['pix', 'credit'])
    const all = simulate(100, 0, { ...fees, credit12Pct: 12, boletoFixed: 3.49 }).map((r) => r.key)
    expect(all).toEqual(['pix', 'credit', 'credit12', 'boleto'])
  })

  it('boleto usa valor fixo', () => {
    const boleto = simulate(50, 0, { ...fees, boletoFixed: 3.49 }).find((r) => r.key === 'boleto')!
    expect(boleto.gatewayFee).toBe(3.49)
  })
})

describe('priceForNet', () => {
  it('calcula o preço para receber o líquido desejado no cartão', () => {
    expect(priceForNet(75, fees.creditPct, fees)).toBe(80.63)
  })

  it('o preço sugerido realmente rende o líquido pedido', () => {
    const price = priceForNet(75, fees.creditPct, fees)
    const credit = simulate(price, 0, fees).find((r) => r.key === 'credit')!
    expect(credit.net).toBeGreaterThanOrEqual(75)
  })
})
