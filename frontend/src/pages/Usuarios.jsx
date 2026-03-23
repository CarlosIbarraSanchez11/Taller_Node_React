import { useState, useMemo, useEffect } from 'react'
import { usuariosMock, talleresMock, usuarioLogueado } from '../services/mockData'
import Layout from '../components/layout/Layout'

const rolesOpciones = ['Jefe Mecánico', 'Mecánico', 'Call', 'Logística', 'Facturación', 'Limpieza']

const ROL_STYLE = {
  'Admin':         { dot: '#dc2626', bg: '#fff5f5', color: '#c53030' },
  'Gerente':       { dot: '#059669', bg: '#ecfdf5', color: '#047857' },
  'Jefe Mecánico': { dot: '#2563eb', bg: '#eff6ff', color: '#1d4ed8' },
  'Mecánico':      { dot: '#7c3aed', bg: '#faf5ff', color: '#6d28d9' },
  'Call':          { dot: '#ea580c', bg: '#fff7ed', color: '#c2410c' },
  'Logística':     { dot: '#0891b2', bg: '#ecfeff', color: '#0e7490' },
  'Facturación':   { dot: '#4f46e5', bg: '#eef2ff', color: '#4338ca' },
  'Limpieza':      { dot: '#64748b', bg: '#f8fafc', color: '#475569' },
}

const initialForm = { nombre: '', email: '', password: '', rol: 'Mecánico', estado: 'Activo', tallerId: 1 }
const ROWS_PER_PAGE = 10

/* ─── UI Primitives (mismo estilo que Productos) ─────────────────── */
function Overlay({ onClose }) {
  return <div onClick={onClose} className="fixed inset-0 z-40"
    style={{ background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(2px)' }} />
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
          style={{ pointerEvents: 'auto', background: '#fff', border: '1px solid #e2e8f0', animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width: 6, height: 6, borderRadius: 3, background: '#1a3a5c' }} />
              <span className="text-sm font-semibold text-gray-800 tracking-tight">{title}</span>
            </div>
            <button onClick={onClose}
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ width: 28, height: 28, color: '#94a3b8' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  )
}

function Field({ label, children, span }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const baseInput = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
const focusInput = { border: '1px solid #1a3a5c', background: '#fff', boxShadow: '0 0 0 3px rgba(26,58,92,0.08)' }
const inputCls = 'w-full px-3 py-2 text-sm rounded-lg outline-none transition-all'

function SInput({ type = 'text', ...props }) {
  const [f, setF] = useState(false)
  return <input type={type} {...props} className={inputCls}
    style={{ ...baseInput, ...(f ? focusInput : {}) }}
    onFocus={() => setF(true)} onBlur={() => setF(false)} />
}

function SSelect({ children, ...props }) {
  const [f, setF] = useState(false)
  return <select {...props} className={inputCls}
    style={{ ...baseInput, ...(f ? focusInput : {}), cursor: 'pointer' }}
    onFocus={() => setF(true)} onBlur={() => setF(false)}>
    {children}
  </select>
}

function ActionBtn({ icon, title, hoverBg, onClick }) {
  const [hov, setHov] = useState(false)
  const icons = {
    edit: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>,
    delete: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>,
  }
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center justify-center rounded-lg transition-all"
      style={{ width: 28, height: 28, background: hov ? hoverBg : 'transparent', color: hov ? '#fff' : '#94a3b8', border: '1px solid', borderColor: hov ? hoverBg : '#e2e8f0' }}>
      {icons[icon]}
    </button>
  )
}

/* ─── Sort Icon ──────────────────────────────────────────────────── */
function SortIcon({ dir }) {
  return (
    <span style={{ opacity: dir ? 1 : 0.3, marginLeft: 4, display: 'inline-flex', flexDirection: 'column', gap: 1.5 }}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
        <path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'asc' ? '#1a3a5c' : '#94a3b8'} />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ transform: 'rotate(180deg)' }}>
        <path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'desc' ? '#1a3a5c' : '#94a3b8'} />
      </svg>
    </span>
  )
}

