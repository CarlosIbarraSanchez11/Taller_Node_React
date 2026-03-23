import { useState, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import { productosMock, serviciosMock as initialServicios } from '../services/mockData'

/* ─── 1. CONSTANTES ────────────────────────────────────────────── */
const TIPOS          = ['MANTENIMIENTO', 'DIAGNOSTICO']
const ESP_MANT       = ['PREVENTIVO', 'PREVENTIVO AIRE ACONDICIONADO', 'CORRECTIVO']
const ESP_DIAG       = ['DIAGNOSTICO']
const NIVELES_MANT   = ['MENOR', 'MAYOR']
const NIVELES_DIAG   = ['MENOR', 'REGULAR', 'MAYOR']
const TECNOLOGIAS    = ['CONVENCIONAL', 'DIESEL', 'GAMA ALTA']
const CATEGORIAS     = ['AUTO', 'CAMIONETA', 'FURGON', 'GAMA ALTA']
const AREAS_PASO     = ['MOTOR', 'FRENOS', 'SUSPENSION', 'ELECTRICO', 'TRANSMISION', 'CARROCERIA', 'GENERAL']
const FASES_PASO     = ['RECEPCIÓN', 'EJECUCIÓN', 'ENTREGA']

const ESP_COLOR = {
  'PREVENTIVO':                    { bg: '#eff6ff', color: '#1d4ed8' },
  'PREVENTIVO AIRE ACONDICIONADO': { bg: '#f0fdf4', color: '#15803d' },
  'CORRECTIVO':                    { bg: '#fff5f5', color: '#dc2626' },
  'DIAGNOSTICO':                   { bg: '#faf5ff', color: '#7c3aed' },
}

const ROWS_PER_PAGE = 10

/* ─── 2. UI COMPONENTS ─────────────────────────────────────────── */

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
  const [formData, setFormData] = useState({ tipo: 'MANTENIMIENTO', especialidad: 'PREVENTIVO', nivel: 'MENOR', tecnologia: 'CONVENCIONAL', categoria: 'AUTO', duracion: 2, precio: 0 })
  const handleSubmit = (e) => { e.preventDefault(); onCreate({ ...formData, id: Date.now(), insumos: [], pasos: [] }); onClose(); }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {TIPOS.map(t => (
          <button key={t} type="button" onClick={() => setFormData({...formData, tipo: t, especialidad: t === 'MANTENIMIENTO' ? 'PREVENTIVO' : 'DIAGNOSTICO'})}
            className={`py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.tipo === t ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : 'bg-gray-50 text-gray-400 border-transparent'}`}>{t}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select value={formData.especialidad} onChange={e => setFormData({...formData, especialidad: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none">
          {(formData.tipo === 'MANTENIMIENTO' ? ESP_MANT : ESP_DIAG).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={formData.nivel} onChange={e => setFormData({...formData, nivel: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none">
          {(formData.tipo === 'MANTENIMIENTO' ? NIVELES_MANT : NIVELES_DIAG).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={formData.tecnologia} onChange={e => setFormData({...formData, tecnologia: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none">
          {TECNOLOGIAS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none">
          {CATEGORIAS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <input type="number" placeholder="Horas" value={formData.duracion} onChange={e => setFormData({...formData, duracion: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
        <input type="number" placeholder="Precio S/." value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-green-600 outline-none" />
      </div>
      <button type="submit" className="w-full py-3 bg-[#1a3a5c] text-white text-[11px] font-black rounded-xl uppercase tracking-widest shadow-lg hover:bg-[#243f66] transition-all">✓ Crear Servicio Maestro</button>
    </form>
  )
}

function ModalPasos({ servicio, onClose, onSave }) {
  const [pasos, setPasos] = useState(servicio.pasos ?? [])
  const [desc, setDesc] = useState(''), [area, setArea] = useState('MOTOR'), [fase, setFase] = useState('EJECUCIÓN')
  const isMantenimiento = servicio.tipo === 'MANTENIMIENTO'

  const agregar = () => { 
    if(!desc.trim()) return; 
    setPasos([...pasos, {id: Date.now(), area: isMantenimiento ? area : 'GENERAL', descripcion: desc.trim(), fase}]); 
    setDesc('') 
  }
  
  return (
    <div className="space-y-5">
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
        <div className="flex gap-2">
          {/* Selector de AREA solo si es Mantenimiento (Segunda imagen) */}
          {isMantenimiento && (
            <select value={area} onChange={e => setArea(e.target.value)} className="px-3 py-2 bg-white border rounded-xl text-xs font-bold outline-none focus:border-[#007bff]">
              {AREAS_PASO.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción del paso..." 
            className="flex-1 px-4 py-2 bg-white border rounded-xl text-sm outline-none focus:border-[#007bff]" />
          <select value={fase} onChange={e => setFase(e.target.value)} className="px-3 py-2 bg-white border rounded-xl text-xs font-bold outline-none">
            {FASES_PASO.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button onClick={agregar} className="px-5 py-2 bg-[#007bff] text-white rounded-xl text-xs font-black uppercase tracking-tight">Añadir</button>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {pasos.map((p, idx) => (
          <div key={p.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
            <span className="w-6 h-6 flex items-center justify-center bg-[#007bff] text-white rounded-full text-[10px] font-black flex-shrink-0">{idx + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">{p.descripcion}</p>
              {isMantenimiento && <span className="text-[9px] font-black text-blue-500 uppercase">{p.area}</span>}
            </div>
            <button onClick={() => setPasos(pasos.filter(x => x.id !== p.id))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all">
               <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => {onSave(servicio.id, {pasos}); onClose();}} className="w-full py-3.5 bg-[#1a3a5c] text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-lg">✓ Guardar Hoja Técnica</button>
    </div>
  )
}

function ModalInsumos({ servicio, onClose, onSave }) {
  const [insumos, setInsumos] = useState(servicio.insumos ?? [])
  const [prodId, setProdId] = useState(''), [cant, setCant] = useState(1)
  const lista = useMemo(() => { const seen = new Set(); return productosMock.filter(p => { const d = seen.has(p.nombre); seen.add(p.nombre); return !d }) }, [])
  const vincular = () => {
    const p = productosMock.find(x => x.id === Number(prodId))
    if(p && !insumos.find(i => i.productoId === p.id)) {
      setInsumos([...insumos, {productoId: p.id, productoNombre: p.nombre, cantidad: Number(cant), medida: p.medida}])
      setProdId('')
    }
  }
  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-3">
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Vincular repuesto de almacén</p>
        <div className="flex gap-2">
          <select value={prodId} onChange={e => setProdId(e.target.value)} className="flex-1 px-4 py-2 bg-white border rounded-xl text-sm outline-none focus:border-blue-500 font-medium">
            <option value="">Buscar en inventario...</option>
            {lista.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <input type="number" value={cant} onChange={e => setCant(e.target.value)} className="w-24 px-3 py-2 bg-white border rounded-xl text-center font-black text-blue-600 outline-none" />
        </div>
        <button onClick={vincular} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Vincular al Servicio</button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {insumos.map(i => (
          <div key={i.productoId} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-lg">📦</div>
              <div><p className="text-sm font-bold text-gray-800">{i.productoNombre}</p><p className="text-[10px] font-black text-green-600 uppercase">Sugerido: {i.cantidad} {i.medida}</p></div>
            </div>
            <button onClick={() => setInsumos(insumos.filter(x => x.productoId !== i.productoId))} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
        ))}
      </div>
      <button onClick={() => {onSave(servicio.id, {insumos}); onClose();}} className="w-full py-3.5 bg-[#1a3a5c] text-white text-[11px] font-black rounded-2xl uppercase tracking-widest shadow-lg">✓ Confirmar Materiales</button>
    </div>
  )
}

/* ─── 4. COMPONENTE PRINCIPAL (MAESTRO) ─────────────────────────── */

export default function Servicios() {
  const [servicios, setServicios]   = useState(initialServicios)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalPasos, setModalPasos]   = useState(null)
  const [modalInsumos, setModalInsumos] = useState(null)
  
  const [search, setSearch] = useState(''), [tipoFilter, setTipoFilter] = useState('Todos'), [page, setPage] = useState(1)

  const toTitle = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  const getNombre = (s) => {
    if (s.tipo === 'MANTENIMIENTO') {
      const esp = s.especialidad === 'PREVENTIVO AIRE ACONDICIONADO' ? 'AIRE' : ''
      return `Mantenimiento ${s.nivel === 'MENOR' ? 'Menor' : 'Mayor'} ${toTitle(s.tecnologia)} - ${s.categoria} ${esp ? `(${esp})` : ''}`
    }
    return `Diagnóstico ${toTitle(s.nivel)} ${toTitle(s.tecnologia)} - ${s.categoria}`
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

  const handleUpdate = (id, fields) => setServicios(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s))

  return (
    <Layout tituloNavbar="Catálogo Global de Servicios">
      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-2xl font-black text-[#1a3a5c]">Hoja de Servicios</h1><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Definición Global Dr. Motors</p></div>
          <button onClick={() => setModalNuevo(true)} className="px-5 py-2.5 bg-[#1a3a5c] text-white text-[11px] font-black rounded-xl shadow-lg hover:bg-[#243f66] transition-all">+ NUEVO SERVICIO</button>
        </div>

        {/* Tabla Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gray-50/30 border-b border-gray-50 flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} placeholder="Buscar servicio por nombre..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#1a3a5c] outline-none bg-white transition-all" />
            </div>
            <select value={tipoFilter} onChange={e => {setTipoFilter(e.target.value); setPage(1)}} className="px-3 py-2 text-[10px] font-black border border-gray-200 rounded-xl outline-none uppercase text-gray-500">
              <option value="Todos">Todos los tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-5 py-3 text-left">Servicio / Configuración</th>
                  <th className="px-5 py-3 text-left">Especialidad</th>
                  <th className="px-5 py-3 text-center">Duración</th>
                  <th className="px-5 py-3 text-center">Precio</th>
                  <th className="px-5 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-800">{getNombre(s)}</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase mt-0.5">{s.tecnologia} — {s.categoria}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase" style={{ background: ESP_COLOR[s.especialidad]?.bg, color: ESP_COLOR[s.especialidad]?.color }}>
                        {s.especialidad === 'PREVENTIVO AIRE ACONDICIONADO' ? 'AIRE ACOND.' : s.especialidad}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-gray-600 text-xs">{s.duracion} hrs</td>
                    <td className="px-5 py-4 text-center font-black text-green-700 text-sm">S/ {Number(s.precio).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1.5">
                        <ActionBtn icon="edit" title="Precios" onClick={() => setModalEditar(s)} />
                        <ActionBtn icon="pasos" title="Pasos" onClick={() => setModalPasos(s)} hoverBg="#2563eb" />
                        
                        {/* 🚀 EL BOTÓN DE INSUMOS SOLO PARA MANTENIMIENTO */}
                        {s.tipo === 'MANTENIMIENTO' && (
                          <ActionBtn icon="insumos" title="Insumos" onClick={() => setModalInsumos(s)} hoverBg="#15803d" color="#15803d" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🚀 PAGINACIÓN FUNCIONAL */}
          <div className="px-6 py-3 border-t border-gray-50 flex justify-between items-center bg-white">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Pág. {page} de {totalPages || 1}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(1)} className="w-8 h-8 border rounded-lg disabled:opacity-20 hover:bg-gray-50 font-bold transition-all text-xs">«</button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 border rounded-lg disabled:opacity-20 hover:bg-gray-50 font-bold transition-all text-xs">‹</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 border rounded-lg disabled:opacity-20 hover:bg-gray-50 font-bold transition-all text-xs">›</button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="w-8 h-8 border rounded-lg disabled:opacity-20 hover:bg-gray-50 font-bold transition-all text-xs">»</button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALES */}
      {modalNuevo && <Modal title="Configurar Nuevo Servicio Maestro" onClose={() => setModalNuevo(false)} wide><FormNuevoServicio onCreate={(n) => {setServicios([n, ...servicios]); setModalNuevo(false);}} onClose={() => setModalNuevo(false)} /></Modal>}
      {modalEditar && <Modal title="Editar Comercial" onClose={() => setModalEditar(null)}><div className="space-y-4"><div className="p-3 bg-gray-50 rounded-xl"><p className="text-[9px] font-black text-gray-400 uppercase">Servicio Maestro</p><p className="text-xs font-bold text-[#1a3a5c]">{getNombre(modalEditar)}</p></div><div className="grid grid-cols-2 gap-3"><div><label className="text-[9px] font-black text-gray-400 uppercase">Precio Base (S/.)</label><input type="number" id="ep" defaultValue={modalEditar.precio} className="w-full px-3 py-2 border rounded-lg font-black text-green-600 outline-none" /></div><div><label className="text-[9px] font-black text-gray-400 uppercase">Horas Estimadas</label><input type="number" id="ed" defaultValue={modalEditar.duracion} className="w-full px-3 py-2 border rounded-lg font-black text-blue-600 outline-none" /></div></div><button onClick={() => handleUpdate(modalEditar.id, { precio: document.getElementById('ep').value, duracion: document.getElementById('ed').value })} className="w-full py-3 bg-[#1a3a5c] text-white text-[11px] font-black rounded-xl uppercase tracking-widest shadow-lg">Guardar Cambios</button></div></Modal>}
      
      {modalPasos && (
        <Modal title={`Hoja Técnica: ${getNombre(modalPasos)}`} onClose={() => setModalPasos(null)} wide>
          <ModalPasos servicio={modalPasos} onClose={() => setModalPasos(null)} onSave={handleUpdate} />
        </Modal>
      )}

      {modalInsumos && (
        <Modal title={`Materiales de Almacén: ${getNombre(modalInsumos)}`} onClose={() => setModalInsumos(null)}>
          <ModalInsumos servicio={modalInsumos} onClose={() => setModalInsumos(null)} onSave={handleUpdate} />
        </Modal>
      )}
    </Layout>
  )
}