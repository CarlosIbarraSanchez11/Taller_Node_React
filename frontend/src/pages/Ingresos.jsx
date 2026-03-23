import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import {
  talleresMock,
  productosMock,
  proveedoresMock,
  movimientosMock,
  ORIGENES_INTERNOS,
  TIPO_CONFIG,
} from '../services/mockData'

const ROWS_PER_PAGE = 10

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
          <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: '85vh' }}>{children}</div>
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

function SInput({ ...props }) {
  const [f, setF] = useState(false)
  return <input {...props} className={inputCls} style={{ ...baseInput, ...(f ? focusInput : {}) }}
    onFocus={() => setF(true)} onBlur={() => setF(false)} />
}

function SSelect({ children, accentColor, ...props }) {
  const [f, setF] = useState(false)
  const accent = accentColor ? { border: `1px solid ${accentColor}40`, background: `${accentColor}08` } : {}
  return <select {...props} className={inputCls}
    style={{ ...baseInput, ...(f ? focusInput : {}), cursor: 'pointer', ...accent }}
    onFocus={() => setF(true)} onBlur={() => setF(false)}>{children}</select>
}

function ActionBtn({ icon, onClick, hoverBg = '#1a3a5c', danger, title }) {
  const [hov, setHov] = useState(false)
  const icons = {
    view:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    delete: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>,
    check:  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
  }
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center justify-center rounded-lg transition-all"
      style={{ width: 28, height: 28, background: hov ? (danger ? '#dc2626' : hoverBg) : 'transparent', color: hov ? '#fff' : '#94a3b8', border: '1px solid', borderColor: hov ? (danger ? '#dc2626' : hoverBg) : '#e2e8f0' }}>
      {icons[icon]}
    </button>
  )
}

function EstadoBadge({ estado }) {
  const cfg = {
    'Aprobado':   { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', border: '#bbf7d0' },
    'Pendiente':  { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b', border: '#fde68a' },
    'Solicitado': { bg: '#faf5ff', color: '#7c3aed', dot: '#8b5cf6', border: '#e9d5ff' },
  }[estado] || { bg: '#f8fafc', color: '#94a3b8', dot: '#cbd5e1', border: '#e2e8f0' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {estado}
    </span>
  )
}

function SortIcon({ dir }) {
  return (
    <span style={{ opacity: dir ? 1 : 0.3, marginLeft: 4, display: 'inline-flex', flexDirection: 'column', gap: 1.5 }}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'asc' ? '#1a3a5c' : '#94a3b8'} /></svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ transform: 'rotate(180deg)' }}><path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'desc' ? '#1a3a5c' : '#94a3b8'} /></svg>
    </span>
  )
}