/* ─── Form Usuario ───────────────────────────────────────────────── */
function FormUsuario({ form, setForm, onSubmit, onClose, submitLabel }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="Nombre completo" span={2}>
          <SInput required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        </Field>
        <Field label="Email" span={2}>
          <SInput type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Contraseña">
          <SInput type="password" value={form.password} placeholder="••••••••"
            onChange={e => setForm({ ...form, password: e.target.value })} />
        </Field>
        <Field label="Rol">
          <SSelect value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
            {rolesOpciones.map(r => <option key={r}>{r}</option>)}
          </SSelect>
        </Field>
        <Field label="Taller asignado">
          <SSelect value={form.tallerId} onChange={e => setForm({ ...form, tallerId: Number(e.target.value) })}>
            {talleresMock.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </SSelect>
        </Field>
        <Field label="Estado">
          <SSelect value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
            <option>Activo</option>
            <option>Inactivo</option>
          </SSelect>
        </Field>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2 text-sm rounded-lg font-medium transition-colors"
          style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 py-2 text-sm rounded-lg font-medium text-white transition-all"
          style={{ background: '#1a3a5c' }}
          onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
          onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

/* ─── Data Table ─────────────────────────────────────────────────── */
function DataTable({ data, showTaller, onEdit, onDelete }) {
  const [sort, setSort]             = useState({ col: 'nombre', dir: 'asc' })
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [rolFilter, setRolFilter]   = useState('Todos')
  const [estadoFilter, setEstadoFilter] = useState('Todos')

  useEffect(() => setPage(1), [search, rolFilter, estadoFilter, sort])

  const toggleSort = col =>
    setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const filtered = useMemo(() => {
    let d = [...data]
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(u =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q)
      )
    }
    if (rolFilter !== 'Todos') d = d.filter(u => u.rol === rolFilter)
    if (estadoFilter !== 'Todos') d = d.filter(u => u.estado === estadoFilter)
    d.sort((a, b) => {
      const va = a[sort.col] ?? ''
      const vb = b[sort.col] ?? ''
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
    return d
  }, [data, search, rolFilter, estadoFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const TH = ({ col, label, width }) => (
    <th onClick={() => col && toggleSort(col)}
      className="px-4 py-3 text-left select-none"
      style={{ width, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {label}{col && <SortIcon dir={sort.col === col ? sort.dir : null} />}
      </span>
    </th>
  )

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o rol…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
            onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
            onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'none' }} />
        </div>

        {[
          { value: rolFilter,    setter: setRolFilter,    options: ['Todos', ...rolesOpciones, 'Admin', 'Gerente'] },
          { value: estadoFilter, setter: setEstadoFilter, options: ['Todos', 'Activo', 'Inactivo'] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.setter(e.target.value)}
            className="py-2 pl-3 pr-7 text-xs rounded-lg outline-none transition-all"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}

        <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>
          {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <TH col="nombre" label="Nombre"   width="24%" />
              <TH col="email"  label="Email"    width="24%" />
              <TH col="rol"    label="Rol"      width="15%" />
              {showTaller && <TH label="Taller" width="13%" />}
              <TH col="estado" label="Estado"   width="11%" />
              <TH              label="Acciones" width="8%"  />
            </tr>
          </thead>
          <tbody>
            {rows.map(u => {
              const rs = ROL_STYLE[u.rol] || { dot: '#94a3b8', bg: '#f1f5f9', color: '#475569' }
              return (
                <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafcff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Nombre con avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center flex-shrink-0 rounded-full text-white text-xs font-semibold"
                        style={{ width: 30, height: 30, background: '#1a3a5c' }}>
                        {u.nombre.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#1e293b' }}>{u.nombre}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: '#64748b' }}>{u.email}</span>
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: rs.bg, color: rs.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: rs.dot, flexShrink: 0 }} />
                      {u.rol}
                    </span>
                  </td>

                  {/* Taller */}
                  {showTaller && (
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-md font-medium"
                        style={{ background: '#f1f5f9', color: '#64748b' }}>
                        {talleresMock.find(t => t.id === u.tallerId)?.nombre || '—'}
                      </span>
                    </td>
                  )}

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={u.estado === 'Activo'
                        ? { background: '#f0fdf4', color: '#15803d' }
                        : { background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: u.estado === 'Activo' ? '#22c55e' : '#cbd5e1' }} />
                      {u.estado}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <ActionBtn icon="edit"   title="Editar"   hoverBg="#1a3a5c" onClick={() => onEdit(u)} />
                      <ActionBtn icon="delete" title="Eliminar" hoverBg="#dc2626" onClick={() => onDelete(u.id)} />
                    </div>
                  </td>
                </tr>
              )
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={showTaller ? 6 : 5} className="py-14 text-center" style={{ color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                  <p className="text-sm font-medium">Sin resultados</p>
                  <p className="text-xs mt-1">Intenta con otros filtros de búsqueda</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
          <span className="text-xs" style={{ color: '#94a3b8' }}>Pág. {page} de {totalPages}</span>
          <div className="flex items-center gap-1">
            {[
              { label: '«', action: () => setPage(1),                               disabled: page === 1 },
              { label: '‹', action: () => setPage(p => Math.max(1, p - 1)),         disabled: page === 1 },
              { label: '›', action: () => setPage(p => Math.min(totalPages, p + 1)),disabled: page === totalPages },
              { label: '»', action: () => setPage(totalPages),                      disabled: page === totalPages },
            ].map((b, i) => (
              <button key={i} onClick={b.action} disabled={b.disabled}
                className="flex items-center justify-center rounded-lg text-sm transition-all"
                style={{ width: 30, height: 30, border: '1px solid #e2e8f0', color: b.disabled ? '#cbd5e1' : '#475569', background: '#fff', cursor: b.disabled ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}
                onMouseEnter={e => { if (!b.disabled) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────── */
function Usuarios() {
  const esAdmin = usuarioLogueado.rol === 'Admin'

  const tabs = esAdmin
    ? [{ id: 'todos', nombre: 'Todos' }, ...talleresMock]
    : talleresMock.filter(t => t.id === usuarioLogueado.tallerId)

  const [tabActiva, setTabActiva]         = useState(tabs[0].id)
  const [usuarios, setUsuarios]           = useState(usuariosMock)
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [modalEditar, setModalEditar]     = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [form, setForm]                   = useState(initialForm)

  const usuariosFiltrados = tabActiva === 'todos'
    ? usuarios.filter(u => u.tallerId !== null)
    : usuarios.filter(u => u.tallerId === tabActiva)

  const activos   = usuariosFiltrados.filter(u => u.estado === 'Activo').length
  const inactivos = usuariosFiltrados.filter(u => u.estado === 'Inactivo').length

  const abrirNuevo = () => {
    setForm({ ...initialForm, tallerId: tabActiva === 'todos' ? 1 : tabActiva })
    setModalNuevo(true)
  }

  const abrirEditar = u => {
    setForm({ ...u, password: '' })
    setModalEditar(u.id)
  }

  const handleCrear = e => {
    e.preventDefault()
    setUsuarios(prev => [...prev, { ...form, id: Date.now() }])
    setModalNuevo(false)
  }

  const handleEditar = e => {
    e.preventDefault()
    setUsuarios(prev => prev.map(u => u.id === modalEditar ? { ...form, id: u.id } : u))
    setModalEditar(null)
  }

  const handleEliminar = () => {
    setUsuarios(prev => prev.filter(u => u.id !== modalEliminar))
    setModalEliminar(null)
  }

  return (
    <Layout tituloNavbar="Gestión de Usuarios">
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(6px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
      `}</style>

      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Usuarios</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Gestión de cuentas y accesos</p>
          </div>
          <button onClick={abrirNuevo}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm"
            style={{ background: '#1a3a5c' }}
            onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo usuario
          </button>
        </div>

        {/* Stat cards — mismo estilo que Productos */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Usuarios en vista', value: usuariosFiltrados.length, icon: '👥', accent: '#1a3a5c' },
            { label: 'Activos',           value: activos,                  icon: '✅', accent: '#15803d' },
            { label: 'Inactivos',         value: inactivos,                icon: '⏸',  accent: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 bg-white"
              style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
              </div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: s.accent }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex items-center gap-1 mb-4">
            {tabs.map(tab => {
              const active = tabActiva === tab.id
              return (
                <button key={tab.id} onClick={() => setTabActiva(tab.id)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  style={{
                    background: active ? '#1a3a5c' : '#fff',
                    color: active ? '#fff' : '#64748b',
                    border: active ? '1px solid #1a3a5c' : '1px solid #e2e8f0',
                    boxShadow: active ? '0 2px 8px rgba(26,58,92,0.18)' : 'none',
                  }}>
                  {tab.nombre}
                </button>
              )
            })}
          </div>
        )}

        <DataTable
          data={usuariosFiltrados}
          showTaller={tabActiva === 'todos'}
          onEdit={abrirEditar}
          onDelete={setModalEliminar}
        />
      </div>

      {/* Modal Nuevo */}
      {modalNuevo && (
        <Modal title="Nuevo usuario" onClose={() => setModalNuevo(false)}>
          <FormUsuario form={form} setForm={setForm}
            onSubmit={handleCrear} onClose={() => setModalNuevo(false)}
            submitLabel="Crear usuario" />
        </Modal>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <Modal title="Editar usuario" onClose={() => setModalEditar(null)}>
          <FormUsuario form={form} setForm={setForm}
            onSubmit={handleEditar} onClose={() => setModalEditar(null)}
            submitLabel="Guardar cambios" />
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <Modal title="Eliminar usuario" onClose={() => setModalEliminar(null)}>
          <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl"
            style={{ background: '#fff5f5', border: '1px solid #fee2e2' }}>
            <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm" style={{ color: '#991b1b', lineHeight: 1.5 }}>
              Esta acción es permanente. El usuario perderá acceso inmediatamente.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModalEliminar(null)}
              className="flex-1 py-2 text-sm rounded-lg font-medium"
              style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}>
              Cancelar
            </button>
            <button onClick={handleEliminar}
              className="flex-1 py-2 text-sm rounded-lg font-medium text-white"
              style={{ background: '#dc2626' }}
              onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
              onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}>
              Sí, eliminar
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}

export default Usuarios