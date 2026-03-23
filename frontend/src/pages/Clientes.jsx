import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { clientesMock, TIPOS_VEHICULO, COMBUSTIBLES } from '../services/mockData'

const INIT_FORM = {
  nombre: '', dni: '', telefono: '', email: '',
  vehiculo: { placa: '', marca: '', modelo: '', anio: '', color: '', combustible: 'Gasolina', tipo: 'Auto' },
}

const ROWS_PER_PAGE = 8

/* ─── UI Primitives (mismo estilo que Productos) ─────────────────── */
function Overlay({ onClose }) {
  return <div onClick={onClose} className="fixed inset-0 z-40"
    style={{ background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(2px)' }} />
}

function Modal({ title, onClose, children, wide }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl overflow-hidden shadow-2xl`}
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
          <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: '80vh' }}>{children}</div>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ color = '#1a3a5c', children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{children}</span>
    </div>
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

function SInput({ type = 'text', extraStyle, ...props }) {
  const [f, setF] = useState(false)
  return <input type={type} {...props} className={inputCls}
    style={{ ...baseInput, ...(f ? focusInput : {}), ...extraStyle }}
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

function ActionBtn({ icon, title, onClick, hoverBg = '#1a3a5c' }) {
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
    cita: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
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

/* ─── Main ───────────────────────────────────────────────────────── */
export default function Clientes() {
  const { user } = useAuth()
  const [clientes, setClientes]           = useState(clientesMock)
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [modalEditar, setModalEditar]     = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [search, setSearch]               = useState('')
  const [sort, setSort]                   = useState({ col: 'nombre', dir: 'asc' })
  const [page, setPage]                   = useState(1)
  const [tipoFilter, setTipoFilter]       = useState('Todos')
  const [citaFilter, setCitaFilter]       = useState('Todos')
  const [form, setForm]                   = useState(INIT_FORM)

  useEffect(() => setPage(1), [search, sort, tipoFilter, citaFilter])

  if (!user) return null

  const toggleSort = col => setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const filtered = useMemo(() => {
    let d = [...clientes]
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        c.dni.includes(q) ||
        c.vehiculo.placa.toLowerCase().includes(q) ||
        c.telefono.includes(q)
      )
    }
    if (tipoFilter !== 'Todos') d = d.filter(c => c.vehiculo.tipo === tipoFilter)
    if (citaFilter === 'Con cita') d = d.filter(c => c.tieneCita)
    if (citaFilter === 'Sin cita') d = d.filter(c => !c.tieneCita)
    d.sort((a, b) => {
      const va = sort.col === 'placa' ? a.vehiculo.placa : (a[sort.col] ?? '')
      const vb = sort.col === 'placa' ? b.vehiculo.placa : (b[sort.col] ?? '')
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
    return d
  }, [clientes, search, sort, tipoFilter, citaFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const conCita = clientes.filter(c => c.tieneCita).length
  const sinCita = clientes.filter(c => !c.tieneCita).length

  const setVehiculo = (field, value) =>
    setForm({ ...form, vehiculo: { ...form.vehiculo, [field]: value } })

  const handleCrear = e => {
    e.preventDefault()
    setClientes(prev => [{ ...form, id: Date.now(), tieneCita: false }, ...prev])
    setModalNuevo(false)
  }

  const handleEditar = e => {
    e.preventDefault()
    setClientes(prev => prev.map(c => c.id === modalEditar ? { ...c, ...form } : c))
    setModalEditar(null)
  }

  const handleEliminar = () => {
    setClientes(prev => prev.filter(c => c.id !== modalEliminar))
    setModalEliminar(null)
  }

  const TH = ({ col, label, width }) => (
    <th onClick={() => col && toggleSort(col)}
      className="px-4 py-3 text-left select-none"
      style={{ width, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {label}{col && <SortIcon dir={sort.col === col ? sort.dir : null} />}
      </span>
    </th>
  )

  const tiposOpts = TIPOS_VEHICULO || ['Auto', 'SUV', 'Camioneta', 'Moto', 'Camión', 'Furgoneta']
  const combustiblesOpts = COMBUSTIBLES || ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'GLP', 'GNV']

  return (
    <Layout tituloNavbar="Gestión de Clientes Global">
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
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Directorio de Clientes</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Base de datos unificada de propietarios y vehículos</p>
          </div>
          <button onClick={() => { setForm(INIT_FORM); setModalNuevo(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm"
            style={{ background: '#1a3a5c' }}
            onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Registrar Cliente
          </button>
        </div>

        {/* Stat cards — mismo estilo que Productos */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Clientes',  value: clientes.length, icon: '👥', accent: '#1a3a5c' },
            { label: 'Con Cita Activa', value: conCita,         icon: '📅', accent: '#15803d' },
            { label: 'Sin Cita',        value: sinCita,         icon: '🕐', accent: '#94a3b8' },
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

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, DNI o placa…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
                onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'none' }} />
            </div>

            {[
              { value: tipoFilter, setter: setTipoFilter, options: ['Todos', ...tiposOpts] },
              { value: citaFilter, setter: setCitaFilter, options: ['Todos', 'Con cita', 'Sin cita'] },
            ].map((f, i) => (
              <select key={i} value={f.value} onChange={e => f.setter(e.target.value)}
                className="py-2 pl-3 pr-7 text-xs rounded-lg outline-none transition-all"
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}

            <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>
              {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <TH col="nombre"   label="Cliente / Propietario" width="24%" />
                  <TH col="dni"      label="DNI / RUC"             width="12%" />
                  <TH col="placa"    label="Vehículo"              width="20%" />
                  <TH col="telefono" label="Contacto"              width="18%" />
                  <TH               label="Cita"                   width="12%" />
                  <TH               label="Acciones"               width="10%" />
                </tr>
              </thead>
              <tbody>
                {rows.map(c => (
                  <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafcff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    {/* Nombre */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center flex-shrink-0 rounded-full text-white text-xs font-semibold"
                          style={{ width: 32, height: 32, background: '#1a3a5c' }}>
                          {c.nombre.split(' ').slice(0, 2).map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium" style={{ color: '#1e293b' }}>{c.nombre}</span>
                      </div>
                    </td>

                    {/* DNI */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono" style={{ color: '#475569' }}>{c.dni}</span>
                    </td>

                    {/* Vehículo */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold tracking-widest mb-1"
                        style={{ background: '#1e293b', color: '#fff', fontFamily: 'monospace' }}>
                        {c.vehiculo.placa}
                      </span>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>
                        {c.vehiculo.tipo?.toUpperCase()} · {c.vehiculo.marca} {c.vehiculo.modelo}
                      </p>
                    </td>

                    {/* Contacto */}
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: '#475569' }}>{c.telefono}</p>
                      <p className="text-xs truncate" style={{ color: '#94a3b8', maxWidth: 160 }}>{c.email || 'Sin correo'}</p>
                    </td>

                    {/* Cita */}
                    <td className="px-4 py-3">
                      {c.tieneCita ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: '#f0fdf4', color: '#15803d' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                          Cita Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
                          Sin cita
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon="cita"   title="Ver / Crear cita" hoverBg="#2a5f94" onClick={() => {}} />
                        <ActionBtn icon="edit"   title="Editar"           hoverBg="#1a3a5c" onClick={() => { setForm(c); setModalEditar(c.id) }} />
                        <ActionBtn icon="delete" title="Eliminar"         hoverBg="#dc2626" onClick={() => setModalEliminar(c.id)} />
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-14 text-center" style={{ color: '#94a3b8' }}>
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
      </div>

      {/* Modal Nuevo / Editar */}
      {(modalNuevo || modalEditar) && (
        <Modal title={modalNuevo ? 'Nuevo Cliente' : 'Editar Cliente'}
          onClose={() => { setModalNuevo(false); setModalEditar(null) }} wide>
          <form onSubmit={modalNuevo ? handleCrear : handleEditar}>

            <div className="mb-5">
              <SectionTitle color="#1a3a5c">Información del Propietario</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre Completo" span={2}>
                  <SInput required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </Field>
                <Field label="DNI / RUC">
                  <SInput value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} />
                </Field>
                <Field label="Teléfono">
                  <SInput value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </Field>
                <Field label="Correo Electrónico (Opcional)" span={2}>
                  <SInput type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </Field>
              </div>
            </div>

            <div style={{ height: 1, background: '#f1f5f9', marginBottom: 16 }} />

            <div className="mb-5">
              <SectionTitle color="#2a5f94">Información del Vehículo</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Placa">
                  <SInput required value={form.vehiculo.placa}
                    onChange={e => setVehiculo('placa', e.target.value.toUpperCase())}
                    extraStyle={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 600 }} />
                </Field>
                <Field label="Marca">
                  <SInput value={form.vehiculo.marca} onChange={e => setVehiculo('marca', e.target.value)} />
                </Field>
                <Field label="Modelo">
                  <SInput value={form.vehiculo.modelo} onChange={e => setVehiculo('modelo', e.target.value)} />
                </Field>
                <Field label="Año">
                  <SInput type="number" placeholder="2022" min={1990} max={2030}
                    value={form.vehiculo.anio} onChange={e => setVehiculo('anio', e.target.value)} />
                </Field>
                <Field label="Color">
                  <SInput value={form.vehiculo.color} onChange={e => setVehiculo('color', e.target.value)} />
                </Field>
                <Field label="Combustible">
                  <SSelect value={form.vehiculo.combustible} onChange={e => setVehiculo('combustible', e.target.value)}>
                    {combustiblesOpts.map(c => <option key={c}>{c}</option>)}
                  </SSelect>
                </Field>
                <Field label="Tipo de Vehículo" span={2}>
                  <SSelect value={form.vehiculo.tipo} onChange={e => setVehiculo('tipo', e.target.value)}>
                    {tiposOpts.map(t => <option key={t}>{t}</option>)}
                  </SSelect>
                </Field>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => { setModalNuevo(false); setModalEditar(null) }}
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
                {modalNuevo ? 'Registrar Cliente y Vehículo' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <Modal title="Eliminar cliente" onClose={() => setModalEliminar(null)}>
          <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl"
            style={{ background: '#fff5f5', border: '1px solid #fee2e2' }}>
            <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm" style={{ color: '#991b1b', lineHeight: 1.5 }}>
              Esta acción es permanente. Se eliminará el cliente y toda su información registrada.
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