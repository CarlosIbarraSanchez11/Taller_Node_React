import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' // <--- IMPORTA ESTO
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Productos from './pages/Productos'
import Proveedores from './pages/Proveedores'
import Rentabilidad from './pages/Rentabilidad'
import Gestorcostos from './pages/Gestorcostos'
import Clientes from './pages/Clientes'
import Ingresos from './pages/Ingresos'
import Pedidos from './pages/Pedidos'

function App() {
  return (
    // EL PROVIDER DEBE ENVOLVER TODO
    <AuthProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/rentabilidad" element={<Rentabilidad />} />
          <Route path="/gestorcostos" element={<Gestorcostos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/pedidos" element={<Pedidos />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App