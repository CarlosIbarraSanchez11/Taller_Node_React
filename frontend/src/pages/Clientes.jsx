import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { 
  clientesMock, 
  TIPOS_VEHICULO, 
  COMBUSTIBLES, 
  serviciosMock, 
  usuariosMock 
} from '../services/mockData'

const INIT_FORM = {
  nombre: '', dni: '', telefono: '', email: '',
  vehiculo: { placa: '', marca: '', modelo: '', anio: '', color: '', combustible: 'Gasolina', tipo: 'Auto' },
}

const ROWS_PER_PAGE = 8

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

  const [modalCita, setModalCita]       = useState(null) 
  const [tipoAtencion, setTipoAtencion] = useState('MANTENIMIENTO')
  const [formCita, setFormCita]         = useState({ 
    servicioId: '', tecnicoId: '', fecha: new Date().toISOString().split('T')[0], hora: '08:00' 
  })

  useEffect(() => {
    setPage(1)
  }, [search, sort, tipoFilter, citaFilter])


  const sumarHoras = (horaInicio, horasADisputar) => {
    if (!horaInicio) return ''
    const [h, m] = horaInicio.split(':').map(Number)
    const totalH = h + Number(horasADisputar)
    return `${totalH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const mecanicosDisponibles = useMemo(() => {
    if (!user) return [];
    return usuariosMock.filter(u => {
      const rolLimpio = u.rol.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const esTecnico = rolLimpio.includes("mecanico") || rolLimpio.includes("jefe"); 
      const esMismoTaller = user.tallerId === null || Number(u.tallerId) === Number(user.tallerId);
      return esTecnico && esMismoTaller && u.estado === 'Activo';
    });
  }, [user]);

  const serviciosFiltrados = useMemo(() => {
    return serviciosMock.filter(s => s.tipo === tipoAtencion)
  }, [tipoAtencion])

  const filtered = useMemo(() => {
    if (!user) return [] 
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
      return sort.dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return d
  }, [clientes, search, sort, tipoFilter, citaFilter, user])

  if (!user) return null

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)
  const conCita = clientes.filter(c => c.tieneCita).length
  const sinCita = clientes.filter(c => !c.tieneCita).length

  const setVehiculo = (field, value) => setForm({ ...form, vehiculo: { ...form.vehiculo, [field]: value } })

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

  const handleConfirmarCita = (data) => {
    setClientes(prev => prev.map(c => c.id === modalCita.id ? { ...c, tieneCita: true } : c))
    setModalCita(null)
  }

  const toggleSort = col => setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

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
    <Layout tituloNavbar="Gestión de Clientes Dr. Motors">
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(.96) translateY(6px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>

      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Directorio de Clientes</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Base de datos unificada de propietarios y vehículos</p>
          </div>
          <button onClick={() => { setForm(INIT_FORM); setModalNuevo(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm bg-[#1a3a5c] hover:bg-[#243f66]">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Registrar Cliente
          </button>
        </div>

        {/* Stat cards */}
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

        {/* Table Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b">
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, DNI o placa…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none border border-gray-200 focus:border-[#1a3a5c]" />
            </div>
            <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-lg border border-gray-200 text-gray-500 font-medium cursor-pointer">
              <option value="Todos">Todos los vehículos</option>
              {tiposOpts.map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={citaFilter} onChange={e => setCitaFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-lg border border-gray-200 text-gray-500 font-medium cursor-pointer">
              <option value="Todos">Todas las citas</option>
              <option value="Con cita">Con cita</option>
              <option value="Sin cita">Sin cita</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#f8fafc' }}><TH col="nombre" label="Cliente" width="24%" /><TH col="dni" label="DNI" width="12%" /><TH col="placa" label="Vehículo" width="20%" /><TH col="telefono" label="Contacto" width="18%" /><TH label="Estado" width="12%" /><TH label="Acciones" width="14%" /></tr></thead>
              <tbody className="divide-y">
                {rows.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/10 transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center flex-shrink-0 rounded-full text-white text-xs font-semibold" style={{ width: 32, height: 32, background: '#1a3a5c' }}>{c.nombre.split(' ').slice(0,2).map(n=>n[0]).join('')}</div>
                        <span className="text-sm font-medium text-gray-800">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-400">{c.dni}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-gray-800 text-white uppercase tracking-widest">{c.vehiculo.placa}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase">{c.vehiculo.marca} {c.vehiculo.modelo}</p>
                    </td>
                    <td className="px-4 py-3"><p className="text-sm text-gray-600">{c.telefono}</p></td>
                    <td className="px-4 py-3">{c.tieneCita ? <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase">Activa</span> : <span className="text-[10px] font-black text-gray-300 uppercase">Sin Cita</span>}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <ActionBtn icon="cita" title="Programar Cita" hoverBg="#3b82f6" onClick={() => setModalCita(c)} />
                      <ActionBtn icon="edit" title="Editar" onClick={() => { setForm(c); setModalEditar(c.id) }} />
                      <ActionBtn icon="delete" title="Eliminar" hoverBg="#dc2626" onClick={() => setModalEliminar(c.id)} />
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t flex justify-between items-center bg-white">
            <span className="text-xs text-gray-400">Pág. {page} de {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(1)} className="w-8 h-8 border rounded-lg text-xs font-bold disabled:opacity-20">«</button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 border rounded-lg text-xs font-bold disabled:opacity-20">‹</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 border rounded-lg text-xs font-bold disabled:opacity-20">›</button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="w-8 h-8 border rounded-lg text-xs font-bold disabled:opacity-20">»</button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MODAL GENERAR CITA (RESTABLECIDO CON DETALLE) */}
      {modalCita && (
        <Modal title="Reservar Espacio en Taller" onClose={() => setModalCita(null)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SectionTitle color="#3b82f6">Vehículo</SectionTitle>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                <span className="px-2 py-1 bg-blue-600 text-white font-mono font-bold rounded text-xs">{modalCita.vehiculo.placa}</span>
                <p className="text-xs font-bold text-blue-800 uppercase">{modalCita.vehiculo.marca} {modalCita.vehiculo.modelo}</p>
              </div>
              <Field label="Atención">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setTipoAtencion('MANTENIMIENTO')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${tipoAtencion === 'MANTENIMIENTO' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-100 text-blue-400'}`}>Mantenimiento</button>
                  <button type="button" onClick={() => setTipoAtencion('DIAGNOSTICO')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${tipoAtencion === 'DIAGNOSTICO' ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-red-100 text-red-400'}`}>Diagnóstico</button>
                </div>
              </Field>
              <Field label="Servicio Maestro"><SSelect value={formCita.servicioId} onChange={e => setFormCita({...formCita, servicioId: e.target.value})}><option value="">Seleccionar...</option>{serviciosFiltrados.map(s => <option key={s.id} value={s.id}>{s.especialidad} ({s.duracion}h)</option>)}</SSelect></Field>
              <Field label="Técnico Responsable"><SSelect value={formCita.tecnicoId} onChange={e => setFormCita({...formCita, tecnicoId: e.target.value})}><option value="">Asignar...</option>{mecanicosDisponibles.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.rol})</option>)}</SSelect></Field>
              <Field label="Fecha"><SInput type="date" value={formCita.fecha} onChange={e => setFormCita({...formCita, fecha: e.target.value})} /></Field>
            </div>
            <div>
              <SectionTitle color="#64748b">Horario</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(h => (
                  <button key={h} type="button" onClick={() => setFormCita({...formCita, hora: h})} className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${formCita.hora === h ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-gray-50 border-transparent text-gray-400'}`}>{h}</button>
                ))}
              </div>
              {formCita.servicioId && formCita.hora && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Resumen de tiempo</p>
                  <p className="text-sm font-bold text-[#1a3a5c]">{formCita.hora} — {sumarHoras(formCita.hora, serviciosFiltrados.find(s => s.id === Number(formCita.servicioId))?.duracion || 0)}</p>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => handleConfirmarCita(formCita)} disabled={!formCita.servicioId || !formCita.tecnicoId} className="w-full mt-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 disabled:opacity-30">Confirmar Reserva</button>
        </Modal>
      )}

      {/* MODALES CLIENTE (RESTAURADOS COMPLETOS) */}
      {(modalNuevo || modalEditar) && (
        <Modal title={modalNuevo ? 'Nuevo Cliente' : 'Editar Cliente'} onClose={() => { setModalNuevo(false); setModalEditar(null) }} wide>
          <form onSubmit={modalNuevo ? handleCrear : handleEditar} className="space-y-4">
            <SectionTitle color="#1a3a5c">Propietario</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre" span={2}><SInput required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></Field>
              <Field label="DNI / RUC"><SInput value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} /></Field>
              <Field label="Teléfono"><SInput value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></Field>
              <Field label="Correo" span={2}><SInput type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            </div>
            <SectionTitle color="#2a5f94">Vehículo</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Placa"><SInput value={form.vehiculo.placa} onChange={e => setVehiculo('placa', e.target.value.toUpperCase())} extraStyle={{ fontFamily: 'monospace', fontWeight: 700 }} /></Field>
              <Field label="Marca"><SInput value={form.vehiculo.marca} onChange={e => setVehiculo('marca', e.target.value)} /></Field>
              <Field label="Modelo"><SInput value={form.vehiculo.modelo} onChange={e => setVehiculo('modelo', e.target.value)} /></Field>
              <Field label="Año"><SInput type="number" value={form.vehiculo.anio} onChange={e => setVehiculo('anio', e.target.value)} /></Field>
              <Field label="Combustible"><SSelect value={form.vehiculo.combustible} onChange={e => setVehiculo('combustible', e.target.value)}>{combustiblesOpts.map(c => <option key={c}>{c}</option>)}</SSelect></Field>
              <Field label="Tipo"><SSelect value={form.vehiculo.tipo} onChange={e => setVehiculo('tipo', e.target.value)}>{tiposOpts.map(t => <option key={t}>{t}</option>)}</SSelect></Field>
            </div>
            <button className="w-full py-3 bg-[#1a3a5c] text-white rounded-xl text-xs font-bold uppercase shadow-lg">{modalNuevo ? 'Registrar Cliente' : 'Guardar Cambios'}</button>
          </form>
        </Modal>
      )}

      {modalEliminar && (
        <Modal title="Eliminar Cliente" onClose={() => setModalEliminar(null)}>
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs font-medium">Esta acción es permanente. ¿Deseas borrar este registro?</div>
          <div className="flex gap-2">
            <button onClick={() => setModalEliminar(null)} className="flex-1 py-2 text-xs border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={handleEliminar} className="flex-1 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Sí, Eliminar</button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}