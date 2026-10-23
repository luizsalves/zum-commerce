/** Regras do formulário de produto: opções (Tamanho, Cor…) e a grade de variações. */

export type OptionRow = { name: string; valuesText: string }

export type VariantRow = {
  key: string
  id: string | null
  options: Record<string, string>
  price: string
  compareAtPrice: string
  cost: string
  sku: string
  quantity: string
  weightGrams: string
}

export const emptyRow = (options: Record<string, string> = {}, key = ''): VariantRow => ({
  key,
  id: null,
  options,
  price: '',
  compareAtPrice: '',
  cost: '',
  sku: '',
  quantity: '0',
  weightGrams: '',
})

export const parseValues = (text: string) =>
  Array.from(new Set(text.split(',').map((v) => v.trim()).filter(Boolean)))

export const cleanOptions = (rows: OptionRow[]) =>
  rows
    .map((o) => ({ name: o.name.trim(), values: parseValues(o.valuesText) }))
    .filter((o) => o.name && o.values.length > 0)

export const keyOf = (options: Record<string, string>, names: string[]) => names.map((n) => options[n] ?? '').join(' / ')

/** Todas as combinações: Tamanho [P, M] × Cor [Rosa] → P/Rosa, M/Rosa. */
export function combinations(options: { name: string; values: string[] }[]): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, opt) => acc.flatMap((combo) => opt.values.map((v) => ({ ...combo, [opt.name]: v }))),
    [{}],
  )
}

/** Recalcula as variações quando as opções mudam, preservando o que já foi digitado. */
export function syncVariants(optionRows: OptionRow[], current: VariantRow[]): VariantRow[] {
  const options = cleanOptions(optionRows)
  if (options.length === 0) {
    const base = current[0] ?? emptyRow()
    return [{ ...base, key: '', options: {} }]
  }
  const names = options.map((o) => o.name)
  const byKey = new Map(current.map((r) => [keyOf(r.options, names), r]))
  const template = current[0]
  return combinations(options).map((combo) => {
    const key = keyOf(combo, names)
    const existing = byKey.get(key)
    if (existing) return { ...existing, key, options: combo }
    // Variação nova herda preço/custo/peso da primeira, para agilizar.
    return {
      ...emptyRow(combo, key),
      price: template?.price ?? '',
      compareAtPrice: template?.compareAtPrice ?? '',
      cost: template?.cost ?? '',
      weightGrams: template?.weightGrams ?? '',
    }
  })
}
