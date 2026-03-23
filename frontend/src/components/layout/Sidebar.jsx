import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo_taller.png'
import { useAuth } from '../../context/AuthContext'

function Sidebar({ collapsed }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout(); // Esto borra el localStorage
    navigate('/login'); // Y luego te patea al login
  }

  return (
    <div className={`${collapsed ? 'w-16' : 'w-52'} min-h-screen flex flex-col transition-all duration-300`}
      style={{ background: '#1a3a5c' }}>

      {/* Logo */}
      <div className="px-3 py-4 flex items-center justify-center" style={{ borderBottom: '0.5px solid #2a5080' }}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" className="w-30 h-25 object-contain rounded-lg" />
            <div>
              {/* <p className="text-sm font-medium text-white leading-tight">Taller</p>
              <p className="text-xs" style={{ color: '#7aafd4' }}>Mecánico</p> */}
            </div>
          </div>
        ) : (
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4">
  
        {/* 1. DASHBOARD: Acceso Total */}
        <NavLink
          to="/dashboard"
          title="Dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`
          }
          style={({ isActive }) => ({
            background: isActive ? '#2a5f94' : 'transparent',
            color: isActive ? '#ffffff' : '#7aafd4',
            borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
          })}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* 2. GESTIÓN ESTRATÉGICA: Solo Admin y Gerente */}
        {(user?.rol === 'Admin' || user?.rol === 'Gerente') && (
          <>
            <NavLink
              to="/usuarios" 
              title="Usuarios"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              {!collapsed && <span>Usuarios</span>}
            </NavLink>

            <NavLink
              to="/rentabilidad" 
              title="Rentabilidad"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              {!collapsed && <span>Rentabilidad</span>}
            </NavLink>

            <NavLink
              to="/gestorcostos" 
              title="Gestor de Costos"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              {!collapsed && <span>Gestor de Costos</span>}
            </NavLink>

            <NavLink
              to="/servicios" 
              title="Servicios"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              {!collapsed && <span>Servicios</span>}
            </NavLink>
          </>
        )}

        {/* 3. ATENCIÓN AL CLIENTE: Admin, Gerente y Call Center */}
        {(user?.rol === 'Admin' || user?.rol === 'Gerente' || user?.rol === 'Call') && (
          <NavLink
            to="/clientes" 
            title="Clientes"
            className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
            style={({ isActive }) => ({
              background: isActive ? '#2a5f94' : 'transparent',
              color: isActive ? '#ffffff' : '#7aafd4',
              borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
            })}
          >
            {/* Icono de Personas / Grupo de Clientes */}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {!collapsed && <span>Clientes</span>}
          </NavLink>
        )}

        {/* 4. LOGÍSTICA: Admin, Gerente y Logística */}
        {(user?.rol === 'Admin' || user?.rol === 'Gerente' || user?.rol === 'Logística') && (
          <>
            <NavLink
              to="/productos"
              title="Productos"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              {!collapsed && <span>Productos</span>}
            </NavLink>

            <NavLink
              to="/proveedores"
              title="Proveedores"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              {!collapsed && <span>Proveedores</span>}
            </NavLink>

            <NavLink
              to="/ingresos"
              title="Ingresos"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              {/* Icono de Caja con Flecha hacia abajo (Entrada de stock) */}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 8l-2-2H5L3 8v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z" />
                <path d="M12 12v7" />
                <path d="M9 16l3 3 3-3" />
                <path d="M3 8h18" />
              </svg>
              {!collapsed && <span>Ingresos</span>}
            </NavLink>

            <NavLink
              to="/pedidos"
              title="Pedidos"
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              {/* Icono de Caja con Flecha hacia abajo (Entrada de stock) */}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 12h6M9 16h6" />
              </svg>
              {!collapsed && <span>Pedidos</span>}
            </NavLink>
          </>
        )}

      </nav>

      {/* Cerrar sesión */}
      <div className="px-2 py-3" style={{ borderTop: '0.5px solid #2a5080' }}>
        <button
          onClick={handleLogout} // Cambiamos esto
          title="Cerrar sesión"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
          style={{ color: '#7aafd4' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e02020'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7aafd4' }}
        >
          {/* Icono (Igual) */}
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

    </div>
  )
}

export default Sidebar