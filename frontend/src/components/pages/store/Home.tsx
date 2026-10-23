import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../../molecules/ProductCard'
import { useTenant } from '../../../contexts/TenantContext'
import type { ProductCardData } from '../../../lib/storefront'
import { Alert } from '../../atoms/Alert'

export function Home() {
  const { tenant, storefront } = useTenant()
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const [products, setProducts] = useState<ProductCardData[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    storefront
      .products({ query: q })
      .then((page) => {
        if (!active) return
        setProducts(page.nodes)
        setCursor(page.pageInfo.endCursor)
        setHasMore(page.pageInfo.hasNextPage)
      })
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [storefront, q])

  const loadMore = async () => {
    setLoading(true)
    try {
      const page = await storefront.products({ query: q, after: cursor })
      setProducts((prev) => [...prev, ...page.nodes])
      setCursor(page.pageInfo.endCursor)
      setHasMore(page.pageInfo.hasNextPage)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {!q && (
        <section className="mb-10 rounded-3xl bg-brand-soft px-6 py-12 text-center sm:py-16">
          <h1 className="font-display text-3xl sm:text-5xl">{tenant.name}</h1>
          <p className="mx-auto mt-3 max-w-md text-stone-600">Escolha seus favoritos e receba em casa.</p>
        </section>
      )}

      {q && (
        <h1 className="mb-6 font-display text-2xl">
          Resultados para “{q}”
        </h1>
      )}

      {error && <Alert>{error}</Alert>}

      {!loading && !error && products.length === 0 && (
        <p className="py-16 text-center text-stone-500">Nenhum produto encontrado.</p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`sk-${i}`} className="aspect-square animate-pulse rounded-2xl bg-stone-100" />
          ))}
      </div>

      {hasMore && !loading && (
        <div className="mt-10 text-center">
          <button onClick={loadMore} className="btn-ghost">
            Ver mais produtos
          </button>
        </div>
      )}
    </div>
  )
}
