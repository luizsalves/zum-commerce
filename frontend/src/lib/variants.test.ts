import { describe, expect, it } from 'vitest'
import { combinations, emptyRow, syncVariants } from './variants'

describe('combinations', () => {
  it('gera todas as combinações de opções', () => {
    const result = combinations([
      { name: 'Tamanho', values: ['P', 'M'] },
      { name: 'Cor', values: ['Rosa'] },
    ])
    expect(result).toEqual([
      { Tamanho: 'P', Cor: 'Rosa' },
      { Tamanho: 'M', Cor: 'Rosa' },
    ])
  })
})

describe('syncVariants', () => {
  it('produto sem opções tem uma única variação', () => {
    const rows = syncVariants([], [{ ...emptyRow(), price: '49,90' }])
    expect(rows).toHaveLength(1)
    expect(rows[0].price).toBe('49,90')
  })

  it('preserva o que já foi digitado ao adicionar um valor', () => {
    const first = syncVariants([{ name: 'Tamanho', valuesText: 'P' }], [{ ...emptyRow(), price: '79,90' }])
    const edited = first.map((r) => ({ ...r, sku: 'TIARA-P' }))

    const rows = syncVariants([{ name: 'Tamanho', valuesText: 'P, M' }], edited)

    expect(rows.map((r) => r.key)).toEqual(['P', 'M'])
    expect(rows[0].sku).toBe('TIARA-P')
    expect(rows[1].price).toBe('79,90') // variação nova herda o preço
    expect(rows[1].sku).toBe('')
  })

  it('ignora opções sem nome ou sem valores', () => {
    const rows = syncVariants([{ name: '', valuesText: 'P' }, { name: 'Cor', valuesText: ' , ' }], [emptyRow()])
    expect(rows).toHaveLength(1)
    expect(rows[0].options).toEqual({})
  })
})
