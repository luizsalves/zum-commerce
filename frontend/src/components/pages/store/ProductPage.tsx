import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../../contexts/CartContext'
import { useTenant } from '../../../contexts/TenantContext'
import { brl } from '../../../lib/format'
import type { StoreProduct } from '../../../lib/storefront'
import { QuantityStepper } from '../../molecules/QuantityStepper'

export function ProductPage() {
  const { handle = '' } = useParams()
  const { storefront } = useTenant()
  const { add, busy } = useCart()
  const [product, setProduct] = useState<StoreProduct | null | undefined>(undefined)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [imageIndex, setImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setProduct(undefined)
    storefront
      .product(handle)
      .then((p) => {
        setProduct(p)
        setImageIndex(0)
        // Pré-seleciona a primeira variação disponível.
        const first = p?.variants.nodes.find((v) => v.availableForSale) ?? p?.variants.nodes[0]
        setSelected(Object.fromEntries((first?.selectedOptions ?? []).map((o) => [o.name, o.value])))
      })
      .catch((e: Error) => {
        setError(e.message)
        setProduct(null)
      })
  }, [storefront, handle])

  const variant = useMemo(
    () => product?.variants.nodes.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)),
    [product, selected],
  )

  if (product === undefined) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-stone-100" />
        <div className="space-y-3">
          <div className="h-8 w-2/3 animate-pulse rounded bg-stone-100" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-stone-100" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl">Produto não encontrado</p>
        {error && <p className="mt-2 text-sm text-stone-500">{error}</p>}
        <Link to="/" className="btn-ghost mt-6">
          Voltar para a loja
        </Link>
      </div>
    )
  }

  const images = product.images.nodes
  const mainImage = variant?.image && imageIndex === 0 ? variant.image : images[imageIndex] ?? images[0]
  const hasRealOptions = !(product.options.length === 1 && product.options[0].optionValues.length === 1 && product.options[0].name === 'Title')
  const price = variant ? Number(variant.price.amount) : null
  const compareAt = variant?.compareAtPrice ? Number(variant.compareAtPrice.amount) : null

  const isValueAvailable = (optionName: string, value: string) =>
    product.variants.nodes.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) => (o.name === optionName ? o.value === value : selected[o.name] === o.value)),
    )

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-2 md:gap-12">
      <div>
        <div className="aspect-square overflow-hidden rounded-3xl bg-stone-100">
          {mainImage && <img src={mainImage.url} alt={mainImage.altText ?? product.title} className="h-full w-full object-cover" />}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setImageIndex(i)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === imageIndex ? 'border-brand' : 'border-transparent'}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl">{product.title}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          {price !== null && <span className="text-2xl font-semibold">{brl(price)}</span>}
          {compareAt !== null && price !== null && compareAt > price && (
            <span className="text-stone-400 line-through">{brl(compareAt)}</span>
          )}
        </div>

        {hasRealOptions &&
          product.options.map((option) => (
            <div key={option.name} className="mt-6">
              <p className="label">{option.name}</p>
              <div className="flex flex-wrap gap-2">
                {option.optionValues.map(({ name: value }) => {
                  const active = selected[option.name] === value
                  const available = isValueAvailable(option.name, value)
                  return (
                    <button
                      key={value}
                      onClick={() => setSelected((s) => ({ ...s, [option.name]: value }))}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active ? 'border-brand bg-brand text-white' : 'border-stone-300 bg-white hover:border-stone-500'
                      } ${available ? '' : 'opacity-40 line-through'}`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

        <div className="mt-8 flex items-center gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <button
            disabled={!variant || !variant.availableForSale || busy}
            onClick={() => variant && add(variant.id, quantity).catch(() => undefined)}
            className="btn-primary flex-1 rounded-full py-3"
          >
            {!variant ? 'Indisponível' : variant.availableForSale ? 'Adicionar ao carrinho' : 'Esgotado'}
          </button>
        </div>

        {product.descriptionHtml && (
          <div
            className="prose-sm mt-8 space-y-3 text-stone-700 [&_a]:text-brand [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        )}
      </div>
    </div>
  )
}
