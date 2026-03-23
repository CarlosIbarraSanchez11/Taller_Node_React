import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' // <--- IMPORTA ESTO
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Productos from './pages/Productos'
import Proveedores from './pages/Proveedores'

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App