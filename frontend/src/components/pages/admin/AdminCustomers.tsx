import { useEffect, useState, type FormEvent } from 'react'
import { useAdmin } from '../../../contexts/AdminContext'
import { RequireTenant } from '../../molecules/RequireTenant'
import { api } from '../../../lib/api'
import { brl } from '../../../lib/format'
import type { CustomerListItem, Page } from '../../../types'
import { Alert } from '../../atoms/Alert'

export function AdminCustomers() {
  return (
    <RequireTenant>
      <CustomerList />
    </RequireTenant>
  )
}

function CustomerList() {
  const { tenantId } = useAdmin()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<CustomerListItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async (after: string | null, append: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (after) params.set('after', after)
      const page = await api<Page<CustomerListItem>>(`/api/admin/customers?${params}`, { tenantId })
      setItems((prev) => (append ? [...prev, ...page.items] : page.items))
      setCursor(page.endCursor)
      setHasMore(page.hasNextPage)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(null, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, query])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    setQuery(search.trim())
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Clientes</h1>
      <p className="text-sm text-stone-500">Clientes cadastrados na loja (dados vindos da Shopify).</p>

      <form onSubmit={onSearch} className="mt-6 flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Buscar por nome, e-mail ou telefone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-ghost">Buscar</button>
      </form>

      {error && <Alert className="mt-4">{error}</Alert>}

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 text-right font-medium">Pedidos</th>
              <th className="px-4 py-3 text-right font-medium">Total gasto</th>
              <th className="px-4 py-3 text-right font-medium">Desde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name || '—'}</td>
                <td className="px-4 py-3 text-stone-600">
                  <div>{c.email}</div>
                  {c.phone && (
                    <a
                      href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand hover:underline"
                    >
                      {c.phone}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-right">{c.ordersCount}</td>
                <td className="px-4 py-3 text-right">{brl(c.amountSpent)}</td>
                <td className="px-4 py-3 text-right text-stone-500">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && items.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-stone-500">Nenhum cliente ainda.</p>
        )}
        {loading && <p className="px-4 py-6 text-center text-sm text-stone-400">Carregando…</p>}
      </div>

      {hasMore && !loading && (
        <button className="btn-ghost mt-4" onClick={() => load(cursor, true)}>
          Carregar mais
        </button>
      )}
    </div>
  )
}
