import { useState, useEffect, useMemo } from 'react'
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import Layout from '../components/layout/Layout'

/* ─── 1. CONSTANTES ─────────────────────────────────────────────── */
const CATEGORIAS = ['Aceites', 'Motor', 'Suspensión', 'Fluidos', 'Filtros', 'Frenos', 'Transmisión', 'Eléctrico', 'Carrocería', 'Otros']

const UNIDADES = [
  { value: 'UNID',   label: 'Unidad (Pza/Und)' },
  { value: 'LITROS', label: 'Litros' },
  { value: 'PAR',    label: 'Par' },
  { value: 'KG',     label: 'Kilogramos' },
  { value: 'ML',     label: 'Mililitros' },
  { value: 'MT',     label: 'Metros' },
]

const CATEGORIA_STYLE = {
  'Aceites':    { bg: '#e6fffa', color: '#2c7a7b' },
  'Motor':      { bg: '#ebf8ff', color: '#2b6cb0' },
  'Suspensión': { bg: '#faf5ff', color: '#6b46c1' },
  'Fluidos':    { bg: '#fffff0', color: '#b7791f' },
  'Filtros':    { bg: '#f0fff4', color: '#276749' },
  'Frenos':     { bg: '#fff5f5', color: '#c53030' },
  'Transmisión':{ bg: '#fffaf0', color: '#c05621' },
  'Eléctrico':  { bg: '#ebf8ff', color: '#2c5282' },
  'Carrocería': { bg: '#faf5ff', color: '#553c9a' },
  'Otros':      { bg: '#f7fafc', color: '#718096' },
}

// FIX #9: tallerId como null en lugar de ''
const INIT_FORM = {
  nombre: '', codigo: '', marca: '', categoria: CATEGORIAS[0],
  stockActual: 0, stockMin: 5, medida: 'UNID', tallerId: null,
}

const ROWS_PER_PAGE = 8

/* ─── 2. UI PRIMITIVES ───────────────────────────────────────────── */
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
              className="flex items-center justify-center rounded-lg transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              style={{ width: 28, height: 28 }}>
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
      <label className="block mb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm rounded-lg outline-none transition-all border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5'

function ActionBtn({ icon, title, hoverBg, onClick, disabled }) {
  const [hov, setHov] = useState(false)
  const icons = {
    edit:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    delete: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>,
  }
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center justify-center rounded-lg transition-all"
      style={{ width: 28, height: 28, background: hov && !disabled ? hoverBg : 'transparent', color: hov && !disabled ? '#fff' : '#94a3b8', border: '1px solid', borderColor: hov && !disabled ? hoverBg : '#e2e8f0', opacity: disabled ? .4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {icons[icon]}
    </button>
  )
}

// FIX #6: Componente de alerta de error inline
function ErrorAlert({ message, onClose }) {
  if (!message) return null
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {message}
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  )
}

