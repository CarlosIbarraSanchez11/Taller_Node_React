import { useAuth } from '../../context/AuthContext';

function Navbar({ titulo, subtitulo, onToggle }) {
  const { user } = useAuth();

  // 1. EXTRAEMOS EL NOMBRE DIRECTAMENTE DEL OBJETO RELACIONADO
  // Si el backend hizo su trabajo, user.taller ya trae el nombre.
  const nombreTaller = user?.taller?.nombre || 'Vista Global';
  
  const inicialUsuario = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U';

  return (
    <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5">
      <div className="flex items-center gap-4">
        {/* Botón Hamburguesa */}
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div>
          <h1 className="text-sm font-medium text-gray-900">{titulo}</h1>
          <p className="text-xs text-gray-400">{subtitulo}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <button className="relative w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* Info del Usuario + Taller Real */}
        <div className="flex items-center gap-2 border-l border-gray-100 pl-3">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900">{user?.nombre || 'Invitado'}</p>
            {/* Aquí es donde brilla el cambio: */}
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
               {user?.rol || 'Sin Rol'} • <span className="text-[#1a3a5c]">{nombreTaller}</span>
            </p>
          </div>
          <div className="w-8 h-8 bg-[#1a3a5c] rounded-full flex items-center justify-center text-xs font-medium text-white shadow-sm">
            {inicialUsuario}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;