import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios' 
import toast from 'react-hot-toast'

const ROWS_PER_PAGE = 10

/* ─── 🏗️ UI PRIMITIVES (MANTENIDOS 100%) ─────────────────────────── */
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
    'APROBADO':   { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', border: '#bbf7d0' },
    'PENDIENTE':  { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b', border: '#fde68a' },
    'SOLICITADO': { bg: '#faf5ff', color: '#7c3aed', dot: '#8b5cf6', border: '#e9d5ff' },
  }[estado?.toUpperCase()] || { bg: '#f8fafc', color: '#94a3b8', dot: '#cbd5e1', border: '#e2e8f0' }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot }} />
      {estado}
    </span>
  )
}

// const SButtonCls = "w-full py-3 bg-[#1a3a5c] text-white rounded-xl text-xs font-black uppercase shadow-lg transition-all hover:bg-[#11273f]";

/* ─── 📝 FORMULARIO DE INGRESO (CONEXIÓN REAL) ──────────────────── */
function FormIngreso({ onSubmit, onClose, user, catMaestros, catTalleres, catProveedores }) {
  const esGlobal = user?.rol === 'Admin' || user?.rol === 'Gerente'
  
  const [categoriaSel, setCategoriaSel] = useState('')
  const [tipo, setTipo] = useState('con_ruc')
  const [productoId, setProductoId] = useState('')
  const [tallerId, setTallerId] = useState(esGlobal ? (catTalleres[0]?.id || "") : user?.tallerId)
  const [tallerOrigenId, setTallerOrigenId] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [motivo, setMotivo] = useState('CARGA_INICIAL') // Valor por defecto
  const [cantidad, setCantidad] = useState(1)
  const [stockEnRed, setStockEnRed] = useState([])

  // 🚀 Lógica Dinámica para el Botón
  const esInterno = tipo === 'interno';
  const txtBoton = esInterno ? 'Solicitar Pedido' : 'Registrar Ingreso';

  // 🚀 Lógica de Motivos según el Tipo
  const renderMotivos = () => {
    if (tipo === 'con_ruc') return (
      <>
        <option value="COMPRA">Compra regular (Factura)</option>
        <option value="CARGA_INICIAL">Carga Inicial de Inventario</option>
      </>
    );
    
    if (tipo === 'sin_ruc') return (
      <>
        <option value="COMPRA_DIRECTA">Compra Directa (Efectivo/Nota)</option>
        <option value="AJUSTE">Ajuste de Inventario (Sobrante local)</option>
        <option value="CARGA_INICIAL">Carga Inicial</option>
      </>
    );

    if (tipo === 'interno') return (
      <option value="TRANSFERENCIA">Transferencia entre sedes</option>
    );
  };

  const categorias = useMemo(() => {
    const cats = catMaestros.map(m => m.categoria).filter(Boolean);
    return [...new Set(cats)].sort();
  }, [catMaestros]);

  const productosFiltrados = useMemo(() => {
    if (!categoriaSel) return catMaestros;
    return catMaestros.filter(m => m.categoria === categoriaSel);
  }, [catMaestros, categoriaSel]);

  useEffect(() => {
    if (productoId && tipo === 'interno') {
      api.get(`/productos?maestroId=${productoId}`)
        .then(res => setStockEnRed(res.data))
        .catch(() => console.warn("Stock en red no disponible"));
    }
  }, [productoId, tipo])

  const handleSubmit = e => {
    e.preventDefault();

    if (esInterno && !tallerOrigenId) {
      return toast.error("Por favor, selecciona el taller de origen");
    }

    onSubmit({
      tallerId: Number(tallerId),
      tallerOrigenId: Number(tallerOrigenId) || null,
      usuarioId: user?.id || 4, 
      tipo: tipo.toUpperCase(),
      motivo: motivo.toUpperCase(),
      estado: esInterno ? 'SOLICITADO' : 'APROBADO', 
      proveedorId: tipo === 'con_ruc' ? Number(proveedorId) : null,
      items: [{ costoMaestroId: Number(productoId), cantidad: Number(cantidad) }]
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* --- SELECTOR DE TIPO --- */}
      <div className="mb-5">
        <p className="text-xs font-semibold mb-2.5 text-slate-400 uppercase tracking-widest">Tipo de ingreso</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ id: 'con_ruc', label: 'CON RUC', icon: '💰' }, { id: 'sin_ruc', label: 'SIN RUC', icon: '🧾' }, { id: 'interno', label: 'INTERNO', icon: '🔄' }].map(cfg => (
            <button 
              key={cfg.id} 
              type="button" 
              onClick={() => { 
                setTipo(cfg.id); 
                // 🚀 Al cambiar de tipo, reseteamos el motivo a uno válido por defecto
                setMotivo(cfg.id === 'interno' ? 'TRANSFERENCIA' : 'CARGA_INICIAL');
                setTallerOrigenId(''); 
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
        {/* --- CATEGORÍA Y PRODUCTO --- */}
        <Field label="Categoría">
          <SSelect value={categoriaSel} onChange={e => { setCategoriaSel(e.target.value); setProductoId(''); }}>
            <option value="">Todas las categorías</option>
            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </SSelect>
        </Field>

        <Field label="Repuesto / Producto">
          <SSelect required value={productoId} onChange={e => setProductoId(e.target.value)}>
            <option value="">Seleccionar del catálogo...</option>
            {productosFiltrados.map(p => {
              const nombreCorto = p.nombre.length > 25 ? p.nombre.substring(0, 25) + "..." : p.nombre;
              return (
                <option key={p.id} value={p.id}>{nombreCorto} ({p.marca}) — [{p.medida}]</option>
              );
            })}
          </SSelect>
        </Field>

        {/* --- STOCK EN RED (SOLO INTERNO) --- */}
        {esInterno && productoId && (
          <div className="col-span-2 mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selecciona taller de origen:</p>
            <div className="grid grid-cols-3 gap-2">
              {catTalleres.map(t => {
                const s = stockEnRed.find(x => Number(x.tallerId) === Number(t.id));
                const isDestino = Number(t.id) === Number(tallerId);
                const isSelected = Number(tallerOrigenId) === Number(t.id);
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

        {/* --- SEDE Y CANTIDAD --- */}
        <Field label={esGlobal ? "Sede de Ingreso" : "Sede Local"}>
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

        {/* --- PROVEEDOR (SOLO CON RUC) --- */}
        {tipo === 'con_ruc' && (
          <Field label="Proveedor" span={2}>
            <SSelect required value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
              <option value="">Seleccionar proveedor...</option>
              {catProveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
            </SSelect>
          </Field>
        )}

        {/* --- MOTIVO DINÁMICO --- */}
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

      {/* --- ACCIONES --- */}
      <div className="flex gap-2 pt-4">
        <button type="button" onClick={onClose} className="flex-1 py-3 text-xs font-bold text-slate-400 border rounded-xl uppercase">Cancelar</button>
        <button 
          type="submit" 
          className={`flex-1 py-3 text-white rounded-xl text-xs font-black uppercase shadow-lg transition-all ${
            esInterno ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#1a3a5c] hover:bg-[#11273f]'
          }`}
        >
          {txtBoton}
        </button>
      </div>
    </form>
  )
}

/* ─── 🚀 COMPONENTE PRINCIPAL (GESTIÓN DE INGRESOS) ──────────────── */
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

  const esGlobal = user?.rol === 'Admin' || user?.rol === 'Gerente'

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const fetchI = api.get('/ingresos').catch(() => ({ data: [] }));
      const fetchT = api.get('/talleres').catch(() => ({ data: [] }));
      const fetchM = api.get('/costos-maestros').catch(() => ({ data: [] }));
      const fetchP = api.get('/proveedores').catch(() => ({ data: [] }));

      const [rI, rT, rM, rP] = await Promise.all([fetchI, fetchT, fetchM, fetchP]);
      setMovimientos(rI.data); setTalleres(rT.data); setMaestros(rM.data); setProveedores(rP.data);
      if (!esGlobal && user?.tallerId) setTabActiva(user.tallerId);
    } finally { setLoading(false); }
  }

  useEffect(() => { cargarDatos() }, [user])

  const handleRegistrar = async (payload) => {
    const tid = toast.loading("Guardando...");
    try {
      await api.post('/ingresos', payload);
      toast.success("Stock actualizado", { id: tid });
      setModalNuevo(false);
      cargarDatos();
    } catch (e) { toast.error("Error al registrar", { id: tid }) }
  }

  const filtered = useMemo(() => {
    return movimientos.filter(m => {
      const matchSede = tabActiva === 'todos' || String(m.tallerId) === String(tabActiva)
      return matchSede && (m.costoMaestro?.nombre?.toLowerCase().includes(search.toLowerCase()))
    })
  }, [movimientos, tabActiva, search])

  if (loading) return <Layout tituloNavbar="Historial"> <div className="p-20 text-center font-black text-slate-200">CARGANDO...</div> </Layout>

  return (
    <Layout tituloNavbar="Gestión de Ingresos">
      <div className="p-6 bg-[#f6f8fb] min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Movimientos de Entrada</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Sistema Dr. Motors</p>
          </div>
          <button onClick={() => setModalNuevo(true)} className="px-6 py-3 bg-[#1a3a5c] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl">
             + Registrar Ingreso
          </button>
        </div>

        {esGlobal && (
          <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border w-fit shadow-sm overflow-x-auto">
            <button onClick={() => setTabActiva('todos')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tabActiva === 'todos' ? 'bg-[#1a3a5c] text-white shadow-lg' : 'text-slate-400'}`}>TODOS</button>
            {talleres.map(t => (
              <button key={t.id} onClick={() => setTabActiva(t.id)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tabActiva === t.id ? 'bg-[#1a3a5c] text-white shadow-lg' : 'text-slate-400'}`}>{t.nombre}</button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-50 flex items-center gap-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar por producto..." className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold w-64 outline-none" />
              <span className="text-[10px] font-bold text-slate-300 uppercase">{filtered.length} Movimientos</span>
           </div>
           <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Fecha / Sede</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Motivo / Referencia</th>
                  <th className="px-6 py-4 text-center">Cant.</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-800">{new Date(m.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{m.taller?.nombre}</p>
                    </td>
                    
                    {/* 🚀 CELDA MODIFICADA: Ahora incluye la medida */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-800 uppercase">{m.costoMaestro?.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[9px] font-bold text-blue-500 uppercase">{m.costoMaestro?.marca}</p>
                        <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          {m.costoMaestro?.medida || 'Und'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-600 uppercase">{m.motivo}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{m.tipo}</p>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      {/* 💡 Tip: También podrías poner la medida aquí al lado del número si prefieres */}
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-black text-xs">
                        +{m.cantidad}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <EstadoBadge estado={m.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
           {filtered.length === 0 && <div className="p-20 text-center text-slate-200 font-black text-[10px] uppercase tracking-[0.2em]">Esperando registros...</div>}
        </div>
      </div>

      {modalNuevo && (
        <Modal title="Carga de Inventario" onClose={() => setModalNuevo(false)} wide>
          <FormIngreso onSubmit={handleRegistrar} onClose={() => setModalNuevo(false)} user={user} catMaestros={maestros} catTalleres={talleres} catProveedores={proveedores} />
        </Modal>
      )}
    </Layout>
  )
}