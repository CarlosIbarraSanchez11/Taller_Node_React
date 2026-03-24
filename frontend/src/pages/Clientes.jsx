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

const CATEGORIA_MAP = {
  'SUV': 'CAMIONETA', 'Camioneta': 'CAMIONETA',
  'Auto': 'AUTO', 'Furgoneta': 'FURGON', 'Camión': 'FURGON'
}

// ── DESIGN TOKENS ────────────────────────────────────────────────
const C = {
  navy:      '#1a3a5c',
  navyDark:  '#0f2540',
  navyLight: '#e8f0f8',
  blue:      '#2563eb',
  blueLight: '#eff6ff',
  green:     '#15803d',
  greenLight:'#f0fdf4',
  red:       '#dc2626',
  redLight:  '#fef2f2',
  amber:     '#d97706',
  amberLight:'#fffbeb',
  border:    '#e8ecf1',
  bg:        '#f4f7fb',
  surface:   '#ffffff',
  ink:       '#0f172a',
  muted:     '#64748b',
  subtle:    '#94a3b8',
}

// ── UI PRIMITIVES ────────────────────────────────────────────────

function Overlay({ onClose }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-40"
      style={{ background: 'rgba(10,20,40,0.6)', backdropFilter: 'blur(4px)' }} />
  )
}

