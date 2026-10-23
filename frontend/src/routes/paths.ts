/** Caminhos da aplicação num lugar só, para não espalhar strings pelas telas. */
export const paths = {
  store: {
    home: '/',
    product: (handle: string) => `/produto/${handle}`,
    login: '/entrar',
    register: '/cadastro',
    checkout: '/checkout',
    account: '/minha-conta',
  },
  admin: {
    products: '/admin',
    newProduct: '/admin/produto/novo',
    editProduct: (id: string) => `/admin/produto?id=${encodeURIComponent(id)}`,
    customers: '/admin/clientes',
    fees: '/admin/taxas',
    platform: '/admin/plataforma',
  },
} as const