/* ─── 3. FORMULARIO ──────────────────────────────────────────────── */
function FormProducto({ form, setForm, onSubmit, onClose, submitLabel, showTaller, talleres, saving, error, onClearError }) {
  return (
    <form onSubmit={onSubmit}>
      {/* FIX #6: Error inline en lugar de alert() */}
      <ErrorAlert message={error} onClose={onClearError} />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="Nombre del repuesto" span={2}>
          <input className={inputCls} required value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })} />
        </Field>
        <Field label="Marca">
          <input className={inputCls} value={form.marca}
            onChange={e => setForm({ ...form, marca: e.target.value })} />
        </Field>
        <Field label="Categoría">
          <select className={inputCls} value={form.categoria}
            onChange={e => setForm({ ...form, categoria: e.target.value })}>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Unidad de medida">
          <select className={inputCls} value={form.medida}
            onChange={e => setForm({ ...form, medida: e.target.value })}>
            {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </Field>
        {/* FIX #8: min=0 y Math.max para evitar negativos */}
        <Field label="Stock mínimo">
          <input className={inputCls} type="number" min={0}
            value={form.stockMin}
            onChange={e => setForm({ ...form, stockMin: Math.max(0, Number(e.target.value)) })} />
        </Field>
        {showTaller && (
          <Field label="Taller asignado" span={2}>
            <select className={inputCls} required
              value={form.tallerId ?? ''}
              onChange={e => setForm({ ...form, tallerId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Seleccionar taller...</option>
              {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </Field>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onClose} disabled={saving}
          className="flex-1 py-2 text-sm border rounded-lg font-medium text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-40">
          Cancelar
        </button>
        {/* FIX #5: botón deshabilitado mientras guarda */}
        <button type="submit" disabled={saving}
          className="flex-1 py-2 text-sm bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && (
            <svg className="animate-spin" width="13" height="13" fill="none" viewBox="0 0 24 24">
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

/* ─── 4. TABLA CON PAGINACIÓN ────────────────────────────────────── */
function DataTable({ data, showTaller, onEdit, onDelete, talleres }) {
  const [sort, setSort]     = useState({ col: 'nombre', dir: 'asc' })
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  // Reset página al buscar
  useEffect(() => { setPage(1) }, [search, sort])

  const filtered = useMemo(() => {
    let d = [...data]
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(p => p.nombre.toLowerCase().includes(q) || (p.marca || '').toLowerCase().includes(q))
    }
    d.sort((a, b) => {
      const va = a[sort.col] ?? ''; const vb = b[sort.col] ?? ''
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb), undefined, { numeric: true })
        : String(vb).localeCompare(String(va), undefined, { numeric: true })
    })
    return d
  }, [data, search, sort])

  // FIX #3: Paginación correctamente calculada y renderizada
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows       = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const toggleSort = col => setSort(s => s.col === col
    ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' }
    : { col, dir: 'asc' })

  const SortIcon = ({ col }) => (
    <span style={{ opacity: sort.col === col ? 1 : 0.3, marginLeft: 3, display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
      <svg width="7" height="4" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.46 4.5H.54L4 0Z" fill={sort.col === col && sort.dir === 'asc' ? '#1a3a5c' : '#94a3b8'} /></svg>
      <svg width="7" height="4" viewBox="0 0 8 5" fill="none" style={{ transform: 'rotate(180deg)' }}><path d="M4 0L7.46 4.5H.54L4 0Z" fill={sort.col === col && sort.dir === 'desc' ? '#1a3a5c' : '#94a3b8'} /></svg>
    </span>
  )

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto o marca..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-slate-900 transition-all" />
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th onClick={() => toggleSort('nombre')} className="px-5 py-3 cursor-pointer select-none">
                <span className="inline-flex items-center">Producto <SortIcon col="nombre" /></span>
              </th>
              <th onClick={() => toggleSort('marca')} className="px-5 py-3 cursor-pointer select-none">
                <span className="inline-flex items-center">Marca <SortIcon col="marca" /></span>
              </th>
              <th onClick={() => toggleSort('categoria')} className="px-5 py-3 cursor-pointer select-none">
                <span className="inline-flex items-center">Categoría <SortIcon col="categoria" /></span>
              </th>
              <th onClick={() => toggleSort('stockActual')} className="px-5 py-3 text-center cursor-pointer select-none">
                <span className="inline-flex items-center">Stock <SortIcon col="stockActual" /></span>
              </th>
              <th className="px-5 py-3">Medida</th>
              {showTaller && <th className="px-5 py-3">Taller</th>}
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.length === 0 && (
              <tr>
                <td colSpan={showTaller ? 7 : 6} className="px-5 py-12 text-center text-slate-400 text-xs">
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: .3 }}>📦</div>
                  Sin productos para mostrar
                </td>
              </tr>
            )}
            {rows.map(p => {
              const cs     = CATEGORIA_STYLE[p.categoria] || { bg: '#f7fafc', color: '#718096' }
              const critico = p.stockActual <= p.stockMin
              return (
                <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{p.nombre}</p>
                    {p.codigo && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.codigo}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.marca || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: cs.bg, color: cs.color }}>
                      {p.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shadow-sm ${critico ? 'bg-red-500' : 'bg-[#1a3a5c]'}`}
                      title={critico ? `Stock crítico (mín: ${p.stockMin})` : ''}>
                      {p.stockActual}
                    </span>
                    {critico && (
                      <p className="text-[9px] text-red-400 font-bold mt-0.5">CRÍTICO</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs font-bold text-slate-400">{p.medida}</td>
                  {showTaller && (
                    <td className="px-5 py-3 text-xs text-slate-500 font-medium">
                      {talleres.find(t => t.id === p.tallerId)?.nombre || '—'}
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <ActionBtn icon="edit"   hoverBg="#1a3a5c" onClick={() => onEdit(p)} />
                      <ActionBtn icon="delete" hoverBg="#dc2626" onClick={() => onDelete(p.id)} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* FIX #3: Paginación visible */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50 bg-slate-50/30">
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
            Página {page} de {totalPages} · {filtered.length} registros
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? .4 : 1 }}>
              ← Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${n === page ? '#1a3a5c' : '#e2e8f0'}`, background: n === page ? '#1a3a5c' : '#fff', color: n === page ? '#fff' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {n}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? .4 : 1 }}>
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── 5. COMPONENTE PRINCIPAL ────────────────────────────────────── */
export default function Productos() {
  const { user } = useAuth()

  // FIX #1: esGlobal memoizado
  const esGlobal = useMemo(() =>
    user?.rol === 'Admin' || user?.rol === 'Gerente'
  , [user?.rol])

  const [productos, setProductos]     = useState([])
  const [talleres, setTalleres]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [modalNuevo, setModalNuevo]   = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [form, setForm]               = useState(INIT_FORM)

  // FIX #5: estados de carga por acción
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)

  // FIX #6: error por modal
  const [errorNuevo, setErrorNuevo]   = useState('')
  const [errorEditar, setErrorEditar] = useState('')
  const [errorEliminar, setErrorEliminar] = useState('')

  // FIX #2: tabActiva inicializada en null, se setea cuando llegan datos
  const [tabActiva, setTabActiva] = useState(null)

  // FIX #7: normalizar tipos al cargar
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resP, resT] = await Promise.all([api.get('/productos'), api.get('/talleres')]);

      const tallresNorm = resT.data.map(t => ({ ...t, id: Number(t.id) }));
      const prodNorm = resP.data.map(p => ({ ...p, tallerId: p.tallerId ? Number(p.tallerId) : null }));

      setTalleres(tallresNorm);
      setProductos(prodNorm);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. El useEffect solo la llama al montar el componente
  useEffect(() => {
    if (user) cargarDatos();
  }, [user]);

  // FIX #2 + #4: setTabActiva solo cuando llegan talleres y aún no hay tab
  useEffect(() => {
    if (tabActiva !== null) return
    if (esGlobal) {
      setTabActiva('todos')
    } else if (user?.tallerId) {
      setTabActiva(Number(user.tallerId))
    }
  }, [esGlobal, user?.tallerId, tabActiva])

  const tabs = useMemo(() => {
    const base  = esGlobal ? [{ id: 'todos', nombre: 'Todos' }] : []
    const sedes = esGlobal
      ? talleres
      : talleres.filter(t => t.id === Number(user?.tallerId))
    return [...base, ...sedes]
  }, [talleres, esGlobal, user?.tallerId])

  const filtrados  = tabActiva === 'todos'
    ? productos
    : productos.filter(p => p.tallerId === tabActiva)

  const stockBajos = filtrados.filter(p => p.stockActual <= p.stockMin).length
  const totalStock = filtrados.reduce((acc, p) => acc + p.stockActual, 0)

  const handleCrear = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorNuevo(''); 

    try {
      const res = await api.post('/productos', form);

      await cargarDatos(); 
      setModalNuevo(false);
      setForm(INIT_FORM);
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'Error al guardar';
      setErrorNuevo(mensajeError); 
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorEditar(''); 

    try {
      await api.put(`/productos/${modalEditar}`, form);
      await cargarDatos(); 
      setModalEditar(null);
    } catch (err) {
      const mensajeError = err.response?.data?.error || 'Error al actualizar el producto';
      setErrorEditar(mensajeError); 
      
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    setDeleting(true)
    setErrorEliminar('')
    try {
      await api.delete(`/productos/${modalEliminar}`)
      setProductos(prev => prev.filter(p => p.id !== modalEliminar))
      setModalEliminar(null)
    } catch (err) {
      setErrorEliminar(err.response?.data?.error ?? 'Error al eliminar el producto')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <Layout tituloNavbar="Catálogo de Productos">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <svg className="animate-spin" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4"/>
          <path fill="#1a3a5c" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Cargando inventario...
        </span>
      </div>
    </Layout>
  )

  return (
    <Layout tituloNavbar="Catálogo de Productos">
      <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(.96) translateY(6px) } to { opacity: 1; transform: scale(1) translateY(0) } }`}</style>

      <div className="p-6 min-h-screen bg-[#f6f8fb]">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94a3b8', marginBottom: 4 }}>Módulo</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Catálogo de Productos</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {esGlobal
                ? 'Panel de Control Centralizado'
                : `Sede: ${talleres.find(t => t.id === Number(user?.tallerId))?.nombre || '...'}`}
            </p>
          </div>
          <button
            onClick={() => {
              setForm({ ...INIT_FORM, tallerId: esGlobal ? (tabActiva === 'todos' ? (talleres[0]?.id ?? null) : tabActiva) : Number(user?.tallerId) })
              setErrorNuevo('')
              setModalNuevo(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-sm transition-all">
            + Crear Nuevo Producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Productos',  value: filtrados.length, icon: '📦', color: '#1a3a5c' },
            { label: 'Unidades',   value: totalStock,        icon: '🗂',  color: '#2b6cb0' },
            { label: 'Crítico',    value: stockBajos,        icon: '⚠️', color: stockBajos > 0 ? '#dc2626' : '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                <span className="text-base">{s.icon}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setTabActiva(tab.id)}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all border whitespace-nowrap ${tabActiva === tab.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                {tab.nombre}
              </button>
            ))}
          </div>
        )}

        <DataTable
          data={filtrados}
          showTaller={tabActiva === 'todos'}
          onEdit={p => { setForm(p); setErrorEditar(''); setModalEditar(p.id) }}
          onDelete={id => { setErrorEliminar(''); setModalEliminar(id) }}
          talleres={talleres}
        />
      </div>

      {/* Modal Nuevo */}
      {modalNuevo && (
        <Modal title="Nuevo Producto" onClose={() => { setModalNuevo(false); setSaving(false) }}>
          <FormProducto
            form={form} setForm={setForm}
            onSubmit={handleCrear}
            onClose={() => { setModalNuevo(false); setSaving(false) }}
            submitLabel="Guardar Producto"
            showTaller={esGlobal}
            talleres={talleres}
            saving={saving}
            error={errorNuevo}
            onClearError={() => setErrorNuevo('')}
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <Modal title="Editar Producto" onClose={() => { setModalEditar(null); setSaving(false) }}>
          <FormProducto
            form={form} setForm={setForm}
            onSubmit={handleEditar}
            onClose={() => { setModalEditar(null); setSaving(false) }}
            submitLabel="Actualizar Cambios"
            showTaller={esGlobal}
            talleres={talleres}
            saving={saving}
            error={errorEditar}
            onClearError={() => setErrorEditar('')}
          />
        </Modal>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <Modal title="Eliminar Registro" onClose={() => !deleting && setModalEliminar(null)}>
          <ErrorAlert message={errorEliminar} onClose={() => setErrorEliminar('')} />
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-5 text-sm text-red-800">
            Esta acción no se puede deshacer. ¿Seguro que deseas eliminar este producto?
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModalEliminar(null)} disabled={deleting}
              className="flex-1 py-2 text-sm border rounded-lg font-medium disabled:opacity-40">
              Cancelar
            </button>
            <button onClick={handleEliminar} disabled={deleting}
              className="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {deleting && (
                <svg className="animate-spin" width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="4"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              )}
              {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}