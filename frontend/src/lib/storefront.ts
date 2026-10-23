import type { TenantConfig } from '../types'

// Storefront API: roda direto no navegador com o token público da loja.

export type Money = { amount: string }
export type Image = { url: string; altText: string | null }

export type ProductCardData = {
  id: string
  handle: string
  title: string
  availableForSale: boolean
  featuredImage: Image | null
  priceRange: { minVariantPrice: Money }
  compareAtPriceRange: { minVariantPrice: Money }
}

export type StoreVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  compareAtPrice: Money | null
  selectedOptions: { name: string; value: string }[]
  image: Image | null
}

export type StoreProduct = {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  images: { nodes: Image[] }
  options: { name: string; optionValues: { name: string }[] }[]
  variants: { nodes: StoreVariant[] }
}

export type CartLine = {
  id: string
  quantity: number
  cost: { totalAmount: Money }
  merchandise: {
    id: string
    title: string
    price: Money
    image: Image | null
    product: { title: string; handle: string; featuredImage: Image | null }
  }
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { subtotalAmount: Money; totalAmount: Money }
  lines: { nodes: CartLine[] }
}

const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount } totalAmount { amount } }
  lines(first: 100) {
    nodes {
      id quantity
      cost { totalAmount { amount } }
      merchandise {
        ... on ProductVariant {
          id title price { amount } image { url altText }
          product { title handle featuredImage { url altText } }
        }
      }
    }
  }
`

type UserError = { field: string[] | null; message: string }

export class StorefrontError extends Error {}

export function createStorefront(tenant: TenantConfig) {
  const endpoint = `https://${tenant.shopDomain}/api/${tenant.apiVersion || '2026-10'}/graphql.json`

  async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': tenant.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json) throw new StorefrontError('Não foi possível falar com a loja. Tente novamente.')
    if (json.errors?.length) throw new StorefrontError(json.errors[0].message ?? 'Erro na loja.')
    return json.data as T
  }

  function check(payload: { userErrors: UserError[]; cart: Cart | null }): Cart {
    if (payload.userErrors?.length) throw new StorefrontError(payload.userErrors.map((e) => e.message).join(' '))
    if (!payload.cart) throw new StorefrontError('Carrinho indisponível.')
    return payload.cart
  }

  return {
    async products(opts: { query?: string; after?: string | null; first?: number } = {}) {
      const data = await gql<{
        products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ProductCardData[] }
      }>(
        `query Products($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys) {
          products(first: $first, after: $after, query: $query, sortKey: $sortKey) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id handle title availableForSale
              featuredImage { url altText }
              priceRange { minVariantPrice { amount } }
              compareAtPriceRange { minVariantPrice { amount } }
            }
          }
        }`,
        {
          first: opts.first ?? 24,
          after: opts.after ?? null,
          query: opts.query || null,
          sortKey: opts.query ? 'RELEVANCE' : 'BEST_SELLING',
        },
      )
      return data.products
    },

    async product(handle: string) {
      const data = await gql<{ product: StoreProduct | null }>(
        `query Product($handle: String!) {
          product(handle: $handle) {
            id handle title descriptionHtml
            images(first: 10) { nodes { url altText } }
            options { name optionValues { name } }
            variants(first: 100) {
              nodes {
                id title availableForSale
                price { amount } compareAtPrice { amount }
                selectedOptions { name value }
                image { url altText }
              }
            }
          }
        }`,
        { handle },
      )
      return data.product
    },

    async getCart(cartId: string) {
      const data = await gql<{ cart: Cart | null }>(`query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, {
        id: cartId,
      })
      return data.cart
    },

    async createCart(lines: { merchandiseId: string; quantity: number }[]) {
      const data = await gql<{ cartCreate: { cart: Cart | null; userErrors: UserError[] } }>(
        `mutation CartCreate($input: CartInput!) {
          cartCreate(input: $input) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { input: { lines, buyerIdentity: { countryCode: 'BR' } } },
      )
      return check(data.cartCreate)
    },

    async addLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
      const data = await gql<{ cartLinesAdd: { cart: Cart | null; userErrors: UserError[] } }>(
        `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { cartId, lines },
      )
      return check(data.cartLinesAdd)
    },

    async updateLine(cartId: string, lineId: string, quantity: number) {
      const data = await gql<{ cartLinesUpdate: { cart: Cart | null; userErrors: UserError[] } }>(
        `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
          cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { cartId, lines: [{ id: lineId, quantity }] },
      )
      return check(data.cartLinesUpdate)
    },

    async removeLine(cartId: string, lineId: string) {
      const data = await gql<{ cartLinesRemove: { cart: Cart | null; userErrors: UserError[] } }>(
        `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
          cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { field message } }
        }`,
        { cartId, lineIds: [lineId] },
      )
      return check(data.cartLinesRemove)
    },

    /** Vincula o carrinho ao cliente logado: o checkout da Shopify abre com o e-mail já preenchido. */
    async setBuyer(cartId: string, buyer: { email: string; phone?: string | null }) {
      const buyerIdentity: Record<string, string> = { email: buyer.email, countryCode: 'BR' }
      if (buyer.phone) buyerIdentity.phone = buyer.phone
      const data = await gql<{ cartBuyerIdentityUpdate: { cart: Cart | null; userErrors: UserError[] } }>(
        `mutation CartBuyer($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
          cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
            cart { ${CART_FIELDS} } userErrors { field message }
          }
        }`,
        { cartId, buyerIdentity },
      )
      return check(data.cartBuyerIdentityUpdate)
    },
  }
}

export type Storefront = ReturnType<typeof createStorefront>
