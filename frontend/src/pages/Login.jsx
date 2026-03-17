import logo from '../assets/logo_taller.png'

function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="bg-white rounded-2xl border border-gray-200 px-8 py-10" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

          {/* Header */}
          <div className="flex flex-col items-center mb-8">

            {/* Logo container */}
            <div className="w-50 h-40 bg-black rounded-2xl flex items-center justify-center mb-5 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
              <img
                src={logo}
                alt="Logo Taller"
                className="w-50 h-40 object-contain"
              />
            </div>

            {/* Título */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-0.5 bg-red-600 rounded"></div>
              <h1 className="text-lg font-medium text-gray-900 tracking-wide">Sistema de gestión</h1>
              <div className="w-5 h-0.5 bg-red-600 rounded"></div>
            </div>
            {/* <p className="text-xs text-gray-400 tracking-widest uppercase">Sistema de gestión</p> */}
          </div>

          <hr className="border-gray-100 mb-7" />

          {/* Usuario */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-7">
            <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
            />
          </div>

          {/* Botón */}
          <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
            Ingresar
          </button>

          {/* Recuperar */}
          {/* <p className="text-center text-xs text-gray-400 mt-5">
            ¿Olvidaste tu contraseña?{' '}
            <span className="text-red-600 cursor-pointer font-medium">Recuperar acceso</span>
          </p> */}

        </div>

        <p className="text-center text-xs text-gray-300 mt-4">
          © 2026 IpsoftPeru · Todos los derechos reservados
        </p>

      </div>
    </div>
  )
}

export default Login