/* ─── FormIngreso (lógica original intacta) ──────────────────────── */
function FormIngreso({ onSubmit, onClose, user }) {
  const esGlobal = user?.rol === 'Admin' || user?.rol === 'Gerente'
  const [tipo, setTipo]               = useState('con_ruc')
  const [productoId, setProductoId]   = useState('')
  const [tallerId, setTallerId]       = useState(esGlobal ? (talleresMock[0]?.id ?? 1) : user?.tallerId)
  const [tallerOrigenId, setTallerOrigenId] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [origen, setOrigen]           = useState(ORIGENES_INTERNOS[0])
  const [cantidad, setCantidad]       = useState(1)

  const todosProductos = useMemo(() => {
    const seen = new Set()
    return productosMock.filter(p => { if (seen.has(p.nombre)) return false; seen.add(p.nombre); return true })
  }, [])

  const stockPorSede = useMemo(() => {
    if (!productoId) return []
    const prodRef = productosMock.find(p => p.id === Number(productoId))
    if (!prodRef) return []
    return talleresMock.map(t => {
      const p = productosMock.find(x => x.nombre === prodRef.nombre && x.tallerId === t.id)
      return { id: t.id, taller: t.nombre, stock: p?.stockActual ?? 0 }
    })
  }, [productoId])

  const handleSubmit = e => {
    e.preventDefault()
    const sel  = productosMock.find(p => p.id === Number(productoId))
    const prov = proveedoresMock.find(p => p.id === Number(proveedorId))
    const tOrigenNom = talleresMock.find(t => t.id === Number(tallerOrigenId))?.nombre
    onSubmit({
      id: Date.now(),
      fecha: new Date().toISOString(),
      productoId: Number(productoId),
      productoNombre: sel?.nombre || 'Producto',
      marca: sel?.marca || 'S/M',
      tipo,
      origen: (tipo === 'interno' && origen === 'Transferencia entre talleres')
        ? `Transferencia desde ${tOrigenNom}`
        : (tipo === 'interno' ? origen : tipo === 'con_ruc' ? 'Compra con RUC' : 'Compra sin RUC'),
      cantidad: Number(cantidad),
      proveedorId:     tipo === 'con_ruc' ? Number(proveedorId) : null,
      proveedorNombre: tipo === 'con_ruc' ? prov?.razonSocial : null,
      tallerId,
      estado: tipo === 'interno' ? 'Solicitado' : 'Pendiente',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 3 tipo cards */}
      <div className="mb-5">
        <p className="text-xs font-semibold mb-2.5" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Tipo de ingreso
        </p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TIPO_CONFIG).map(([key, cfg]) => (
            <button key={key} type="button" onClick={() => { setTipo(key); setTallerOrigenId('') }}
              className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-center transition-all border-2"
              style={{ borderColor: tipo === key ? (cfg.border || '#1a3a5c') : '#f1f5f9', background: tipo === key ? (cfg.bg || '#f0f4ff') : '#f8fafc' }}>
              <span style={{ fontSize: 20 }}>{cfg.icon}</span>
              <p className="text-xs font-bold leading-tight" style={{ color: tipo === key ? cfg.color : '#475569' }}>{cfg.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Repuesto / Producto" span={2}>
          <SSelect required value={productoId} onChange={e => setProductoId(e.target.value)}>
            <option value="">Seleccionar del catálogo...</option>
            {todosProductos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.marca})</option>)}
          </SSelect>
        </Field>

        {tipo === 'interno' && origen === 'Transferencia entre talleres' && productoId && (
          <div className="col-span-2">
            <p className="text-xs font-semibold mb-2" style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Stock disponible en red
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${talleresMock.length}, 1fr)` }}>
              {stockPorSede.map(s => (
                <div key={s.id} className="p-2.5 rounded-xl text-center"
                  style={{ border: String(s.id) === String(tallerId) ? '1.5px dashed #cbd5e1' : '1px solid #e9edf2', background: String(s.id) === String(tallerId) ? '#f8fafc' : '#fff', opacity: String(s.id) === String(tallerId) ? 0.5 : 1 }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{s.taller}</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color: s.stock === 0 ? '#cbd5e1' : '#1a3a5c' }}>{s.stock}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {esGlobal ? (
          <Field label="Sede de Ingreso">
            <SSelect value={tallerId} onChange={e => setTallerId(Number(e.target.value))}>
              {talleresMock.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </SSelect>
          </Field>
        ) : (
          <Field label="Sede Local">
            <div className="px-3 py-2 text-sm rounded-lg font-semibold"
              style={{ border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569' }}>
              📍 {talleresMock.find(t => t.id === user?.tallerId)?.nombre}
            </div>
          </Field>
        )}

        <Field label="Cantidad">
          <SInput type="number" required min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
        </Field>

        {tipo === 'con_ruc' && (
          <Field label="Proveedor Registrado" span={2}>
            <SSelect required value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
              <option value="">Seleccionar proveedor...</option>
              {proveedoresMock.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
            </SSelect>
          </Field>
        )}

        {tipo === 'interno' && (
          <div className="col-span-2 space-y-3">
            <Field label="Motivo Interno" span={2}>
              <SSelect value={origen} onChange={e => setOrigen(e.target.value)}>
                {ORIGENES_INTERNOS.map(o => <option key={o} value={o}>{o}</option>)}
              </SSelect>
            </Field>
            {origen === 'Transferencia entre talleres' && (
              <div className="p-3.5 rounded-xl" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <label className="block mb-2 text-xs font-semibold" style={{ color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  ¿Desde qué taller solicitas?
                </label>
                <SSelect required value={tallerOrigenId} onChange={e => setTallerOrigenId(e.target.value)} accentColor="#7c3aed">
                  <option value="">Seleccionar sede origen con stock...</option>
                  {stockPorSede.filter(s => String(s.id) !== String(tallerId) && s.stock > 0).map(s => (
                    <option key={s.id} value={s.id}>{s.taller} ({s.stock} disponibles)</option>
                  ))}
                </SSelect>
                {stockPorSede.filter(s => String(s.id) !== String(tallerId) && s.stock > 0).length === 0 && (
                  <p className="text-xs mt-2 font-semibold" style={{ color: '#dc2626' }}>
                    ⚠️ No hay stock disponible en otras sedes.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview cantidad */}
      <div className="rounded-xl p-3 mb-4 text-center" style={{ background: '#f8fafc', border: '1px solid #e9edf2' }}>
        <p className="text-xs font-semibold mb-0.5" style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Cantidad a ingresar
        </p>
        <p className="text-4xl font-bold" style={{ color: '#1a3a5c' }}>{cantidad || 0}</p>
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
          Estado: <strong>{tipo === 'interno' ? 'Solicitado' : 'Pendiente'}</strong>
        </p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2 text-sm rounded-lg font-medium"
          style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 py-2 text-sm rounded-lg font-medium text-white"
          style={{ background: '#1a3a5c' }}
          onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
          onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
          {tipo === 'interno' ? '✓ Enviar Solicitud Interna' : '✓ Registrar Movimiento'}
        </button>
      </div>
    </form>
  )
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function MovimientosEntrada() {
  const { user } = useAuth()

  /* ─── 1. TODOS LOS HOOKS ARRIBA (ORDEN ESTRICTO) ─── */
  const [movimientos, setMovimientos]     = useState(movimientosMock)
  const [modalNuevo, setModalNuevo]       = useState(false)
  const [modalDetalle, setModalDetalle]   = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [search, setSearch]               = useState('')
  const [page, setPage]                   = useState(1)
  const [sort, setSort]                   = useState({ col: 'fecha', dir: 'desc' })

  const userRol  = useMemo(() => user?.rol?.toUpperCase() || '', [user])
  const esGlobal = userRol === 'ADMIN' || userRol === 'GERENTE'

  const tabs = useMemo(() => {
    if (esGlobal) return [{ id: 'todos', nombre: 'Todos' }, ...talleresMock]
    return talleresMock.filter(t => t.id === user?.tallerId)
  }, [esGlobal, user])

  const [tabActiva, setTabActiva] = useState(esGlobal ? 'todos' : user?.tallerId);

  useEffect(() => { setPage(1) }, [search, tabActiva])

  const filtered = useMemo(() => {
    return movimientos.filter(m => {
      const matchSede = tabActiva === 'todos' || String(m.tallerId) === String(tabActiva);
      const q = search.toLowerCase();
      return matchSede && (m.productoNombre.toLowerCase().includes(q) || (m.proveedorNombre || '').toLowerCase().includes(q));
    });
  }, [movimientos, tabActiva, search]);

  /* ─── 2. SEGURIDAD (DESPUÉS DE LOS HOOKS) ─── */
  if (!user) return (
    <Layout tituloNavbar="Cargando...">
      <div className="p-20 text-center text-gray-300 font-bold uppercase text-xs tracking-widest animate-pulse">Autenticando...</div>
    </Layout>
  )

  /* ─── 3. VARIABLES DERIVADAS ─── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows        = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)
  const pendientes  = filtered.filter(m => m.estado === 'Pendiente').length
  const solicitados = filtered.filter(m => m.estado === 'Solicitado').length
  const totalUnids  = filtered.reduce((acc, curr) => acc + curr.cantidad, 0)

  /* ─── 4. ACCIONES ─── */
  const handleRegistrar = data => { setMovimientos(prev => [data, ...prev]); setModalNuevo(false) }
  const handleApprove   = id   => setMovimientos(prev => prev.map(m => m.id === id ? { ...m, estado: 'Aprobado' } : m))
  const handleEliminar  = ()   => { setMovimientos(prev => prev.filter(m => m.id !== modalEliminar)); setModalEliminar(null) }
  const toggleSort      = col  => setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const TH = ({ col, label, width }) => (
    <th onClick={() => col && toggleSort(col)}
      className="px-4 py-3 text-left select-none"
      style={{ width, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
      <span className="inline-flex items-center">
        {label}{col && <SortIcon dir={sort.col === col ? sort.dir : null} />}
      </span>
    </th>
  )

  return (
    <Layout tituloNavbar="Gestión de Ingresos">
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

      <div className="p-4 sm:p-6 min-h-screen" style={{ background: '#f6f8fb' }}>

        {/* ── Header responsive ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Movimientos de Entrada</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Control de Almacén Central</p>
          </div>
          <button onClick={() => setModalNuevo(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm w-full sm:w-auto"
            style={{ background: '#1a3a5c' }}
            onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Registrar Ingreso
          </button>
        </div>

        {/* ── Stat cards responsive ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Registros',   value: filtered.length, icon: '📋', accent: '#1a3a5c' },
            { label: 'Unidades',    value: totalUnids,      icon: '📦', accent: '#2b6cb0' },
            { label: 'Pendientes',  value: pendientes,      icon: '⏳', accent: pendientes  > 0 ? '#b45309' : '#94a3b8' },
            { label: 'Solicitados', value: solicitados,     icon: '🔄', accent: solicitados > 0 ? '#7c3aed' : '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 bg-white"
              style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
                <span style={{ fontSize: 15 }}>{s.icon}</span>
              </div>
              <p className="text-3xl font-bold tracking-tight" style={{ color: s.accent }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs responsive (scroll horizontal) ── */}
        {tabs.length > 1 && (
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
            {tabs.map(t => {
              const active = String(tabActiva) === String(t.id)
              return (
                <button key={t.id} onClick={() => { setTabActiva(t.id); setPage(1) }}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex-shrink-0"
                  style={{ background: active ? '#1a3a5c' : '#fff', color: active ? '#fff' : '#64748b', border: active ? '1px solid #1a3a5c' : '1px solid #e2e8f0', boxShadow: active ? '0 2px 8px rgba(26,58,92,0.18)' : 'none' }}>
                  {t.nombre}
                </button>
              )
            })}
          </div>
        )}

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Toolbar responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4"
            style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto o proveedor…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
                onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'none' }} />
            </div>
            <span className="text-xs" style={{ color: '#94a3b8' }}>{filtered.length} registros</span>
          </div>

          {/* Table con scroll horizontal en móvil */}
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <TH col="fecha"          label="Fecha / Sede" width="16%" />
                  <TH col="productoNombre" label="Producto"     width="22%" />
                  <TH col="tipo"           label="Referencia"   width="22%" />
                  <TH col="cantidad"       label="Cant."        width="9%"  />
                  <TH col="estado"         label="Estado"       width="13%" />
                  <TH                      label="Acciones"     width="10%" />
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.map(m => {
                  const cfg = TIPO_CONFIG[m.tipo] || { label: m.tipo, bg: '#f8fafc', color: '#64748b' }
                  return (
                    <tr key={m.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafcff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                          {new Date(m.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                        <p className="text-xs mt-0.5 font-semibold" style={{ color: '#2a5f94' }}>
                          {talleresMock.find(t => t.id === m.tallerId)?.nombre}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{m.productoNombre}</p>
                        <p className="text-xs mt-0.5 font-semibold" style={{ color: '#94a3b8', letterSpacing: '0.04em' }}>{m.marca}</p>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-1"
                          style={{ background: cfg.bg || '#f8fafc', color: cfg.color || '#64748b', border: `1px solid ${cfg.border || '#e2e8f0'}` }}>
                          <span style={{ fontSize: 10 }}>{cfg.icon}</span>
                          {cfg.label}
                        </span>
                        <p className="text-xs truncate" style={{ color: '#94a3b8', maxWidth: 150 }}>
                          {m.proveedorNombre || m.origen}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold"
                          style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                          +{m.cantidad}
                        </span>
                      </td>

                      <td className="px-4 py-3"><EstadoBadge estado={m.estado} /></td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {m.estado === 'Pendiente' && (
                            <ActionBtn icon="check" title="Confirmar" onClick={() => handleApprove(m.id)} hoverBg="#15803d" />
                          )}
                          <ActionBtn icon="view"   title="Ver"    onClick={() => setModalDetalle(m)} />
                          <ActionBtn icon="delete" title="Anular" danger onClick={() => setModalEliminar(m.id)} />
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} className="py-14 text-center" style={{ color: '#94a3b8' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                      <p className="text-sm font-medium">No hay movimientos</p>
                      <p className="text-xs mt-1">Intenta con otros filtros o sede</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-100 bg-white">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    Pág. {page} de {totalPages}
                </span>
                <div className="flex items-center gap-1">
                    {[
                    { label: '«', action: () => setPage(1),           disabled: page === 1 },
                    { label: '‹', action: () => setPage(p => p - 1),  disabled: page === 1 },
                    { label: '›', action: () => setPage(p => p + 1),  disabled: page === totalPages },
                    { label: '»', action: () => setPage(totalPages),  disabled: page === totalPages },
                    ].map((b, i) => (
                    <button key={i} onClick={b.action} disabled={b.disabled}
                        className="flex items-center justify-center rounded-lg text-sm font-mono transition-all"
                        style={{ 
                        width: 32, height: 32, border: '1px solid #e2e8f0', 
                        color: b.disabled ? '#cbd5e1' : '#1a3a5c', 
                        background: b.disabled ? '#f8fafc' : '#fff',
                        cursor: b.disabled ? 'not-allowed' : 'pointer'
                        }}>
                        {b.label}
                    </button>
                    ))}
                </div>
                </div>
            ) : (
                <div className="px-5 py-3 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50/30">
                Mostrando todos los registros ({filtered.length})
                </div>
            )}
        </div>
      </div>

      {/* Modal Nuevo */}
      {modalNuevo && (
        <Modal title="Carga de Inventario" onClose={() => setModalNuevo(false)} wide>
          <FormIngreso onSubmit={handleRegistrar} onClose={() => setModalNuevo(false)} user={user} />
        </Modal>
      )}

      {/* Modal Detalle */}
      {modalDetalle && (
        <Modal title="Detalle del Movimiento" onClose={() => setModalDetalle(null)}>
          <div className="flex flex-col gap-2.5 mb-4">
            {[
              { label: 'Estado',   value: <EstadoBadge estado={modalDetalle.estado} /> },
              { label: 'Producto', value: <><b>{modalDetalle.productoNombre}</b> <span style={{ color: '#94a3b8', fontSize: 12 }}>{modalDetalle.marca}</span></> },
              { label: 'Cantidad', value: <span style={{ fontWeight: 700, color: '#1d4ed8' }}>+ {modalDetalle.cantidad}</span> },
              { label: 'Ref. / Proveedor', value: modalDetalle.proveedorNombre || modalDetalle.origen },
              { label: 'Taller',   value: talleresMock.find(t => t.id === modalDetalle.tallerId)?.nombre ?? '—' },
              { label: 'Fecha',    value: new Date(modalDetalle.fecha).toLocaleDateString('es-PE') },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: '#f8fafc', border: '1px solid #e9edf2' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</span>
                <span className="text-sm" style={{ color: '#1e293b' }}>{r.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setModalDetalle(null)}
            className="w-full py-2 text-sm rounded-lg font-medium text-white"
            style={{ background: '#1a3a5c' }}
            onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
            Cerrar
          </button>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <Modal title="Anular Registro" onClose={() => setModalEliminar(null)}>
          <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl"
            style={{ background: '#fff5f5', border: '1px solid #fee2e2' }}>
            <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm" style={{ color: '#991b1b', lineHeight: 1.5 }}>
              ¿Estás seguro de anular este ingreso? El stock no se revertirá automáticamente.
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
              Sí, Anular
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}