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
        
        {/* 1. TODOS ven el "Dashboard" */}
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

        {/* ─── SECCIÓN: ADMINISTRACIÓN (Solo Admin y Gerente) ─── */}
        {(user?.rol === 'Admin' || user?.rol === 'Gerente') && (
          <>
            {/* Usuarios */}
            <NavLink
              to="/usuarios" 
              title="Usuarios"
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
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              {!collapsed && <span>Usuarios</span>}
            </NavLink>

            {/* RENTABILIDAD (NUEVO) */}
            <NavLink
              to="/rentabilidad" 
              title="Rentabilidad"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`
              }
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              {/* Icono de Monedas / Ganancia */}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              {!collapsed && <span>Rentabilidad</span>}
            </NavLink>

            {/* Gestor de costos */}
            <NavLink
              to="/gestorcostos" 
              title="Gestor de Costos"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${collapsed ? 'justify-center' : ''}`
              }
              style={({ isActive }) => ({
                background: isActive ? '#2a5f94' : 'transparent',
                color: isActive ? '#ffffff' : '#7aafd4',
                borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
              })}
            >
              {/* Icono de Monedas / Ganancia */}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              {!collapsed && <span>Gestor de Costos</span>}
            </NavLink>
          </>
        )}

        {/* ─── SECCIÓN: LOGÍSTICA (Admin, Gerente y Logística) ─── */}
        {(user?.rol === 'Admin' || user?.rol === 'Gerente' || user?.rol === 'Logística') && (
          <>
            <NavLink
              to="/productos"
              title="Productos"
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              {!collapsed && <span>Productos</span>}
            </NavLink>

            <NavLink
              to="/proveedores"
              title="Proveedores"
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
                <rect x="1" y="3" width="15" height="13" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              {!collapsed && <span>Proveedores</span>}
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