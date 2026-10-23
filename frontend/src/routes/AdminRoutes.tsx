import { Route, Routes } from 'react-router-dom'
import { AdminCustomers } from '../components/pages/admin/AdminCustomers'
import { AdminFees } from '../components/pages/admin/AdminFees'
import { AdminPlatform } from '../components/pages/admin/AdminPlatform'
import { AdminProducts } from '../components/pages/admin/AdminProducts'
import { ProductForm } from '../components/pages/admin/ProductForm'
import { AdminLayout } from '../components/templates/AdminLayout'
import { AuthProvider } from '../contexts/AuthContext'

/** Painel: independe do domínio; a loja é escolhida dentro do painel. */
export function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminProducts />} />
          <Route path="produto" element={<ProductForm />} />
          <Route path="produto/novo" element={<ProductForm />} />
          <Route path="clientes" element={<AdminCustomers />} />
          <Route path="taxas" element={<AdminFees />} />
          <Route path="plataforma" element={<AdminPlatform />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
