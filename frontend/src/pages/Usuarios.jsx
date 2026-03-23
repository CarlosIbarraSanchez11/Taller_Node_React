import { useState } from 'react'
import { usuariosMock, talleresMock, usuarioLogueado } from '../services/mockData'
import Layout from '../components/layout/Layout'

const rolesOpciones = ['Jefe Mecánico', 'Mecánico', 'Call', 'Logística', 'Facturación', 'Limpieza']
const rolColor = {
  'Admin':         'bg-red-50 text-red-600',         // Rojo (Poder total)
  'Gerente':       'bg-emerald-50 text-emerald-600', // Verde esmeralda (Dirección)
  'Jefe Mecánico': 'bg-blue-50 text-blue-700',       // Azul oscuro (Liderazgo técnico)
  'Mecánico':      'bg-purple-50 text-purple-600',   // Morado (Operativo técnico)
  'Call':          'bg-orange-50 text-orange-600',   // Naranja (Atención y energía)
  'Logística':     'bg-cyan-50 text-cyan-600',       // Celeste (Operaciones y flujo)
  'Facturación':   'bg-indigo-50 text-indigo-600',   // Índigo/Añil (Finanzas y administración)
  'Limpieza':      'bg-slate-50 text-slate-600',     // Gris/Pizarra (Servicios generales)
}

