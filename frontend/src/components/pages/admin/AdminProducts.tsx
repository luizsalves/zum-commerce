import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../../../contexts/AdminContext'
import { RequireTenant } from '../../molecules/RequireTenant'
import { api } from '../../../lib/api'
import { brl } from '../../../lib/format'
import type { Page, ProductListItem } from '../../../types'
import { Alert } from '../../atoms/Alert'
import { StatusBadge } from '../../atoms/StatusBadge'
import { paths } from '../../../routes/paths'

export function AdminProducts() {
  return (
    <RequireTenant>
      <ProductList />
    </RequireTenant>
  )
}

function ProductList() {
  const { tenantId, tenantName } = useAdmin()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ProductListItem[]>([])
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
      const page = await api<Page<ProductListItem>>(`/api/admin/products?${params}`, { tenantId })
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Produtos</h1>
          <p className="text-sm text-stone-500">{tenantName}</p>
        </div>
        <Link to={paths.admin.newProduct} className="btn-primary">
          Novo produto
        </Link>
      </div>

      <form onSubmit={onSearch} className="mt-6 flex gap-2">
        <input
          className="input max-w-sm"
          placeholder="Buscar por nome ou SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-ghost">Buscar</button>
      </form>

      {error && <Alert className="mt-4">{error}</Alert>}

      <div className="card mt-4 divide-y divide-stone-100 overflow-hidden">
        {items.map((p) => (
          <Link
            key={p.id}
            to={paths.admin.editProduct(p.id)}
            className="flex items-center gap-4 px-4 py-3 hover:bg-stone-50"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {p.imageUrl && <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.title}</p>
              <p className="text-xs text-stone-500">
                {p.totalInventory ?? 0} em estoque
              </p>
            </div>
            <span className="hidden text-sm sm:block">
              {p.minPrice !== null &&
                (p.maxPrice !== null && p.maxPrice !== p.minPrice
                  ? `${brl(p.minPrice)} – ${brl(p.maxPrice)}`
                  : brl(p.minPrice))}
            </span>
            <StatusBadge status={p.status} />
          </Link>
        ))}
        {!loading && items.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-stone-500">Nenhum produto ainda.</p>
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
