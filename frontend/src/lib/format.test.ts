import { describe, expect, it } from 'vitest'
import { parseMoney, shortId } from './format'

describe('parseMoney', () => {
  it.each([
    ['79,90', 79.9],
    ['79.90', 79.9],
    ['1.299,90', 1299.9],
    ['R$ 15', 15],
  ])('%s → %d', (input, expected) => {
    expect(parseMoney(input)).toBe(expected)
  })

  it('vazio vira null', () => {
    expect(parseMoney('  ')).toBeNull()
  })
})

describe('shortId', () => {
  it('extrai o número do gid da Shopify', () => {
    expect(shortId('gid://shopify/Product/123')).toBe('123')
  })
})
