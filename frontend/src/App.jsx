import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' 
import { Toaster } from 'react-hot-toast'
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
import Servicios from './pages/Servicios'
import Citas from './pages/Citas'
// 1. Importamos la nueva página de recepción
import RecepcionVehiculo from './pages/RecepcionVehiculo'
import GestionTaller from './pages/GestionTaller'

function App() {
  return (
    <AuthProvider> 
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '12px',
          },
        }}
      />
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
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/citas" element={<Citas />} />

          {/* 2. Acoplamos la ruta para la Recepción de Vehículos */}
          <Route path="/recepcion" element={<RecepcionVehiculo />} />
          <Route path="/gestion-taller" element={<GestionTaller />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App