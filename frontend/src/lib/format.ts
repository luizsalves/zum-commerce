const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function brl(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value ?? 0
  return brlFormatter.format(Number.isFinite(n) ? n : 0)
}

/** Aceita "79,90", "79.90", "1.299,90" e devolve número. */
export function parseMoney(input: string): number | null {
  const clean = input.trim().replace(/[^\d,.-]/g, '')
  if (!clean) return null
  const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function pct(value: number): string {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

/** "gid://shopify/Product/123" → "123" */
export function shortId(gid: string): string {
  return gid.split('/').pop() ?? gid
}