const initialForm = { nombre: '', email: '', password: '', rol: 'Mecánico', estado: 'Activo', tallerId: 1 }

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormUsuario({ form, setForm, onSubmit, onClose, submitLabel }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-4">

        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
          <input type="text" required value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400"/>
        </div>

        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input type="email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400"/>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Contraseña</label>
          <input type="password" value={form.password} placeholder="••••••••"
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400"/>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Rol</label>
          <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400">
            {rolesOpciones.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Taller asignado</label>
          <select value={form.tallerId} onChange={e => setForm({ ...form, tallerId: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400">
            {talleresMock.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400">
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>

      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 py-2 text-sm text-white rounded-lg transition-colors"
          style={{ background: '#1a3a5c' }}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function Usuarios() {
  const esAdmin = usuarioLogueado.rol === 'Admin'

  // Pestañas: Admin ve todas, Jefe solo la suya
  const tabs = esAdmin
    ? [{ id: 'todos', nombre: 'Todos' }, ...talleresMock]
    : talleresMock.filter(t => t.id === usuarioLogueado.tallerId)

  const [tabActiva, setTabActiva]         = useState(tabs[0].id)
  const [usuarios, setUsuarios]           = useState(usuariosMock)
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [modalEditar, setModalEditar]     = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [form, setForm]                   = useState(initialForm)

  // --- ESTADOS DE PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1)
  const usuariosPorPagina = 10 // Muestra 5 usuarios a la vez
  const [busqueda, setBusqueda] = useState('')

  // Filtrar según pestaña activa
  let usuariosFiltrados = tabActiva === 'todos'
    ? usuarios.filter(u => u.tallerId !== null)
    : usuarios.filter(u => u.tallerId === tabActiva)

  if (busqueda) {
    usuariosFiltrados = usuariosFiltrados.filter(u => 
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rol.toLowerCase().includes(busqueda.toLowerCase())
    )
  }

  // Stats generales
  const activos   = usuariosFiltrados.filter(u => u.estado === 'Activo').length
  const inactivos = usuariosFiltrados.filter(u => u.estado === 'Inactivo').length

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina)
  const indexUltimoUsuario = paginaActual * usuariosPorPagina
  const indexPrimerUsuario = indexUltimoUsuario - usuariosPorPagina
  // Esta es la lista "recortada" que se pinta en la tabla
  const usuariosPaginados = usuariosFiltrados.slice(indexPrimerUsuario, indexUltimoUsuario)

  // Función para cambiar de tab reseteando la página a 1
  const handleCambiarTab = (tabId) => {
    setTabActiva(tabId)
    setPaginaActual(1) // Si cambia de taller, vuelve a la página 1
  }

  // --- HANDLERS ---
  const abrirNuevo = () => {
    setForm({ ...initialForm, tallerId: tabActiva === 'todos' ? 1 : tabActiva })
    setModalNuevo(true)
  }

  const abrirEditar = (u) => {
    setForm({ ...u, password: '' })
    setModalEditar(u.id)
  }

  const handleCrear = (e) => {
    e.preventDefault()
    setUsuarios([...usuarios, { ...form, id: Date.now() }])
    setModalNuevo(false)
  }

  const handleEditar = (e) => {
    e.preventDefault()
    setUsuarios(usuarios.map(u => u.id === modalEditar ? { ...form, id: u.id } : u))
    setModalEditar(null)
  }

  const handleEliminar = () => {
    setUsuarios(usuarios.filter(u => u.id !== modalEliminar))
    setModalEliminar(null)
    // Validación extra: si borras el último de la página, retrocede una.
    if (usuariosPaginados.length === 1 && paginaActual > 1) {
        setPaginaActual(paginaActual - 1)
    }
  }

  return (
    <Layout tituloNavbar="Gestión de Usuarios">
      <div className="p-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Usuarios en vista', valor: usuariosFiltrados.length },
            { label: 'Activos',           valor: activos },
            { label: 'Inactivos',         valor: inactivos },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-medium text-gray-900">{stat.valor}</p>
            </div>
          ))}
        </div>

        {/* Contenedor de la Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tabs + botón Nuevo */}
          <div className="px-5 pt-3 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Las Pestañas */}
            <div className="flex gap-1 w-full sm:w-auto overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.id}
                  onClick={() => {
                    setTabActiva(tab.id);
                    setPaginaActual(1);
                    setBusqueda(''); // Limpiar buscador al cambiar de taller
                  }}
                  className={`px-4 py-2 text-xs rounded-t-lg transition-colors font-medium whitespace-nowrap ${
                    tabActiva === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  style={tabActiva === tab.id ? { background: '#1a3a5c' } : {}}>
                  {tab.nombre}
                </button>
              ))}
            </div>

            {/* CONTROLES: Buscador y Botón */}
            <div className="flex items-center gap-3 w-full sm:w-auto pb-3 sm:pb-0 sm:mb-2">
              
              {/* --- EL INPUT DEL BUSCADOR --- */}
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1); // Regresar a la pág 1 al buscar
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Botón Nuevo */}
              <button onClick={abrirNuevo}
                className="px-3.5 py-1.5 text-white text-xs rounded-lg transition-colors hover:bg-opacity-90 flex-shrink-0"
                style={{ background: '#1a3a5c' }}>
                + Nuevo
              </button>
            </div>
          </div>

          {/* Tabla */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">Nombre</th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">Email</th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">Rol</th>
                {tabActiva === 'todos' && (
                  <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">Taller</th>
                )}
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">Estado</th>
                <th className="px-5 py-3 text-left text-xs text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((u, i) => (
                <tr key={u.id} className={i !== usuariosPaginados.length - 1 ? 'border-b border-gray-50 hover:bg-gray-50/50' : 'hover:bg-gray-50/50'}>
                  <td className="px-5 py-3.5 text-gray-900 font-medium">{u.nombre}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${rolColor[u.rol] || 'bg-gray-100 text-gray-500'}`}>
                      {u.rol}
                    </span>
                  </td>
                  {tabActiva === 'todos' && (
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {talleresMock.find(t => t.id === u.tallerId)?.nombre || '-'}
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${u.estado === 'Activo' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => abrirEditar(u)} title="Editar"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = '#1a3a5c'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => setModalEliminar(u.id)} title="Eliminar"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = '#e02020'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuariosPaginados.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-sm text-gray-400">
                    No hay usuarios en este taller o página
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* CONTROLES DE PAGINACIÓN */}
          {totalPaginas > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-xs text-gray-500">
                Mostrando página <span className="font-medium text-gray-900">{paginaActual}</span> de <span className="font-medium text-gray-900">{totalPaginas}</span>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Nuevo */}
        {modalNuevo && (
          <Modal title="Nuevo usuario" onClose={() => setModalNuevo(false)}>
            <FormUsuario form={form} setForm={setForm}
              onSubmit={handleCrear} onClose={() => setModalNuevo(false)}
              submitLabel="Crear usuario"/>
          </Modal>
        )}

        {/* Modal Editar */}
        {modalEditar && (
          <Modal title="Editar usuario" onClose={() => setModalEditar(null)}>
            <FormUsuario form={form} setForm={setForm}
              onSubmit={handleEditar} onClose={() => setModalEditar(null)}
              submitLabel="Guardar cambios"/>
          </Modal>
        )}

        {/* Modal Eliminar */}
        {modalEliminar && (
          <Modal title="Eliminar usuario" onClose={() => setModalEliminar(null)}>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setModalEliminar(null)}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleEliminar}
                className="flex-1 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors shadow-sm">
                Sí, eliminar
              </button>
            </div>
          </Modal>
        )}

      </div>
    </Layout>
  )
}

export default Usuarios