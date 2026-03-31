import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Layout from '../components/layout/Layout'

/* ─── 1. CONSTANTES ────────────────────────────────────────────── */
const API_URL = 'http://localhost:4000/api/servicios'; 
const SECTORES_URL = 'http://localhost:4000/api/sectores'; // 🚀 Nueva URL

const TIPOS = ['MANTENIMIENTO', 'DIAGNOSTICO']
const ESP_MANT = ['PREVENTIVO', 'PREVENTIVO AIRE ACONDICIONADO']
const ESP_DIAG = ['DIAGNOSTICO']
const NIVELES_MANT = ['MENOR', 'MAYOR']
const NIVELES_DIAG = ['MENOR', 'REGULAR', 'MAYOR']
const TECNOLOGIAS = ['CONVENCIONAL', 'DIESEL', 'GAMA ALTA']
const CATEGORIAS = ['AUTO', 'CAMIONETA', 'FURGON', 'GAMA ALTA']

const INSUMOS_MAESTROS = [
  'ACEITE DE MOTOR', 'FILTRO DE ACEITE', 'FILTRO DE AIRE', 'FILTRO DE CABINA / AC',
  'BUJIAS', 'ARANDELA DE TAPON', 'LIQUIDO DE FRENOS', 'REFRIGERANTE', 'LIMPIA FRENOS',
  'GRASA LUBRICANTE', 'OTROS'
];

const ESP_COLOR = {
  'PREVENTIVO': { bg: '#eff6ff', color: '#1d4ed8' },
  'PREVENTIVO AIRE ACONDICIONADO': { bg: '#f0fdf4', color: '#15803d' },
  'DIAGNOSTICO': { bg: '#faf5ff', color: '#7c3aed' },
}

const ROWS_PER_PAGE = 10
const LABEL_STYLE = "text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block";

/* ─── 2. COMPONENTES DE UI ─────────────────────────────────────── */

function Modal({ title, onClose, children, wide }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(2px)' }} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in fade-in zoom-in duration-200`}>
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-[13px] font-black text-[#007bff] uppercase tracking-tight">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: '85vh' }}>{children}</div>
        </div>
      </div>
    </>
  )
}

function ActionBtn({ icon, onClick, title, hoverBg = "#1a3a5c", color = "#94a3b8" }) {
  const [hov, setHov] = useState(false)
  const icons = {
    edit: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    pasos: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    insumos: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  }
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="p-2 rounded-lg transition-all border border-gray-100 shadow-sm"
      style={{ color: hov ? '#fff' : color, background: hov ? hoverBg : 'transparent' }}>
      {icons[icon]}
    </button>
  )
}

/* ─── 3. MODALES DE LÓGICA ─────────────────────────────────────── */

