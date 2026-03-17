import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo_taller.png'

function Sidebar({ collapsed }) {
  const navigate = useNavigate()

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
        {/* {!collapsed && (
          <p className="text-xs uppercase tracking-widest px-2 mb-2" style={{ color: '#4a7fa8' }}>Menú</p>
        )} */}

        <NavLink
          to="/dashboard"
          title="Usuarios"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 text-sm transition-colors
            ${collapsed ? 'justify-center' : ''}`
          }
          style={({ isActive }) => ({
            background: isActive ? '#2a5f94' : 'transparent',
            color: isActive ? '#ffffff' : '#7aafd4',
            borderLeft: isActive ? '3px solid #4da6ff' : '3px solid transparent',
          })}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          {!collapsed && <span>Usuarios</span>}
        </NavLink>
      </nav>

      {/* Cerrar sesión */}
      <div className="px-2 py-3" style={{ borderTop: '0.5px solid #2a5080' }}>
        <button
          onClick={() => navigate('/login')}
          title="Cerrar sesión"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-sm transition-colors ${collapsed ? 'justify-center' : ''}`}
          style={{ color: '#7aafd4' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e02020'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7aafd4' }}
        >
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