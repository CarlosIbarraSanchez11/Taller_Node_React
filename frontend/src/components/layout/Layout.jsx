import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

// Este es el "Cascarón". Recibe el contenido de la página en {children}
function Layout({ children, tituloNavbar }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          titulo={tituloNavbar}
          subtitulo="Gestión del sistema"
          onToggle={() => setCollapsed(!collapsed)}
        />

        {/* Aquí adentro va a renderizar dinámicamente el Dashboard, o Usuarios, o Clientes */}
        <div className="flex-1 overflow-y-auto p-6">
            {children} 
        </div>
      </div>
    </div>
  )
}

export default Layout