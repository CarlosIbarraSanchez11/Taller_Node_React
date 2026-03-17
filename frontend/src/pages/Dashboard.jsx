import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'
import { usuariosMock } from '../services/mockData'

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

        <div className="flex-1 overflow-y-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total usuarios', valor: usuariosMock.length },
              { label: 'Activos',        valor: activos },
              { label: 'Inactivos',      valor: inactivos },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-medium text-gray-900">{stat.valor}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900">Lista de usuarios</p>
              <button className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">
                + Nuevo usuario
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-xs text-gray-400 font-medium">Nombre</th>
                  <th className="px-5 py-2.5 text-left text-xs text-gray-400 font-medium">Email</th>
                  <th className="px-5 py-2.5 text-left text-xs text-gray-400 font-medium">Rol</th>
                  <th className="px-5 py-2.5 text-left text-xs text-gray-400 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {usuariosMock.map((u, i) => (
                  <tr key={u.id} className={i !== usuariosMock.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="px-5 py-3 text-gray-900">{u.nombre}</td>
                    <td className="px-5 py-3 text-gray-400">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${rolColor[u.rol] || 'bg-gray-100 text-gray-500'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${u.estado === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {u.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard