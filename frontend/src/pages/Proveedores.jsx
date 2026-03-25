import { useState, useEffect, useMemo } from 'react'
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import Layout from '../components/layout/Layout'

const INIT_FORM = {
  ruc: '', razonSocial: '', telefono: '', email: '', direccion: '', categoria: 'Repuestos', estado: 'Activo'
}

const ROWS_PER_PAGE = 8

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
        <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
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

function ActionBtn({ icon, title, hoverBg = '#1a3a5c', onClick }) {
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
    toggle_on: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="1" y="5" width="22" height="14" rx="7" /><circle cx="16" cy="12" r="3" fill="currentColor" />
    </svg>,
    toggle_off: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="1" y="5" width="22" height="14" rx="7" /><circle cx="8" cy="12" r="3" fill="currentColor" />
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

/* ─── Data Table ─────────────────────────────────────────────────── */
function DataTable({ data, onEdit, onDelete, onToggle }) {
  const [sort, setSort]             = useState({ col: 'razonSocial', dir: 'asc' })
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [estadoFilter, setEstadoFilter] = useState('Todos')

  useEffect(() => setPage(1), [search, estadoFilter, sort])

  const toggleSort = col =>
    setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const filtered = useMemo(() => {
    let d = [...data]
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(p =>
        p.razonSocial.toLowerCase().includes(q) ||
        p.ruc.includes(q) ||
        (p.email || '').toLowerCase().includes(q)
      )
    }
    if (estadoFilter !== 'Todos') d = d.filter(p => p.estado === estadoFilter)
    d.sort((a, b) => {
      const va = a[sort.col] ?? ''
      const vb = b[sort.col] ?? ''
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
    return d
  }, [data, search, estadoFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  function initials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
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
            placeholder="Buscar por razón social, RUC o email…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
            onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
            onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'none' }} />
        </div>

        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)}
          className="py-2 pl-3 pr-7 text-xs rounded-lg outline-none transition-all"
          style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
          {['Todos', 'Activo', 'Inactivo'].map(o => <option key={o}>{o}</option>)}
        </select>

        <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>
          {filtered.length} {filtered.length === 1 ? 'proveedor' : 'proveedores'}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <TH col="razonSocial" label="RUC / Razón Social" width="30%" />
              <TH                   label="Contacto"            width="28%" />
              <TH col="direccion"   label="Dirección"           width="22%" />
              <TH col="estado"      label="Estado"              width="10%" />
              <TH                   label="Acciones"            width="10%" />
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafcff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                {/* Razón social */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center flex-shrink-0 rounded-xl text-white text-xs font-bold"
                      style={{ width: 36, height: 36, background: p.estado === 'Activo' ? '#1a3a5c' : '#cbd5e1' }}>
                      {initials(p.razonSocial)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{p.razonSocial}</p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: '#94a3b8' }}>RUC: {p.ruc}</p>
                    </div>
                  </div>
                </td>

                {/* Contacto */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {p.telefono && (
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l1.17-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="text-sm" style={{ color: '#475569' }}>{p.telefono}</span>
                      </div>
                    )}
                    {p.email && (
                      <div className="flex items-center gap-1.5">
                        <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span className="text-xs truncate" style={{ color: '#64748b', maxWidth: 200 }}>{p.email}</span>
                      </div>
                    )}
                    {!p.telefono && !p.email && (
                      <span className="text-xs" style={{ color: '#cbd5e1' }}>Sin contacto</span>
                    )}
                  </div>
                </td>

                {/* Dirección */}
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: '#64748b', lineHeight: 1.5 }}>
                    {p.direccion || '—'}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={p.estado === 'Activo'
                      ? { background: '#f0fdf4', color: '#15803d' }
                      : { background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: p.estado === 'Activo' ? '#22c55e' : '#cbd5e1' }} />
                    {p.estado}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <ActionBtn
                      icon={p.estado === 'Activo' ? 'toggle_on' : 'toggle_off'}
                      title={p.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      hoverBg={p.estado === 'Activo' ? '#d97706' : '#15803d'}
                      
                      // CAMBIO AQUÍ: Enviamos el objeto 'p' completo, no solo el id
                      onClick={() => onToggle(p)} 
                    />
                    
                    <ActionBtn icon="edit"   title="Editar"   hoverBg="#1a3a5c" onClick={() => onEdit(p)} />
                    <ActionBtn icon="delete" title="Eliminar" hoverBg="#dc2626" onClick={() => onDelete(p.id)} />
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-14 text-center" style={{ color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
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

function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{ 
      background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, 
      padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16, 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      animation: 'modalIn .2s ease-out' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontWeight: 600 }}>{message}</span>
      </div>
      <button type="button" onClick={onClose} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18, lineHeight: 1 }}>
        ×
      </button>
    </div>
  );
}

