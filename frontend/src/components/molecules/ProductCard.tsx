import { Link } from 'react-router-dom'
import { brl } from '../../lib/format'
import type { ProductCardData } from '../../lib/storefront'
import { paths } from '../../routes/paths'

export function ProductCard({ product }: { product: ProductCardData }) {
  const price = Number(product.priceRange.minVariantPrice.amount)
  const compareAt = Number(product.compareAtPriceRange.minVariantPrice.amount)
  const onSale = compareAt > price

  return (
    <Link to={paths.store.product(product.handle)} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
        {product.featuredImage && (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
            Oferta
          </span>
        )}
        {!product.availableForSale && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 py-1 text-center text-xs font-medium">
            Esgotado
          </span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-medium">{product.title}</h3>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-semibold">{brl(price)}</span>
        {onSale && <span className="text-xs text-stone-400 line-through">{brl(compareAt)}</span>}
      </div>
    </Link>
  )
}
