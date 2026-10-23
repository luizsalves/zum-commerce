export type TenantConfig = {
  id: string
  name: string
  shopDomain: string
  storefrontToken: string
  apiVersion: string
  primaryColor?: string | null
  logoUrl?: string | null
  whatsapp?: string | null
}

export type CustomerProfile = {
  shopifyCustomerId: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  acceptsMarketing: boolean
}

export type Page<T> = { items: T[]; hasNextPage: boolean; endCursor: string | null }

// ---- Admin (espelha os DTOs da API em C#) ----

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED'

export type ProductOption = { name: string; values: string[] }

export type Variant = {
  id: string | null
  options: Record<string, string>
  price: number
  compareAtPrice: number | null
  cost: number | null
  sku: string | null
  quantity: number | null
  weightGrams: number | null
}

export type ProductImage = { id: string | null; url: string | null; alt: string | null }

export type Product = {
  id: string | null
  title: string
  descriptionHtml: string | null
  vendor: string | null
  productType: string | null
  tags: string[]
  status: ProductStatus
  options: ProductOption[]
  variants: Variant[]
  images: ProductImage[]
}

export type ProductListItem = {
  id: string
  title: string
  status: ProductStatus
  totalInventory: number | null
  imageUrl: string | null
  minPrice: number | null
  maxPrice: number | null
}

export type CustomerListItem = {
  id: string
  name: string
  email: string | null
  phone: string | null
  ordersCount: number
  amountSpent: number
  createdAt: string | null
}

export type MeResponse = {
  platformAdmin: boolean
  tenants: { id: string; name: string; shopDomain: string; active: boolean }[]
}
