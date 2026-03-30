import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios' 
import { toast } from 'react-hot-toast'

/* ─── COMPONENTES VISUALES ─────────────────────────────────────── */
function SortIcon({ dir }) {
  return (
    <span style={{ opacity: dir ? 1 : 0.3, marginLeft: 4, display: 'inline-flex', flexDirection: 'column', gap: 1.5 }}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'asc' ? '#1a3a5c' : '#94a3b8'} /></svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ transform: 'rotate(180deg)' }}><path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'desc' ? '#1a3a5c' : '#94a3b8'} /></svg>
    </span>
  )
}

function EstadoPedidoBadge({ estado }) {
  const config = {
    // 🚀 CAMBIO: Ahora dice "SOLICITADO POR TALLER"
    'PENDIENTE':  { bg: '#faf5ff', color: '#6d28d9', dot: '#8b5cf6', border: '#e9d5ff', label: 'SOLICITADO POR TALLER' },
    'DESPACHADO': { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe', label: 'EN CAMINO' },
    'ENTREGADO':  { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', border: '#bbf7d0', label: 'ENTREGADO' },
    'RECHAZADO':  { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444', border: '#fecaca', label: 'RECHAZADO' },
  }
  
  const c = config[estado] || config['PENDIENTE'];
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

/* ─── COMPONENTE PRINCIPAL ─────────────────────────────────────── */
export default function Pedidos() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [talleres, setTalleres] = useState([])
  const [filtroTab, setFiltroTab] = useState('PENDIENTES')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ col: 'createdAt', dir: 'desc' })
  const [loading, setLoading] = useState(true)

  const userRol = useMemo(() => user?.rol?.toUpperCase() || '', [user])
  const esGlobal = userRol === 'ADMIN' || userRol === 'GERENTE'

  // 🚀 1. Carga inicial de datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resT, resP] = await Promise.all([
          api.get('/talleres'),
          api.get(`/pedidos?tallerId=${esGlobal ? '' : user?.tallerId}&rol=${userRol}`)
        ]);
        setTalleres(resT.data);
        setPedidos(resP.data);
      } catch (error) {
        console.error("Error sincronizando:", error);
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, userRol, esGlobal]);

  // 🚀 2. Lógica de Pestañas (SOLO PARA ADMIN)
  const tabsTalleres = useMemo(() => {
    if (!esGlobal) return []; // Si no es admin, no hay pestañas
    return [{ id: 'todos', nombre: 'Vista Global' }, ...talleres];
  }, [esGlobal, talleres]);

  // Si es taller, la tab activa es siempre su tallerId
  const [tabTallerActiva, setTabTallerActiva] = useState(esGlobal ? 'todos' : user?.tallerId)

  // Sincronizar tab activa si el usuario cambia (seguridad)
  useEffect(() => {
    if (user && !esGlobal) setTabTallerActiva(user.tallerId);
  }, [user, esGlobal]);

  // 🚀 3. Filtrado de la Tabla
  const filtrados = useMemo(() => {
    let d = pedidos.filter(p => {
      // Filtro de Sede
      const matchTaller = tabTallerActiva === 'todos' || 
                          Number(p.tallerOrigenId) === Number(tabTallerActiva) || 
                          Number(p.tallerId) === Number(tabTallerActiva);
      
      // Filtro de Proceso (Pendientes vs Historial)
      const matchEstado = filtroTab === 'PENDIENTES' 
        ? (p.estado === 'PENDIENTE' || p.estado === 'DESPACHADO') 
        : (p.estado === 'ENTREGADO' || p.estado === 'RECHAZADO');

      // Buscador
      const q = search.toLowerCase();
      const matchSearch = p.codigo.toLowerCase().includes(q) || 
                          (p.costoMaestro?.nombre || '').toLowerCase().includes(q) ||
                          (p.placa || '').toLowerCase().includes(q);

      return matchTaller && matchEstado && matchSearch;
    });

    return d.sort((a, b) => {
      const valA = a[sort.col] || '';
      const valB = b[sort.col] || '';
      return sort.dir === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
  }, [pedidos, tabTallerActiva, filtroTab, search, sort])

  // 🚀 4. Handlers de Acción
  const handleCambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Confirmar ${nuevoEstado} de este repuesto?`)) return;

    try {
      // 1. Enviamos la actualización
      await api.patch(`/pedidos/${id}/estado`, { 
        nuevoEstado,
        usuarioId: user.id 
      });
      
      // 2. Si el patch funcionó, mostramos el éxito
      toast.success("¡Operación realizada con éxito!");

      // 3. Intentamos refrescar, pero de forma segura
      try {
        await fetchData(); 
      } catch (err) {
        console.warn("La base de datos actualizó, pero hubo un error al recargar la vista.");
      }

    } catch (error) {
      // 4. Solo si el PATCH falla de verdad, mostramos el rojo
      console.error(error);
      toast.error("No se pudo procesar el cambio de estado");
    }
  };

  const handleRechazar = async (id) => {
    const motivo = window.prompt("Indica el motivo del rechazo para informar a la otra sede:");
    if (!motivo) return;
    try {
      await api.patch(`/pedidos/${id}/estado`, { nuevoEstado: 'RECHAZADO', motivoRechazo: motivo });
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: 'RECHAZADO', observaciones: motivo } : p));
      toast.success("Pedido rechazado");
    } catch (error) {
      toast.error("Error al procesar rechazo");
    }
  };

  // 🚀 5. Stats Reactivas
  const statCount = (type) => {
    return pedidos.filter(p => {
      const matchTaller = tabTallerActiva === 'todos' || Number(p.tallerOrigenId) === Number(tabTallerActiva);
      return matchTaller && (type === 'PENDIENTE' ? p.estado === 'PENDIENTE' : p.estado === 'ENTREGADO');
    }).length;
  };

  if (loading) return <Layout tituloNavbar="Dr. Motors"><div className="p-20 text-center animate-pulse text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Almacén...</div></Layout>

  return (
    <Layout tituloNavbar="Gestión de Almacén y Pedidos">
      <div className="p-4 sm:p-6 min-h-screen" style={{ background: '#f6f8fb' }}>
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-[#1a3a5c]">Despacho de Repuestos</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Logística de transferencia entre sedes</p>
          </div>
          <div className="relative w-full sm:w-80">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pedido, placa o repuesto..." className="w-full pl-4 pr-3 py-3 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm focus:border-[#1a3a5c] transition-all outline-none" />
          </div>
        </div>

        {/* 🚀 SELECTOR DE SEDE (Solo visible para ADMIN) */}
        {esGlobal ? (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {tabsTalleres.map((t) => (
              <button
                key={t.id}
                onClick={() => setTabTallerActiva(t.id)}
                className={`px-6 py-2.5 text-[11px] font-black rounded-xl uppercase tracking-wider transition-all shadow-sm border ${
                  String(tabTallerActiva) === String(t.id)
                    ? 'bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-blue-900/20'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                }`}
              >
                {t.nombre}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <span className="px-5 py-2.5 bg-white text-[#1a3a5c] rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
              📍 Sede actual: {talleres.find(t => Number(t.id) === Number(user?.tallerId))?.nombre || 'Mi Taller'}
            </span>
          </div>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pendientes', value: statCount('PENDIENTE'), icon: '⏳', accent: '#b45309' },
            { label: 'Entregados', value: statCount('ENTREGADO'), icon: '✅', accent: '#15803d' },
            { label: 'Alertas', value: 0, icon: '⚠️', accent: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="rounded-3xl p-5 bg-white border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className="text-4xl font-black" style={{ color: s.accent }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
          {/* Sub-tabs Proceso */}
          <div className="flex gap-1 p-2 bg-slate-50/50 border-b border-slate-100">
            {['PENDIENTES', 'HISTORIAL'].map(tab => (
              <button key={tab} onClick={() => setFiltroTab(tab)} className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${filtroTab === tab ? 'bg-white text-[#1a3a5c] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab === 'PENDIENTES' ? `Solicitudes (${filtrados.length})` : 'Historial'}
              </button>
            ))}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase">Cód / Fecha</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase">Repuesto / Solicitante</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Cant.</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Estado</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.length > 0 ? filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-5">
                      <p className="text-xs font-black text-slate-800">{p.codigo}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-xs font-black text-slate-800 uppercase">{p.costoMaestro?.nombre}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {/* 🔵 Aquí forzamos el color azul y que sea el campo 'solicitante' el que se muestre */}
                        <p className="text-[10px] font-bold text-blue-500 uppercase">
                          {p.solicitante}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-[#1a3a5c]">{p.cantidad}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <EstadoPedidoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-center gap-2">
                        
                        {/* 🚀 SI ESTÁ SOLICITADO: Jhon ve el botón de Despachar y Rechazar */}
                        {p.estado === 'PENDIENTE' && (
                          <>
                            {/* BOTÓN DESPACHAR: Este es el que cambia a "EN CAMINO" */}
                            <button 
                              onClick={() => handleCambiarEstado(p.id, 'DESPACHADO')}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title="Despachar Repuesto"
                            >
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </button>

                            {/* BOTÓN RECHAZAR */}
                            <button 
                              onClick={() => handleRechazar(p.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Rechazar Pedido"
                            >
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </>
                        )}

                        {/* BOTÓN VER DETALLES (El ojo que ya tienes) */}
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-200 transition-all">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <p className="text-4xl mb-3">📦</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin movimientos registrados</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}