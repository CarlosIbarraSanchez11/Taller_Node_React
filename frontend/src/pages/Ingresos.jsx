import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios' 
import toast from 'react-hot-toast'

const ROWS_PER_PAGE = 10

/* ─── UI PRIMITIVES ─────────────────────────────────────────────── */
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
            <button onClick={onClose} className="flex items-center justify-center rounded-lg transition-colors" style={{ width: 28, height: 28, color: '#94a3b8' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
      <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {children}
    </div>
  )
}

const baseInput = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
const inputCls = 'w-full px-3 py-2 text-sm rounded-lg outline-none transition-all'

function SInput({ ...props }) {
  return <input {...props} className={inputCls} style={baseInput} />
}

function SSelect({ children, accentColor, ...props }) {
  const accent = accentColor ? { border: `1px solid ${accentColor}40`, background: `${accentColor}08` } : {}
  return <select {...props} className={inputCls} style={{ ...baseInput, cursor: 'pointer', ...accent }}>{children}</select>
}

function EstadoBadge({ estado }) {
  const cfg = {
    'RECIBIDO':    { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', border: '#bbf7d0', label: 'RECIBIDO' },
    'APROBADO':    { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', border: '#bbf7d0', label: 'RECIBIDO' },
    'EN CAMINO':   { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe', label: 'EN CAMINO' },
    'SOLICITADO':  { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b', border: '#fef3c7', label: 'SOLICITADO' },
    'RECHAZADO':   { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444', border: '#fee2e2', label: 'RECHAZADO' },
    
    // 🔵 NUEVO: Para traslados que salieron del origen
    'DESPACHADO':  { bg: '#f0f9ff', color: '#0369a1', dot: '#0ea5e9', border: '#bae6fd', label: 'DESPACHADO' },
    
    // 🟣 NUEVO: Para ventas entregadas al cliente
    'ENTREGADO':   { bg: '#f5f3ff', color: '#4338ca', dot: '#6366f1', border: '#ddd6fe', label: 'ENTREGADO' },
    
    'TRANSFERIDO': { bg: '#fdf4ff', color: '#701a75', dot: '#d946ef', border: '#f5d0fe', label: 'TRANSFERIDO' },
  }[estado?.toUpperCase()] || { bg: '#f8fafc', color: '#94a3b8', dot: '#cbd5e1', border: '#e2e8f0', label: estado }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

/* ─── FORMULARIO DE INGRESO ─────────────────────────────────────── */
// onSuccess = cargarDatos del padre, para refrescar la tabla al guardar
function FormIngreso({ onClose, onSuccess, user, catMaestros, catTalleres, catProveedores }) {
  const esGlobal = user?.rol === 'Admin' || user?.rol === 'Gerente'

  const [categoriaSel, setCategoriaSel] = useState('')
  const [tipo, setTipo] = useState('con_ruc')
  const [productoId, setProductoId] = useState('')
  const [tallerId, setTallerId] = useState(esGlobal ? (catTalleres[0]?.id || '') : user?.tallerId)
  const [tallerOrigenId, setTallerOrigenId] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [motivo, setMotivo] = useState('CARGA_INICIAL')
  const [cantidad, setCantidad] = useState(1)
  const [stockEnRed, setStockEnRed] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const esInterno = tipo === 'interno'
  const txtBoton = esInterno ? 'Solicitar Pedido' : 'Registrar Ingreso'

  const renderMotivos = () => {
    if (tipo === 'con_ruc') return (
      <>
        <option value="COMPRA">Compra regular (Factura)</option>
        <option value="CARGA_INICIAL">Carga Inicial de Inventario</option>
      </>
    )
    if (tipo === 'sin_ruc') return (
      <>
        <option value="COMPRA_DIRECTA">Compra Directa (Efectivo/Nota)</option>
        <option value="AJUSTE">Ajuste de Inventario (Sobrante local)</option>
        <option value="CARGA_INICIAL">Carga Inicial</option>
      </>
    )
    if (tipo === 'interno') return (
      <option value="TRANSFERENCIA">Transferencia entre sedes</option>
    )
  }

  const categorias = useMemo(() => {
    const cats = catMaestros.map(m => m.categoria).filter(Boolean)
    return [...new Set(cats)].sort()
  }, [catMaestros])

  const productosFiltrados = useMemo(() => {
    if (!categoriaSel) return catMaestros
    return catMaestros.filter(m => m.categoria === categoriaSel)
  }, [catMaestros, categoriaSel])

  useEffect(() => {
    if (productoId && tipo === 'interno') {
      api.get(`/productos?maestroId=${productoId}`)
        .then(res => setStockEnRed(res.data))
        .catch(() => console.warn('Stock en red no disponible'))
    }
  }, [productoId, tipo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const datos = {
      tallerId: Number(tallerId),
      tallerOrigenId: tallerOrigenId ? Number(tallerOrigenId) : null,
      costoMaestroId: Number(productoId),
      cantidad: Number(cantidad),
      usuarioId: user?.id,
      tipo: tipo.toUpperCase(),
      motivo,
      proveedorId: proveedorId ? Number(proveedorId) : null,
    }

    try {
      if (tipo === 'interno') {
        await api.post('/pedidos', datos)
      } else {
        await api.post('/ingresos', { ...datos, items: [{ costoMaestroId: productoId, cantidad }] })
      }
      toast.success('Operación exitosa')
      // ✅ Recargar primero, luego cerrar — onSuccess es cargarDatos del padre
      await onSuccess()
      onClose()
    } catch (error) {
      console.error('Error del servidor:', error.response?.data || error)
      toast.error('Error al procesar la operación')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <p className="text-xs font-semibold mb-2.5 text-slate-400 uppercase tracking-widest">Tipo de ingreso</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ id: 'con_ruc', label: 'CON RUC', icon: '💰' }, { id: 'sin_ruc', label: 'SIN RUC', icon: '🧾' }, { id: 'interno', label: 'INTERNO', icon: '🔄' }].map(cfg => (
            <button
              key={cfg.id}
              type="button"
              onClick={() => {
                setTipo(cfg.id)
                setMotivo(cfg.id === 'interno' ? 'TRANSFERENCIA' : 'CARGA_INICIAL')
                setTallerOrigenId('')
              }}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all ${tipo === cfg.id ? 'border-[#1a3a5c] bg-blue-50' : 'border-slate-100'}`}
            >
              <span style={{ fontSize: 20 }}>{cfg.icon}</span>
              <p className="text-[10px] font-bold uppercase">{cfg.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Categoría">
          <SSelect value={categoriaSel} onChange={e => { setCategoriaSel(e.target.value); setProductoId('') }}>
            <option value="">Todas las categorías</option>
            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </SSelect>
        </Field>

        <Field label="Repuesto / Producto">
          <SSelect required value={productoId} onChange={e => setProductoId(e.target.value)}>
            <option value="">Seleccionar del catálogo...</option>
            {productosFiltrados.map(p => {
              const nombreCorto = p.nombre.length > 25 ? p.nombre.substring(0, 25) + '...' : p.nombre
              return (
                <option key={p.id} value={p.id}>{nombreCorto} ({p.marca}) — [{p.medida}]</option>
              )
            })}
          </SSelect>
        </Field>

        {esInterno && productoId && (
          <div className="col-span-2 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selecciona taller de origen:</p>
            <div className="grid grid-cols-3 gap-2">
              {catTalleres.map(t => {
                const s = stockEnRed.find(x => Number(x.tallerId) === Number(t.id))
                const isDestino = Number(t.id) === Number(tallerId)
                const isSelected = Number(tallerOrigenId) === Number(t.id)
                return (
                  <button
                    key={t.id} type="button" disabled={isDestino || (s?.stockActual || 0) <= 0}
                    onClick={() => setTallerOrigenId(t.id)}
                    className={`p-3 rounded-xl text-center border-2 transition-all ${isSelected ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-slate-100 bg-white'} ${isDestino || (s?.stockActual || 0) <= 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <p style={{ fontSize: 9, color: isSelected ? '#6b21a8' : '#94a3b8', fontWeight: 800 }} className="uppercase">{t.nombre}</p>
                    <p className={`text-lg font-black ${isSelected ? 'text-purple-700' : 'text-slate-600'}`}>{s?.stockActual || 0}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <Field label={esGlobal ? 'Sede de Ingreso' : 'Sede Local'}>
          {esGlobal ? (
            <SSelect value={tallerId} onChange={e => setTallerId(Number(e.target.value))}>
              {catTalleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </SSelect>
          ) : (
            <div className="px-3 py-2 text-sm rounded-lg font-bold bg-slate-100 text-slate-500">📍 {catTalleres.find(t => t.id === user?.tallerId)?.nombre}</div>
          )}
        </Field>

        <Field label="Cantidad">
          <SInput type="number" required min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
        </Field>

        {tipo === 'con_ruc' && (
          <Field label="Proveedor" span={2}>
            <SSelect required value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
              <option value="">Seleccionar proveedor...</option>
              {catProveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
            </SSelect>
          </Field>
        )}

        <Field label="Motivo del Movimiento" span={2}>
          <SSelect
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            style={esInterno ? { border: '1px solid #d8b4fe', background: '#f5f3ff' } : {}}
          >
            {renderMotivos()}
          </SSelect>
        </Field>
      </div>

      <div className="flex gap-2 pt-4">
        <button type="button" onClick={onClose} disabled={submitting}
          className="flex-1 py-3 text-xs font-bold text-slate-400 border rounded-xl uppercase disabled:opacity-40">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`flex-1 py-3 text-white rounded-xl text-xs font-black uppercase shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
            esInterno ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#1a3a5c] hover:bg-[#11273f]'
          }`}
        >
          {submitting && (
            <svg className="animate-spin" width="13" height="13" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="4"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          )}
          {submitting ? 'Procesando...' : txtBoton}
        </button>
      </div>
    </form>
  )
}

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────────── */
export default function MovimientosEntrada() {
  const { user } = useAuth()
  const [movimientos, setMovimientos] = useState([])
  const [talleres, setTalleres] = useState([])
  const [maestros, setMaestros] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [search, setSearch] = useState('')
  const [tabActiva, setTabActiva] = useState('todos')
  const [page, setPage] = useState(1)

  const esGlobal = user?.rol === 'Admin' || user?.rol === 'Gerente'

  const cargarDatos = async () => {
    // 1. 🛡️ GUARDIA: Si no es global y el usuario aún no carga, no hagas nada.
    // Esto evita enviar tallerId=undefined
    if (!esGlobal && !user?.tallerId) return;

    setLoading(true)
    try {
      // 2. Construcción limpia de la URL
      const url = esGlobal ? '/ingresos' : `/ingresos?tallerId=${user.tallerId}`
      
      const [rI, rT, rM, rP] = await Promise.all([
        api.get(url).catch(() => ({ data: [] })),
        api.get('/talleres').catch(() => ({ data: [] })),
        api.get('/costos-maestros').catch(() => ({ data: [] })),
        api.get('/proveedores').catch(() => ({ data: [] })),
      ])

      setMovimientos(rI.data)
      setTalleres(rT.data)
      setMaestros(rM.data)
      setProveedores(rP.data)

      if (!esGlobal && user?.tallerId) setTabActiva(user.tallerId)
    } catch (error) {
      console.error("Error en la carga:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    if (user) {
      cargarDatos() 
    }
  }, [user, esGlobal])

  // Reset página al cambiar filtros
  useEffect(() => { setPage(1) }, [search, tabActiva])

  const filtered = useMemo(() => {
    return movimientos.filter(m => {
      const matchSede   = tabActiva === 'todos' || String(m.tallerId) === String(tabActiva)
      const matchSearch = m.costoMaestro?.nombre?.toLowerCase().includes(search.toLowerCase())
      
      // 🚀 AGREGAMOS 'DESPACHADO' Y 'ENTREGADO' AL FILTRO
      const matchEstado = [
        'APROBADO', 'SOLICITADO', 'RECHAZADO', 'EN CAMINO', 
        'TRANSFERIDO', 'DESPACHADO', 'ENTREGADO', 'RECIBIDO'
      ].includes(m.estado?.toUpperCase())

      return matchSede && matchSearch && matchEstado
    })
  }, [movimientos, tabActiva, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const manejarRecepcion = async (id) => {
    try {
      // 🚀 CAMBIO: Mandamos 'RECIBIDO' en lugar de 'APROBADO'
      await api.patch(`/ingresos/${id}`, { nuevoEstado: 'APROBADO' });
      
      toast.success('¡Mercadería recibida! El stock ha sido actualizado.');
      cargarDatos(); // Recargamos la lista para ver el cambio de color
    } catch (error) {
      console.error('Error en el componente:', error);
      toast.error('Error al procesar la recepción');
    }
  };

  if (loading) return (
    <Layout tituloNavbar="Historial">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <svg className="animate-spin" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4"/>
          <path fill="#1a3a5c" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em' }}>Cargando movimientos...</span>
      </div>
    </Layout>
  )

  return (
    <Layout tituloNavbar="Gestión de Ingresos">
      <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(.96) translateY(6px) } to { opacity: 1; transform: scale(1) translateY(0) } }`}</style>
      <div className="p-6 bg-[#f6f8fb] min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Movimientos de Entrada</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Historial de Ingresos y Traslados</p>
          </div>
          <button onClick={() => setModalNuevo(true)} className="px-6 py-3 bg-[#1a3a5c] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
            + Registrar Ingreso
          </button>
        </div>

        {/* PESTAÑAS */}
        {esGlobal && (
          <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border w-fit shadow-sm overflow-x-auto">
            <button onClick={() => setTabActiva('todos')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tabActiva === 'todos' ? 'bg-[#1a3a5c] text-white shadow-lg' : 'text-slate-400'}`}>TODOS</button>
            {talleres.map(t => (
              <button key={t.id} onClick={() => setTabActiva(t.id)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tabActiva === t.id ? 'bg-[#1a3a5c] text-white shadow-lg' : 'text-slate-400'}`}>{t.nombre}</button>
            ))}
          </div>
        )}

        {/* TABLA */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center gap-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar por producto..."
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold w-64 outline-none focus:ring-2 ring-blue-100" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">{filtered.length} Movimientos</span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Fecha / Taller</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Motivo / Referencia</th>
                <th className="px-6 py-4 text-center">Cant.</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(m => {
                const isRechazado = m.estado?.toUpperCase() === 'RECHAZADO'
                const tipoKey = m.tipo?.toUpperCase()
                
                // 🎨 Regresamos a tus colores: Esmeralda, Ámbar y Morado
                const config = {
                  'CON_RUC':       { color: '#059669', label: 'CON RUC' },     // Verde Esmeralda
                  'SIN_RUC':       { color: '#d97706', label: 'SIN RUC' },     // Ámbar
                  'INTERNO':       { color: '#7c3aed', label: 'INTERNO' },     // Morado
                  'TRANSFERENCIA': { color: '#d97706', label: 'SIN RUC (Ant)' } // Ámbar (Sist. anterior)
                }[tipoKey] || { color: '#64748b', label: m.tipo }

                const motivoColor = isRechazado ? '#94a3b8' : config.color
                const esTraslado  = tipoKey === 'INTERNO' || tipoKey === 'TRANSFERENCIA'

                return (
                  <tr key={m.id}
                    className="transition-colors hover:brightness-[0.98]"
                    // style={{
                    //   background: isRechazado ? '#f8fafc' 
                    //     : esTraslado 
                    //       ? m.cantidad < 0 ? 'rgba(254,242,242,0.4)' : 'rgba(245,243,255,0.4)' 
                    //       : 'transparent',
                    //   borderLeft: isRechazado ? '4px solid #e2e8f0' 
                    //     : esTraslado 
                    //       ? m.cantidad < 0 ? '4px solid #fecaca' : '4px solid #ddd6fe' 
                    //       : `4px solid ${config.color}40`, // Borde suave del color de la categoría
                    // }}
                    >

                    {/* FECHA / SEDE */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-800" style={{ opacity: isRechazado ? 0.5 : 1 }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[9px] font-bold uppercase mt-0.5" 
                        style={{ color: motivoColor, opacity: isRechazado ? 0.6 : 1 }}>
                        📍 {m.taller?.nombre}
                      </p>
                    </td>

                    {/* PRODUCTO (Ahora con color de categoría) */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-black uppercase"
                        style={{ 
                          color: isRechazado ? '#94a3b8' : motivoColor, // 🚀 Aplicado el color aquí
                          textDecoration: isRechazado ? 'line-through' : 'none' 
                        }}>
                        {m.costoMaestro?.nombre}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[9px] font-bold uppercase text-slate-400">{m.costoMaestro?.marca}</p>
                        <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                          {m.costoMaestro?.medida || 'Und'}
                        </span>
                      </div>
                    </td>

                    {/* MOTIVO / REFERENCIA */}
                    <td className="px-6 py-4" style={{ opacity: isRechazado ? 0.5 : 1 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                          style={{ background: `${motivoColor}15`, color: motivoColor, border: `1px solid ${motivoColor}30` }}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-tight" style={{ color: motivoColor }}>{m.motivo}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                        {m.cantidad < 0
                          ? `Hacia: ${m.tallerOrigen?.nombre || 'Destino'}`
                          : m.proveedor
                            ? `🏢 ${m.proveedor.razonSocial}`
                            : m.tallerOrigen
                              ? `🔄 Origen: ${m.tallerOrigen.nombre}`
                              : `📝 Referencia Interna`
                        }
                      </p>
                    </td>

                    {/* CANTIDAD */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full font-black text-xs"
                        style={{
                          // Lógica de fondos: Gris si rechazado, Rojo si negativo, Azul si positivo
                          background: isRechazado ? '#f1f5f9' : m.cantidad < 0 ? '#fef2f2' : '#eff6ff',
                          // Lógica de textos: Gris si rechazado, Rojo si negativo, Azul si positivo
                          color:      isRechazado ? '#94a3b8' : m.cantidad < 0 ? '#dc2626' : '#2563eb',
                          textDecoration: isRechazado ? 'line-through' : 'none',
                        }}>
                        {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                      </span>
                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-4 text-center">
                      <EstadoBadge estado={m.estado} />
                    </td>

                    {/* ACCIÓN */}
                    <td className="px-6 py-4 text-center">
                      {m.estado?.toUpperCase() === 'EN CAMINO' ? (
                        <button onClick={() => manejarRecepcion(m.id)}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-md">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300 italic">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="p-20 text-center text-slate-200 font-black text-[10px] uppercase tracking-[0.2em]">Esperando registros...</div>
          )}

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-50 bg-slate-50/30">
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                Página {page} de {totalPages} · {filtered.length} registros
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
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
                  style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalNuevo && (
        <Modal title="Carga de Inventario" onClose={() => setModalNuevo(false)} wide>
          <FormIngreso
            onClose={() => setModalNuevo(false)}
            onSuccess={cargarDatos}
            user={user}
            catMaestros={maestros}
            catTalleres={talleres}
            catProveedores={proveedores}
          />
        </Modal>
      )}
    </Layout>
  )
}
