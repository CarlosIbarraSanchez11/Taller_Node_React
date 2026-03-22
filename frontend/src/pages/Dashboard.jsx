import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { usuariosMock } from '../services/mockData'
import Usuarios from './Usuarios'

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const activos   = usuariosMock.filter(u => u.estado === 'Activo').length
  const inactivos = usuariosMock.filter(u => u.estado === 'Inactivo').length

  const rolColor = {
    Admin:      'bg-red-50 text-red-600',
    Mecánico:   'bg-purple-50 text-purple-600',
    Recepción:  'bg-blue-50 text-blue-600',
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          titulo="Usuarios"
          subtitulo="Gestión de usuarios del sistema"
          onToggle={() => setCollapsed(!collapsed)}
        />

        <div className="flex-1 overflow-y-auto">
            <Usuarios />
        </div>
      </div>
    </div>
  )
}

export default Dashboard