function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl overflow-hidden shadow-2xl`}
          style={{ pointerEvents: 'auto', background: C.surface, border: `1px solid ${C.border}`, animation: 'modalIn .2s cubic-bezier(.22,1,.36,1)' }}>
          {/* Modal header */}
          <div style={{ background: C.navy, padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-.01em' }}>{title}</div>
              {subtitle && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose}
              style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '80vh' }}>{children}</div>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ color = C.navy, icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{children}</span>
    </div>
  )
}

function Field({ label, children, span }) {
  return (
    <div style={span === 2 ? { gridColumn: 'span 2' } : {}}>
      <label style={{ display: 'block', marginBottom: 5, fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
      {children}
    </div>
  )
}

const baseInput = { border: `1px solid ${C.border}`, background: '#f8fafc', color: C.ink, borderRadius: 9, padding: '9px 12px', fontSize: 13, width: '100%', outline: 'none', transition: 'all .18s', fontFamily: 'inherit' }
const focusStyle = { borderColor: C.navy, background: C.surface, boxShadow: `0 0 0 3px rgba(26,58,92,0.1)` }

function SInput({ type = 'text', extraStyle, ...props }) {
  const [f, setF] = useState(false)
  return <input type={type} {...props} style={{ ...baseInput, ...(f ? focusStyle : {}), ...extraStyle }} onFocus={() => setF(true)} onBlur={() => setF(false)} />
}

function SSelect({ children, ...props }) {
  const [f, setF] = useState(false)
  return <select {...props} style={{ ...baseInput, ...(f ? focusStyle : {}), cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }} onFocus={() => setF(true)} onBlur={() => setF(false)}>{children}</select>
}

function Btn({ children, variant = 'primary', onClick, disabled, type = 'button', full, small }) {
  const [hov, setHov] = useState(false)
  const styles = {
    primary: { bg: C.navy, hov: C.navyDark, color: '#fff', border: 'none' },
    blue:    { bg: C.blue, hov: '#1d4ed8',  color: '#fff', border: 'none' },
    danger:  { bg: C.red,  hov: '#b91c1c',  color: '#fff', border: 'none' },
    ghost:   { bg: hov ? C.bg : 'transparent', hov: C.bg, color: C.muted, border: `1px solid ${C.border}` },
  }
  const s = styles[variant]
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: small ? '6px 14px' : '10px 20px', borderRadius: 10, background: hov && !disabled ? s.hov : s.bg, color: s.color, border: s.border, fontSize: small ? 11 : 12, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .4 : 1, width: full ? '100%' : 'auto', letterSpacing: '.02em', transition: 'all .18s', fontFamily: 'inherit' }}>
      {children}
    </button>
  )
}

function ActionBtn({ icon, title, onClick, color = C.navy }) {
  const [hov, setHov] = useState(false)
  const icons = {
    edit:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    delete: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>,
    cita:   <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  }
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 30, height: 30, borderRadius: 8, background: hov ? color : 'transparent', color: hov ? '#fff' : C.subtle, border: `1px solid`, borderColor: hov ? color : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .18s' }}>
      {icons[icon]}
    </button>
  )
}

function Badge({ children, color = C.navy, bg }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, color, background: bg || color + '18', letterSpacing: '.04em' }}>
      {children}
    </span>
  )
}

function SortIcon({ dir }) {
  return (
    <span style={{ opacity: dir ? 1 : 0.3, marginLeft: 4, display: 'inline-flex', flexDirection: 'column', gap: 1.5 }}>
      <svg width="7" height="4" viewBox="0 0 8 5" fill="none"><path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'asc' ? C.navy : C.subtle} /></svg>
      <svg width="7" height="4" viewBox="0 0 8 5" fill="none" style={{ transform: 'rotate(180deg)' }}><path d="M4 0L7.46 4.5H.54L4 0Z" fill={dir === 'desc' ? C.navy : C.subtle} /></svg>
    </span>
  )
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginTop: 3 }}>{label}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color, opacity: .15, borderRadius: '0 0 14px 14px' }} />
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────
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
  const [modalCita, setModalCita]         = useState(null)
  const [tipoAtencion, setTipoAtencion]   = useState('MANTENIMIENTO')
  const [formCita, setFormCita]           = useState({ servicioId: '', tecnicoId: '', fecha: new Date().toISOString().split('T')[0], hora: '' })

  useEffect(() => { setPage(1) }, [search, sort, tipoFilter, citaFilter])

  const sumarHoras = (horaInicio, horas) => {
    if (!horaInicio) return ''
    const [h, m] = horaInicio.split(':').map(Number)
    return `${(h + Number(horas)).toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`
  }

  const mecanicosDisponibles = useMemo(() => {
    if (!user) return []
    return usuariosMock.filter(u => {
      const rol = u.rol.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      return (rol.includes("mecanico") && !rol.includes("jefe")) &&
             (user.tallerId === null || Number(u.tallerId) === Number(user.tallerId)) &&
             u.estado === 'Activo'
    })
  }, [user])

  const serviciosFiltrados = useMemo(() => {
    if (!modalCita) return []
    const cat = CATEGORIA_MAP[modalCita.vehiculo.tipo] || 'AUTO'
    return serviciosMock.filter(s => s.tipo === tipoAtencion && s.categoria === cat)
  }, [tipoAtencion, modalCita])

  const filtered = useMemo(() => {
    if (!user) return []
    let d = [...clientes]
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(c => c.nombre.toLowerCase().includes(q) || c.dni.includes(q) || c.vehiculo.placa.toLowerCase().includes(q) || c.telefono.includes(q))
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
  const rows       = filtered.slice((page-1)*ROWS_PER_PAGE, page*ROWS_PER_PAGE)
  const conCita    = clientes.filter(c => c.tieneCita).length
  const sinCita    = clientes.filter(c => !c.tieneCita).length

  const setVehiculo        = (f, v) => setForm({ ...form, vehiculo: { ...form.vehiculo, [f]: v } })
  const handleCrear        = e => { e.preventDefault(); setClientes([{ ...form, id: Date.now(), tieneCita: false }, ...clientes]); setModalNuevo(false) }
  const handleEditar       = e => { e.preventDefault(); setClientes(clientes.map(c => c.id === modalEditar ? { ...c, ...form } : c)); setModalEditar(null) }
  const handleEliminar     = () => { setClientes(clientes.filter(c => c.id !== modalEliminar)); setModalEliminar(null) }
  const handleConfirmarCita= () => { setClientes(clientes.map(c => c.id === modalCita.id ? { ...c, tieneCita: true } : c)); setModalCita(null) }
  const toggleSort         = col => setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const duracionSeleccionada = serviciosFiltrados.find(s => s.id === Number(formCita.servicioId))?.duracion || 0
  const isHoraEnRango = h => {
    if (!formCita.hora || duracionSeleccionada === 0) return false
    const start   = parseInt(formCita.hora.split(':')[0])
    const current = parseInt(h.split(':')[0])
    return current >= start && current < (start + duracionSeleccionada)
  }

  const tiposOpts       = TIPOS_VEHICULO || ['Auto','SUV','Camioneta','Moto','Camión','Furgoneta']
  const combustiblesOpts= COMBUSTIBLES   || ['Gasolina','Diésel','Híbrido','Eléctrico','GLP','GNV']

  const TH = ({ col, label, width }) => (
    <th onClick={() => col && toggleSort(col)}
      style={{ padding: '12px 16px', textAlign: 'left', width, fontSize: 10, fontWeight: 700, color: C.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap', background: '#f8fafc', borderBottom: `1px solid ${C.border}`, userSelect: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{label}{col && <SortIcon dir={sort.col === col ? sort.dir : null} />}</span>
    </th>
  )

  return (
    <Layout tituloNavbar="Gestión de Clientes Dr. Motors">
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(.96) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .row-hover:hover { background: #f8fafc !important; }
        .page-btn:hover  { background: ${C.navy} !important; color: #fff !important; }
      `}</style>

      <div style={{ padding: '1.75rem 2rem', minHeight: '100vh', background: C.bg, animation: 'fadeIn .4s ease both' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: C.muted, marginBottom: 4 }}>Módulo</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: '-.02em', lineHeight: 1.1 }}>Directorio de Clientes</h1>
            <p style={{ fontSize: 12, color: C.subtle, marginTop: 4 }}>Base de datos de propietarios y vehículos registrados</p>
          </div>
          <Btn onClick={() => { setForm(INIT_FORM); setModalNuevo(true) }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar Cliente
          </Btn>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Total registrados"  value={clientes.length} icon="👥" color={C.navy}  bg={C.navyLight} />
          <StatCard label="Con cita activa"    value={conCita}         icon="📅" color={C.green} bg={C.greenLight} />
          <StatCard label="Sin cita asignada"  value={sinCita}         icon="🕐" color={C.muted} bg="#f1f5f9" />
        </div>

        {/* ── TABLA ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, background: '#fafbfc' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.subtle }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, DNI o placa…"
                style={{ ...baseInput, paddingLeft: 34, maxWidth: 320 }} />
            </div>
            <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}
              style={{ ...baseInput, width: 'auto', padding: '8px 32px 8px 12px', fontSize: 12, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', appearance: 'none' }}>
              <option value="Todos">Todos los tipos</option>
              {tiposOpts.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={citaFilter} onChange={e => setCitaFilter(e.target.value)}
              style={{ ...baseInput, width: 'auto', padding: '8px 32px 8px 12px', fontSize: 12, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2364748b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', appearance: 'none' }}>
              <option value="Todos">Todas las citas</option>
              <option value="Con cita">Con cita</option>
              <option value="Sin cita">Sin cita</option>
            </select>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: C.subtle, fontWeight: 600 }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <TH col="nombre" label="Cliente"   width="28%" />
                  <TH col="placa"  label="Vehículo"  width="25%" />
                  <TH              label="Tipo"       width="15%" />
                  <TH              label="Estado"     width="15%" />
                  <TH              label="Acciones"   width="17%" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: C.subtle, fontSize: 13 }}>
                      <div style={{ fontSize: 32, marginBottom: 8, opacity: .3 }}>🔍</div>
                      Sin resultados para la búsqueda actual
                    </td>
                  </tr>
                )}
                {rows.map((c, idx) => (
                  <tr key={c.id} className="row-hover" style={{ borderBottom: `1px solid ${C.border}`, transition: 'background .15s' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${(c.nombre.charCodeAt(0)*5)%360},45%,30%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{c.nombre}</div>
                          <div style={{ fontSize: 11, color: C.subtle, marginTop: 1 }}>{c.dni} · {c.telefono}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 12, background: C.navy, color: '#fff', padding: '3px 8px', borderRadius: 6, letterSpacing: '.05em' }}>{c.vehiculo.placa}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{c.vehiculo.marca} {c.vehiculo.modelo}</div>
                          <div style={{ fontSize: 10, color: C.subtle }}>{c.vehiculo.anio} · {c.vehiculo.combustible}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge color={C.navy}>{c.vehiculo.tipo}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {c.tieneCita
                        ? <Badge color={C.green} bg={C.greenLight}>✓ Cita activa</Badge>
                        : <Badge color={C.subtle} bg="#f1f5f9">Sin cita</Badge>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <ActionBtn icon="cita"   title="Generar Cita" color={C.blue} onClick={() => setModalCita(c)} />
                        <ActionBtn icon="edit"   title="Editar"       color={C.navy} onClick={() => { setForm(c); setModalEditar(c.id) }} />
                        <ActionBtn icon="delete" title="Eliminar"     color={C.red}  onClick={() => setModalEliminar(c.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: `1px solid ${C.border}`, background: '#fafbfc' }}>
              <div style={{ fontSize: 11, color: C.subtle, fontWeight: 600 }}>
                Página {page} de {totalPages} · {filtered.length} registros
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="page-btn"
                  style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontSize: 12, fontWeight: 600, cursor: page===1?'not-allowed':'pointer', opacity: page===1?.4:1, transition: 'all .18s' }}>
                  ← Anterior
                </button>
                {Array.from({length: Math.min(5, totalPages)}, (_,i) => {
                  const n = Math.max(1, Math.min(page-2,totalPages-4)) + i
                  return (
                    <button key={n} onClick={() => setPage(n)} className="page-btn"
                      style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${n===page ? C.navy : C.border}`, background: n===page ? C.navy : C.surface, color: n===page ? '#fff' : C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .18s' }}>
                      {n}
                    </button>
                  )
                })}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="page-btn"
                  style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontSize: 12, fontWeight: 600, cursor: page===totalPages?'not-allowed':'pointer', opacity: page===totalPages?.4:1, transition: 'all .18s' }}>
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL CITA ── */}
      {modalCita && (
        <Modal title="Reservar Espacio en Taller" subtitle={`${modalCita.nombre} · ${modalCita.vehiculo.placa}`} onClose={() => setModalCita(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SectionTitle icon="🚗" color={C.navy}>Datos del Vehículo</SectionTitle>
              <div style={{ background: C.navyLight, border: `1px solid ${C.navy}22`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, background: C.navy, color: '#fff', padding: '4px 10px', borderRadius: 7 }}>{modalCita.vehiculo.placa}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: C.navy }}>{modalCita.vehiculo.marca} {modalCita.vehiculo.modelo}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{modalCita.vehiculo.tipo} · {modalCita.vehiculo.combustible}</div>
                </div>
              </div>

              <SectionTitle icon="🔧" color={C.navy}>Tipo de Atención</SectionTitle>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['MANTENIMIENTO','🔩 Mantenimiento',C.navy],['DIAGNOSTICO','🩺 Diagnóstico',C.red]].map(([val,label,color]) => (
                  <button key={val} type="button" onClick={() => setTipoAtencion(val)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: `2px solid ${tipoAtencion===val ? color : C.border}`, background: tipoAtencion===val ? color : C.surface, color: tipoAtencion===val ? '#fff' : C.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .18s' }}>
                    {label}
                  </button>
                ))}
              </div>

              <Field label="Servicio">
                <SSelect value={formCita.servicioId} onChange={e => setFormCita({...formCita, servicioId: e.target.value})}>
                  <option value="">Seleccionar servicio...</option>
                  {serviciosFiltrados.map(s => <option key={s.id} value={s.id}>{s.especialidad} {s.nivel !== 'REGULAR' ? s.nivel : ''} ({s.duracion}h)</option>)}
                </SSelect>
              </Field>

              <Field label="Técnico Responsable">
                <SSelect value={formCita.tecnicoId} onChange={e => setFormCita({...formCita, tecnicoId: e.target.value})}>
                  <option value="">Asignar especialista...</option>
                  {mecanicosDisponibles.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.rol})</option>)}
                </SSelect>
              </Field>

              <Field label="Fecha">
                <SInput type="date" value={formCita.fecha} onChange={e => setFormCita({...formCita, fecha: e.target.value})} />
              </Field>
            </div>

            <div>
              <SectionTitle icon="🕐" color={C.navy}>Horario de Ingreso</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: '1rem' }}>
                {['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'].map(h => {
                  const ocupado   = isHoraEnRango(h)
                  const selected  = formCita.hora === h
                  return (
                    <button key={h} type="button" onClick={() => setFormCita({...formCita, hora: h})}
                      style={{ padding: '11px 8px', borderRadius: 10, border: `2px solid ${selected||ocupado ? C.navy : C.border}`, background: selected ? C.navy : ocupado ? C.navyLight : C.surface, color: selected ? '#fff' : ocupado ? C.navy : C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .18s' }}>
                      {h}
                    </button>
                  )
                })}
              </div>

              {formCita.hora && duracionSeleccionada > 0 && (
                <div style={{ background: C.navyLight, border: `1px dashed ${C.navy}44`, borderRadius: 12, padding: '1rem', animation: 'fadeIn .25s ease both' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.navy, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Bloque reservado</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{formCita.hora} — {sumarHoras(formCita.hora, duracionSeleccionada)}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{duracionSeleccionada} bloque{duracionSeleccionada>1?'s':''} de tiempo ocupado{duracionSeleccionada>1?'s':''}</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
            <Btn variant="ghost" onClick={() => setModalCita(null)} full>Cancelar</Btn>
            <Btn variant="primary" onClick={() => handleConfirmarCita(formCita)} disabled={!formCita.hora || !formCita.servicioId} full>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
              Confirmar Reserva
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL CREAR / EDITAR ── */}
      {(modalNuevo || modalEditar) && (
        <Modal title={modalNuevo ? 'Nuevo Cliente' : 'Editar Cliente'} subtitle={modalNuevo ? 'Complete los datos del propietario y vehículo' : 'Modifique la información necesaria'} onClose={() => { setModalNuevo(false); setModalEditar(null) }} wide>
          <form onSubmit={modalNuevo ? handleCrear : handleEditar}>
            <div style={{ marginBottom: '1.25rem' }}>
              <SectionTitle icon="👤" color={C.navy}>Datos del Propietario</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Nombre Completo" span={2}><SInput required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Juan Pérez García" /></Field>
                <Field label="DNI / RUC"><SInput value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} placeholder="12345678" /></Field>
                <Field label="Teléfono"><SInput value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="987 654 321" /></Field>
                <Field label="Correo Electrónico" span={2}><SInput type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="correo@ejemplo.com" /></Field>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <SectionTitle icon="🚗" color={C.blue}>Datos del Vehículo</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Placa"><SInput value={form.vehiculo.placa} onChange={e => setVehiculo('placa', e.target.value.toUpperCase())} extraStyle={{ fontFamily:'monospace', fontWeight:700, letterSpacing:'.05em' }} placeholder="ABC-123" /></Field>
                <Field label="Marca"><SInput value={form.vehiculo.marca} onChange={e => setVehiculo('marca', e.target.value)} placeholder="Toyota" /></Field>
                <Field label="Modelo"><SInput value={form.vehiculo.modelo} onChange={e => setVehiculo('modelo', e.target.value)} placeholder="Corolla" /></Field>
                <Field label="Año"><SInput type="number" value={form.vehiculo.anio} onChange={e => setVehiculo('anio', e.target.value)} placeholder="2022" /></Field>
                <Field label="Combustible"><SSelect value={form.vehiculo.combustible} onChange={e => setVehiculo('combustible', e.target.value)}>{combustiblesOpts.map(c => <option key={c}>{c}</option>)}</SSelect></Field>
                <Field label="Tipo de Vehículo"><SSelect value={form.vehiculo.tipo} onChange={e => setVehiculo('tipo', e.target.value)}>{tiposOpts.map(t => <option key={t}>{t}</option>)}</SSelect></Field>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="ghost" onClick={() => { setModalNuevo(false); setModalEditar(null) }} full>Cancelar</Btn>
              <Btn type="submit" variant="primary" full>
                {modalNuevo ? '+ Registrar Cliente' : '✓ Guardar Cambios'}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {modalEliminar && (
        <Modal title="Eliminar Cliente" subtitle="Esta acción no se puede deshacer" onClose={() => setModalEliminar(null)}>
          <div style={{ background: C.redLight, border: `1px solid #fca5a5`, borderRadius: 10, padding: '12px 14px', marginBottom: '1.25rem', fontSize: 13, color: C.red, fontWeight: 600 }}>
            ⚠️ Se eliminará permanentemente este cliente y todos sus datos asociados.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" onClick={() => setModalEliminar(null)} full>Cancelar</Btn>
            <Btn variant="danger" onClick={handleEliminar} full>Sí, eliminar</Btn>
          </div>
        </Modal>
      )}
    </Layout>
  )
}