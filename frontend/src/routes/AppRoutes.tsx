import { Route, Routes } from 'react-router-dom'
import { AdminRoutes } from './AdminRoutes'
import { StoreRoutes } from './StoreRoutes'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<StoreRoutes />} />
    </Routes>
  )
}