function FormNuevoServicio({ onCreate, onClose }) {
  const [formData, setFormData] = useState({ 
    tipo: 'MANTENIMIENTO', especialidad: 'PREVENTIVO', nivel: 'MENOR', 
    tecnologia: 'CONVENCIONAL', categoriaVehiculo: 'AUTO', duracion: '2', precioBase: 0 
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); onCreate({...formData, pasos: [], kit: []}); onClose(); }} className="space-y-5">
      <div>
        <label className={LABEL_STYLE}>Tipo de Servicio</label>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map(t => (
            <button key={t} type="button" onClick={() => setFormData({...formData, tipo: t, especialidad: t === 'MANTENIMIENTO' ? 'PREVENTIVO' : 'DIAGNOSTICO'})}
              className={`py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.tipo === t ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : 'bg-gray-50 text-gray-400 border-transparent'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={LABEL_STYLE}>Especialidad</label><select value={formData.especialidad} onChange={e => setFormData({...formData, especialidad: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#1a3a5c]">{(formData.tipo === 'MANTENIMIENTO' ? ESP_MANT : ESP_DIAG).map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div><label className={LABEL_STYLE}>Nivel de Servicio</label><select value={formData.nivel} onChange={e => setFormData({...formData, nivel: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#1a3a5c]">{(formData.tipo === 'MANTENIMIENTO' ? NIVELES_MANT : NIVELES_DIAG).map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div><label className={LABEL_STYLE}>Tecnología</label><select value={formData.tecnologia} onChange={e => setFormData({...formData, tecnologia: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#1a3a5c]">{TECNOLOGIAS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div><label className={LABEL_STYLE}>Categoría Vehículo</label><select value={formData.categoriaVehiculo} onChange={e => setFormData({...formData, categoriaVehiculo: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[#1a3a5c]">{CATEGORIAS.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
        <div><label className={LABEL_STYLE}>Duración Estimada</label><input type="text" value={formData.duracion} onChange={e => setFormData({...formData, duracion: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-blue-600 outline-none focus:border-[#1a3a5c]" /></div>
        <div><label className={LABEL_STYLE}>Precio Base (S/.)</label><input type="number" value={formData.precioBase} onChange={e => setFormData({...formData, precioBase: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-black text-green-600 outline-none focus:border-[#1a3a5c]" /></div>
      </div>
      <button type="submit" className="w-full py-3.5 bg-[#1a3a5c] text-white text-[11px] font-black rounded-xl uppercase tracking-widest shadow-lg hover:bg-[#243f66] transition-all flex items-center justify-center gap-2">✓ Crear Servicio Maestro</button>
    </form>
  )
}

function ModalInsumos({ servicio, onClose, onSave }) {
  const [insumos, setInsumos] = useState(servicio.kit ?? []);
  const [nombre, setNombre] = useState(INSUMOS_MAESTROS[0]);
  const [cantidad, setCantidad] = useState(1);

  const agregar = () => {
    if (insumos.find(i => i.descripcion === nombre)) return alert("Este insumo ya está en la lista");
    setInsumos([...insumos, { descripcion: nombre, cantidad: Number(cantidad) }]);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={LABEL_STYLE}>Seleccionar Insumo</label>
            <select value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-4 py-2 bg-white border rounded-xl text-xs font-bold outline-none focus:border-[#15803d]">
              {INSUMOS_MAESTROS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className={LABEL_STYLE}>Cant.</label>
            <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} className="w-full px-4 py-2 bg-white border rounded-xl text-sm font-black text-green-600 text-center outline-none" />
          </div>
        </div>
        <button onClick={agregar} className="w-full py-2 bg-[#15803d] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#1a9348] transition-all">+ Vincular al Kit</button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {insumos.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm group transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-xs">🛠️</div>
              <div><p className="text-xs font-bold text-gray-700">{item.descripcion}</p><p className="text-[10px] font-black text-green-600 uppercase">Cantidad sugerida: {item.cantidad}</p></div>
            </div>
            <button onClick={() => setInsumos(insumos.filter((_, i) => i !== idx))} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => { onSave(servicio.id, { ...servicio, kit: insumos }); onClose(); }} className="w-full py-3.5 bg-[#1a3a5c] text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-lg">✓ Confirmar Materiales</button>
    </div>
  )
}

function ModalPasos({ servicio, onClose, onSave, sectores, onAddSector }) {
  const [pasos, setPasos] = useState(servicio.pasos ?? [])
  const [desc, setDesc] = useState('')
  const [sectorId, setSectorId] = useState(sectores[0]?.id || '')
  const [filtroSector, setFiltroSector] = useState('TODOS')
  
  const isMantenimiento = servicio.tipo === 'MANTENIMIENTO'

  const agregar = () => { 
    if(!desc.trim()) return; 
    const nuevoPaso = {
      id: Date.now(),
      sectorId: isMantenimiento ? Number(sectorId) : null, 
      descripcion: desc.trim(),
      orden: pasos.length,
      // Guardamos una copia del sector para el render inmediato
      sector: sectores.find(s => s.id === Number(sectorId)) 
    }
    setPasos([...pasos, nuevoPaso]); 
    setDesc('') 
  }

  const pasosFiltrados = useMemo(() => {
    if (!isMantenimiento || filtroSector === 'TODOS') return pasos;
    return pasos.filter(p => (p.sectorId || p.sector?.id) === Number(filtroSector));
  }, [pasos, filtroSector, isMantenimiento]);

  return (
    <div className="space-y-5">
      {/* ─── ZONA DE ENTRADA ─── */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
        <div className="flex gap-2">
          {isMantenimiento && (
            <div className="flex gap-1">
              <select value={sectorId} onChange={e => setSectorId(e.target.value)} 
                className="px-3 py-2 bg-white border rounded-xl text-xs font-bold outline-none focus:border-[#007bff] shadow-sm min-w-[120px]">
                {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
              {/* 🚀 BOTÓN PARA AÑADIR SECTOR DINÁMICO */}
              <button onClick={() => {
                const n = prompt("Nuevo Sector:");
                if(n) onAddSector(n);
              }} className="p-2 bg-white border rounded-xl text-[#007bff] hover:bg-blue-50 transition-all font-bold">+</button>
            </div>
          )}
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción del paso..." 
            className="flex-1 px-4 py-2 bg-white border rounded-xl text-sm outline-none focus:border-[#007bff] shadow-sm" />
          <button onClick={agregar} className="px-5 py-2 bg-[#007bff] text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md">Añadir</button>
        </div>
      </div>

      {/* ─── FILTRADO ─── */}
      {isMantenimiento && (
        <div className="px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-gray-400"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtrar por sector:</span>
          </div>
          <select value={filtroSector} onChange={e => setFiltroSector(e.target.value)}
            className="bg-transparent text-[10px] font-black text-[#007bff] uppercase outline-none cursor-pointer">
            <option value="TODOS">MOSTRAR TODOS</option>
            {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      )}

      {/* ─── LISTADO ─── */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {pasosFiltrados.map((p, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
            <span className="w-7 h-7 flex items-center justify-center bg-blue-50 text-[#007bff] rounded-full text-[10px] font-black">
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700 leading-tight">{p.descripcion}</p>
              {isMantenimiento && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-[9px] font-black text-[#007bff] rounded-md border border-blue-100 uppercase">
                  {/* Priorizamos el nombre que viene del objeto sector del backend */}
                  {p.sector?.nombre || sectores.find(s => s.id === (p.sectorId || p.sector?.id))?.nombre || 'SIN SECTOR'}
                </span>
              )}
            </div>
            <button onClick={() => setPasos(pasos.filter((_, i) => i !== idx))} 
              className="p-2 text-gray-300 hover:text-red-500 rounded-xl">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => {onSave(servicio.id, { ...servicio, pasos }); onClose();}} 
        className="w-full py-4 bg-[#1a3a5c] text-white text-[11px] font-black rounded-2xl uppercase tracking-[2px] shadow-lg">
        ✓ Guardar Hoja Técnica
      </button>
    </div>
  )
}

/* ─── 4. COMPONENTE PRINCIPAL ───────────────────────────────────── */

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [sectores, setSectores] = useState([]) // 🚀 Nuevo estado para sectores
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalPasos, setModalPasos] = useState(null)
  const [modalInsumos, setModalInsumos] = useState(null)
  
  const [search, setSearch] = useState(''), [tipoFilter, setTipoFilter] = useState('Todos'), [page, setPage] = useState(1)

  const loadData = async () => {
    try {
      const [resSrv, resSec] = await Promise.all([
        axios.get(API_URL),
        axios.get(SECTORES_URL)
      ]);
      setServicios(resSrv.data);
      setSectores(resSec.data);
    } catch (err) { console.error("Error cargando", err); }
  }

  useEffect(() => { loadData() }, [])

  // 🚀 Lógica para añadir sector dinámicamente
  const handleAddSector = async (nombre) => {
    try {
      const res = await axios.post(SECTORES_URL, { nombre });
      setSectores([...sectores, res.data]);
    } catch (err) { alert("El sector ya existe"); }
  }

  const toTitle = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''
  const getNombre = (s) => {
    if (s.tipo === 'MANTENIMIENTO') {
      const esp = s.especialidad === 'PREVENTIVO AIRE ACONDICIONADO' ? 'AIRE' : ''
      return `Mantenimiento ${s.nivel === 'MENOR' ? 'Menor' : 'Mayor'} ${toTitle(s.tecnologia)} - ${s.categoriaVehiculo} ${esp ? `(${esp})` : ''}`
    }
    return `Diagnóstico ${toTitle(s.nivel)} ${toTitle(s.tecnologia)} - ${s.categoriaVehiculo}`
  }

  const handleCreate = async (data) => {
    try { await axios.post(API_URL, data); loadData(); } catch (err) { alert("Error al crear"); }
  }

  const handleUpdate = async (id, fields) => {
    try { await axios.put(`${API_URL}/${id}`, fields); loadData(); setModalEditar(null); } catch (err) { alert("Error al actualizar"); }
  }

  const filtered = useMemo(() => {
    return servicios.filter(s => {
      const matchSearch = getNombre(s).toLowerCase().includes(search.toLowerCase())
      const matchTipo = tipoFilter === 'Todos' || s.tipo === tipoFilter
      return matchSearch && matchTipo
    })
  }, [servicios, search, tipoFilter])

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE)
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  return (
    <Layout tituloNavbar="Catálogo Global de Servicios">
      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-2xl font-black text-[#1a3a5c]">Hoja de Servicios</h1><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Definición Global Dr. Motors</p></div>
          <button onClick={() => setModalNuevo(true)} className="px-5 py-2.5 bg-[#1a3a5c] text-white text-[11px] font-black rounded-xl shadow-lg hover:bg-[#243f66] transition-all tracking-tight">+ NUEVO SERVICIO</button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50/30 border-b border-gray-50 flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} placeholder="Buscar servicio por nombre..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#1a3a5c] bg-white transition-all" />
            </div>
            <select value={tipoFilter} onChange={e => {setTipoFilter(e.target.value); setPage(1)}} className="px-3 py-2 text-[10px] font-black border border-gray-200 rounded-xl outline-none uppercase text-gray-500">
              <option value="Todos">Todos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-5 py-3">Servicio / Configuración</th>
                  <th className="px-5 py-3">Especialidad</th>
                  <th className="px-5 py-3 text-center">Duración</th>
                  <th className="px-5 py-3 text-center">Precio</th>
                  <th className="px-5 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.length > 0 ? rows.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-800">{getNombre(s)}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase mt-0.5">{s.tecnologia} — {s.categoriaVehiculo}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase" style={{ background: ESP_COLOR[s.especialidad]?.bg, color: ESP_COLOR[s.especialidad]?.color }}>
                        {s.especialidad === 'PREVENTIVO AIRE ACONDICIONADO' ? 'AIRE ACOND.' : s.especialidad}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-gray-600 text-xs">{s.duracion}</td>
                    <td className="px-5 py-4 text-center font-black text-green-700 text-sm">S/ {Number(s.precioBase).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1.5">
                        <ActionBtn icon="edit" title="Editar Precios" onClick={() => setModalEditar(s)} />
                        <ActionBtn icon="pasos" title="Pasos Hoja Técnica" onClick={() => setModalPasos(s)} hoverBg="#2563eb" />
                        {s.tipo === 'MANTENIMIENTO' && (
                          <ActionBtn icon="insumos" title="Kit Sugerido" onClick={() => setModalInsumos(s)} hoverBg="#15803d" color="#15803d" />
                        )}
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="px-5 py-20 text-center text-xs font-bold text-gray-400 uppercase tracking-tight">No se encontraron servicios registrados.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-gray-50 flex justify-between items-center bg-white">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Pág. {page} de {totalPages || 1}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(1)} className="w-8 h-8 border rounded-lg disabled:opacity-20 hover:bg-gray-50 font-bold transition-all text-xs">«</button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="w-8 h-8 border rounded-lg disabled:opacity-20 hover:bg-gray-50 font-bold transition-all text-xs">»</button>
            </div>
          </div>
        </div>
      </div>

      {modalNuevo && <Modal title="Nuevo Servicio Maestro" onClose={() => setModalNuevo(false)} wide><FormNuevoServicio onCreate={handleCreate} onClose={() => setModalNuevo(false)} /></Modal>}
      
      {modalEditar && (
        <Modal title="Editar Comercial" onClose={() => setModalEditar(null)}>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Servicio Seleccionado</p><p className="text-xs font-bold text-[#1a3a5c]">{getNombre(modalEditar)}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={LABEL_STYLE}>Precio Base (S/.)</label><input type="number" id="ep" defaultValue={modalEditar.precioBase} className="w-full px-3 py-2 border rounded-lg font-black text-green-600 outline-none focus:border-[#1a3a5c]" /></div>
              <div><label className={LABEL_STYLE}>Duración</label><input type="text" id="ed" defaultValue={modalEditar.duracion} className="w-full px-3 py-2 border rounded-lg font-black text-blue-600 outline-none focus:border-[#1a3a5c]" /></div>
            </div>
            <button onClick={() => handleUpdate(modalEditar.id, { ...modalEditar, precioBase: document.getElementById('ep').value, duracion: document.getElementById('ed').value })} className="w-full py-3 bg-[#1a3a5c] text-white text-[11px] font-black rounded-xl uppercase tracking-widest shadow-lg">Guardar Cambios</button>
          </div>
        </Modal>
      )}
      
      {modalPasos && (
        <Modal title={`Hoja Técnica: ${getNombre(modalPasos)}`} onClose={() => setModalPasos(null)} wide>
          <ModalPasos 
            servicio={modalPasos} 
            onClose={() => setModalPasos(null)} 
            onSave={handleUpdate} 
            sectores={sectores}
            onAddSector={handleAddSector}
          />
        </Modal>
      )}

      {modalInsumos && (
        <Modal title={`Kit de Materiales: ${getNombre(modalInsumos)}`} onClose={() => setModalInsumos(null)}>
          <ModalInsumos servicio={modalInsumos} onClose={() => setModalInsumos(null)} onSave={handleUpdate} />
        </Modal>
      )}
    </Layout>
  )
}