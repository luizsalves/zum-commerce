import { Route, Routes } from 'react-router-dom'
import { Account } from '../components/pages/store/Account'
import { Checkout } from '../components/pages/store/Checkout'
import { Home } from '../components/pages/store/Home'
import { Login } from '../components/pages/store/Login'
import { ProductPage } from '../components/pages/store/ProductPage'
import { Register } from '../components/pages/store/Register'
import { StoreLayout } from '../components/templates/StoreLayout'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { TenantProvider, useTenant } from '../contexts/TenantContext'

/** Vitrine: descobre a loja pelo domínio, depois login do cliente e carrinho. */
export function StoreRoutes() {
  return (
    <TenantProvider>
      <StoreWithTenant />
    </TenantProvider>
  )
}

function StoreWithTenant() {
  const { tenant } = useTenant()
  return (
    <AuthProvider tenantId={tenant.id}>
      <CartProvider>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="produto/:handle" element={<ProductPage />} />
            <Route path="entrar" element={<Login />} />
            <Route path="cadastro" element={<Register />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="minha-conta" element={<Account />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