/* ─── Form Proveedor ─────────────────────────────────────────────── */
function FormProveedor({ form, setForm, onSubmit, onClose, submitLabel, saving, error, onClearError }) {
  return (
    <form onSubmit={onSubmit}>
      {/* ─── Aquí es donde se conecta la alerta roja ─── */}
      <ErrorAlert message={error} onClose={onClearError} />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="RUC (11 dígitos)" span={2}>
          <SInput 
            required placeholder="Ej: 20600000000" maxLength={11}
            disabled={saving}
            value={form.ruc} 
            onChange={e => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '') })} 
          />
        </Field>

        <Field label="Razón Social / Nombre empresa" span={2}>
          <SInput 
            required placeholder="Ej: Repuestos El Chamo SAC"
            disabled={saving}
            value={form.razonSocial} 
            onChange={e => setForm({ ...form, razonSocial: e.target.value })} 
          />
        </Field>

        <Field label="Teléfono de contacto">
          <SInput 
            placeholder="999 999 999"
            disabled={saving}
            value={form.telefono} 
            onChange={e => setForm({ ...form, telefono: e.target.value })} 
          />
        </Field>

        <Field label="Correo electrónico">
          <SInput 
            type="email" placeholder="ventas@proveedor.com"
            disabled={saving}
            value={form.email} 
            onChange={e => setForm({ ...form, email: e.target.value })} 
          />
        </Field>

        <Field label="Dirección fiscal / Oficina" span={2}>
          <textarea 
            rows={3} placeholder="Av. Las Malvinas 123, Lima..."
            disabled={saving}
            value={form.direccion} 
            onChange={e => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all disabled:opacity-50"
            style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', resize: 'vertical' }}
            onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
            onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'none' }} 
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onClose} disabled={saving}
          className="flex-1 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-40"
          style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}>
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2 text-sm rounded-lg font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#1a3a5c' }}>
          {saving && (
            <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="4"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          )}
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Proveedores() {
  const { user } = useAuth()
  
  // ─── 1. ESTADOS REALES ───
  const [proveedores, setProveedores]     = useState([]) // Empezamos vacío
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [modalEditar, setModalEditar]     = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [form, setForm]                   = useState(INIT_FORM)

  // Estados para alertas de error (Caja roja)
  const [errorNuevo, setErrorNuevo]       = useState('')
  const [errorEditar, setErrorEditar]     = useState('')
  const [errorEliminar, setErrorEliminar] = useState('')

  // ─── 2. CARGA DE DATOS ───
  const fetchProveedores = async () => {
    try {
      setLoading(true)
      const res = await api.get('/proveedores')
      setProveedores(res.data)
    } catch (err) {
      console.error("Error al cargar proveedores:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchProveedores()
  }, [user])

  if (!user || loading) return null // O podrías poner un spinner como en Productos

  const activos   = proveedores.filter(p => p.estado === 'Activo').length
  const inactivos = proveedores.filter(p => p.estado === 'Inactivo').length

  // ─── 3. HANDLERS CON BACKEND ───

  const handleToggle = async (p) => {
    // Verificamos qué está llegando para evitar el error
    if (!p || !p.id) {
      console.error("Error: El objeto proveedor no tiene un ID válido", p);
      return;
    }

    try {
      const nuevoEstado = p.estado === 'Activo' ? 'Inactivo' : 'Activo';

      // Llamada al backend usando el ID real de la base de datos
      await api.put(`/proveedores/${p.id}`, {
        ...p,
        estado: nuevoEstado
      });

      // 1. Refrescamos la lista completa para actualizar los contadores de arriba
      await fetchProveedores(); 
      
    } catch (err) {
      console.error("Error al cambiar el estado del proveedor:", err);
    }
  };

  const abrirNuevo  = () => { 
    setForm(INIT_FORM); 
    setErrorNuevo(''); 
    setModalNuevo(true) 
  }
  
  const abrirEditar = p  => { 
    setForm({ ...p }); 
    setErrorEditar(''); 
    setModalEditar(p.id) 
  }

  const handleCrear = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorNuevo(''); // Limpiamos cualquier error previo

    try {
      const { id, ...datosLimpios } = form;
      await api.post('/proveedores', datosLimpios);

      // Si todo va bien, cerramos y limpiamos
      await fetchProveedores();
      setModalNuevo(false);
      setForm(INIT_FORM);
    } catch (err) {
      // AQUÍ ESTÁ EL TRUCO:
      // Extraemos el mensaje que configuramos en el backend (handlePrismaError)
      const mensajeDeError = err.response?.data?.error || 'Error al guardar el proveedor';
      
      // Lo guardamos en el estado que controla la alerta roja del modal
      setErrorNuevo(mensajeDeError); 
      
      // NO cerramos el modal, para que el usuario pueda ver el error y corregir el RUC
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async e => {
    e.preventDefault()
    setSaving(true)
    setErrorEditar('')
    try {
      await api.put(`/proveedores/${modalEditar}`, form)
      await fetchProveedores()
      setModalEditar(null)
    } catch (err) {
      setErrorEditar(err.response?.data?.error ?? 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async () => {
    setSaving(true)
    setErrorEliminar('')
    try {
      await api.delete(`/proveedores/${modalEliminar}`)
      await fetchProveedores()
      setModalEliminar(null)
    } catch (err) {
      setErrorEliminar(err.response?.data?.error ?? 'Error al eliminar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout tituloNavbar="Proveedores">
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
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Gestión de Proveedores</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Directorio centralizado de suministros corporativos</p>
          </div>
          <button onClick={abrirNuevo}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm"
            style={{ background: '#1a3a5c' }}
            onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Proveedor
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Registrados', value: proveedores.length, icon: '🏢', accent: '#1a3a5c' },
            { label: 'Convenios Activos', value: activos,             icon: '✅', accent: '#15803d' },
            { label: 'Inactivos',          value: inactivos,          icon: '⏸',  accent: '#94a3b8' },
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

        <DataTable
          data={proveedores}
          onEdit={abrirEditar}
          onDelete={setModalEliminar}
          onToggle={handleToggle}
        />
      </div>

      {/* Modal Nuevo */}
      {modalNuevo && (
        <Modal title="Nuevo Proveedor" onClose={() => setModalNuevo(false)}>
          <FormProveedor 
            form={form} 
            setForm={setForm}
            onSubmit={handleCrear} 
            onClose={() => setModalNuevo(false)}
            submitLabel="Guardar Proveedor"
            saving={saving}           // <--- Nuevo
            error={errorNuevo}        // <--- Nuevo
            onClearError={() => setErrorNuevo('')} // <--- Nuevo
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <Modal title="Editar Proveedor" onClose={() => setModalEditar(null)}>
          <FormProveedor 
            form={form} setForm={setForm}
            onSubmit={handleEditar} 
            onClose={() => setModalEditar(null)}
            submitLabel="Actualizar Datos"
            saving={saving}
            error={errorEditar} // <--- Caja roja
            onClearError={() => setErrorEditar('')}
          />
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <Modal title="Eliminar proveedor" onClose={() => setModalEliminar(null)}>
          <ErrorAlert message={errorEliminar} onClose={() => setErrorEliminar('')} />
          <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl"
            style={{ background: '#fff5f5', border: '1px solid #fee2e2' }}>
            <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm" style={{ color: '#991b1b', lineHeight: 1.5 }}>
              Esta acción es permanente. El proveedor será eliminado del sistema y no podrá recuperarse.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModalEliminar(null)} disabled={saving}
              className="flex-1 py-2 text-sm rounded-lg font-medium"
              style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}>
              Cancelar
            </button>
            <button onClick={handleEliminar} disabled={saving}
              className="flex-1 py-2 text-sm rounded-lg font-medium text-white flex items-center justify-center gap-2"
              style={{ background: '#dc2626' }}>
              {saving && <span className="animate-spin">🌀</span>}
              {saving ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
