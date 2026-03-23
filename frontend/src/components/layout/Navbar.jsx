import { useAuth } from '../../context/AuthContext' // Importamos tu sesión
import { talleresMock } from "../../services/mockData";

function Navbar({ titulo, subtitulo, onToggle }) {
  const { user } = useAuth(); // Extraemos al usuario logueado

  // Lógica para saber qué poner en la esquina
  const nombreTaller = user?.tallerId 
    ? talleresMock.find(t => t.id === user?.tallerId)?.nombre 
    : 'Vista Global';
  
  const inicialUsuario = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U';
  return (
    <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5">

      <div className="flex items-center gap-4">
        {/* Hamburguesa */}
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div>
          <h1 className="text-sm font-medium text-gray-900">{titulo}</h1>
          <p className="text-xs text-gray-400">{subtitulo}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">

        {/* Notificaciones */}
        <button className="relative w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* Nombre taller + avatar */}
        <div className="flex items-center gap-2 border-l border-gray-100 pl-3">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900">{user?.nombre || 'Invitado'}</p>
            <p className="text-xs text-gray-400">{user?.rol || 'Sin Rol'} • {nombreTaller}</p>
          </div>
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
            {inicialUsuario}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Navbar