import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { TIPOS_VEHICULO, COMBUSTIBLES, serviciosMock, usuariosMock } from '../services/mockData'

const API_URL = 'http://localhost:4000/api';

const OPCIONES_TIPOS = [
  "Auto (Sedán/Hatch)",
  "Camioneta (SUV/Pick-up)",
  "Furgón / Van",
  "GAMA ALTA (Premium)"
];

const CATEGORIA_MAP = {
  'AUTO (SEDÁN/HATCH)':      'AUTO',
  'CAMIONETA (SUV/PICK-UP)': 'CAMIONETA',
  'FURGÓN / VAN':            'FURGON',
  'FURGON / VAN':            'FURGON', 
  'GAMA ALTA (PREMIUM)':     'AUTO'    
}

const INIT_FORM = {
  nombres: '', apellidos: '', dni: '', email: '', telefono: '',
  vehiculo: { placa: '', marca: '', modelo: '', anio: '', color: '', combustible: '', tipo: '' },
}

const ROWS_PER_PAGE = 8

const C = {
  navy:      '#1a3a5c',
  navyDark:  '#0f2540',
  blue:      '#007bff',
  border:    '#e8ecf1',
  bg:        '#f4f7fb',
  surface:   '#ffffff',
  ink:       '#0f172a',
  muted:     '#64748b',
  subtle:    '#94a3b8',
}

// ── UI PRIMITIVES ────────────────────────────────────────────────

function Overlay({ onClose }) {
  return <div onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'rgba(10,20,40,0.6)', backdropFilter: 'blur(4px)' }} />
}

function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-md'} rounded-2xl overflow-hidden shadow-2xl`}
          style={{ pointerEvents: 'auto', background: C.surface, border: `1px solid ${C.border}`, animation: 'modalIn .2s ease-out' }}>
          <div style={{ background: C.navy, padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>{title}</div>
              {subtitle && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div style={{ padding: '1.5rem' }}>{children}</div>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ color = C.blue, icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15, paddingBottom: 8, borderBottom: `2px solid ${C.bg}` }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{children}</span>
    </div>
  )
}

function Field({ label, children, span }) {
  return (
    <div style={span ? { gridColumn: `span ${span}` } : {}}>
      <label style={{ display: 'block', marginBottom: 5, fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

function SInput({ type = 'text', extraStyle, ...props }) {
  const isEmail = type === 'email';
  return (
    <input 
      type={type} 
      {...props} 
      style={{ 
        border: `1px solid ${C.border}`, background: '#f8fafc', borderRadius: 9, padding: '10px 12px', fontSize: 13, width: '100%', outline: 'none',
        textTransform: isEmail ? 'none' : 'uppercase',
        ...extraStyle 
      }} 
    />
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────

export default function Clientes() {
  const { user } = useAuth()
  const [clientes, setClientes] = useState([])
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalCita, setModalCita] = useState(null) // Para abrir el modal de citas
  const [form, setForm] = useState(INIT_FORM)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Estados para la Cita
  const [tipoAtencion, setTipoAtencion] = useState('MANTENIMIENTO')
  const [formCita, setFormCita] = useState({ servicioId: '', tecnicoId: '', fecha: new Date().toISOString().split('T')[0], hora: '' })

  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`)
      setClientes(res.data)
    } catch (err) { console.error("Error API:", err) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetchClientes() }, [user])

  // Lógica de filtrado de servicios (LA CLAVE DEL ERROR)
  const serviciosFiltrados = useMemo(() => {
    if (!modalCita) return []
    const v = modalCita.vehiculos?.[0] || { tipo: 'AUTO' }
    
    // Normalizamos a Mayúsculas para que coincida con CATEGORIA_MAP
    const tipoVehiculo = String(v.tipo).toUpperCase();
    const catFinal = CATEGORIA_MAP[tipoVehiculo] || 'AUTO';
    
    return serviciosMock.filter(s => 
      s.tipo === tipoAtencion && 
      (s.categoriaVehiculo === catFinal || s.categoria === catFinal)
    )
  }, [tipoAtencion, modalCita])

  const handleInput = (field, val) => {
    setForm({ ...form, [field]: val.toUpperCase() })
  }

  const handleVehiculo = (field, val) => {
    setForm({ ...form, vehiculo: { ...form.vehiculo, [field]: val.toUpperCase() } })
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    const payload = {
      tipoDocumento: 'DNI', numDocumento: form.dni.trim(),
      nombres: form.nombres.trim().toUpperCase(), apellidos: form.apellidos.trim().toUpperCase(),
      telefono: form.telefono.trim(), email: form.email.toLowerCase().trim(),
      placa: form.vehiculo.placa.trim().toUpperCase(), marca: form.vehiculo.marca.trim().toUpperCase(),
      modelo: form.vehiculo.modelo.trim().toUpperCase(), anio: form.vehiculo.anio,
      color: form.vehiculo.color.trim().toUpperCase(), combustible: form.vehiculo.combustible, tipo: form.vehiculo.tipo
    }

    try {
      await axios.post(`${API_URL}/clientes`, payload)
      await fetchClientes()
      setModalNuevo(false)
      setForm(INIT_FORM)
    } catch (err) { alert(err.response?.data?.error || "Error al registrar") }
  }

  const filtered = useMemo(() => {
    return clientes.filter(c => 
      c.nombres.toLowerCase().includes(search.toLowerCase()) || 
      c.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      c.numDocumento.includes(search) ||
      c.vehiculos?.some(v => v.placa.toLowerCase().includes(search.toLowerCase()))
    )
  }, [clientes, search])

  return (
    <Layout tituloNavbar="Directorio de Clientes · Dr. Motors">
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(.97) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .row-hover:hover { background: #f8fafc; }
      `}</style>

      <div style={{ padding: '2rem', background: C.bg, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.navy }}>Gestión de Propietarios</h1>
            <p style={{ color: C.muted, fontSize: 13 }}>Registra y administra la flota de tus clientes</p>
          </div>
          <button onClick={() => setModalNuevo(true)} style={{ background: C.blue, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,123,255,0.25)' }}>
            NUEVO CLIENTE
          </button>
        </div>

        <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px 16px 0 0', border: `1px solid ${C.border}`, borderBottom: 'none' }}>
           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar por nombre, DNI o placa..." style={{ width: '100%', maxWidth: 400, padding: '10px 15px', borderRadius: 10, border: `1px solid ${C.border}`, outline: 'none', fontSize: 13 }} />
        </div>

        <div style={{ background: '#fff', borderRadius: '0 0 16px 16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>CLIENTE / PROPIETARIO</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>DNI / RUC</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>TELÉFONO</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>VEHÍCULO</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="row-hover" style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.navy }}>{c.apellidos}, {c.nombres}</div>
                    <div style={{ fontSize: 11, color: C.subtle }}>CLIENTE REGISTRADO</div>
                  </td>
                  <td style={{ padding: '15px 20px', fontSize: 13, fontWeight: 600 }}>{c.numDocumento}</td>
                  <td style={{ padding: '15px 20px', fontSize: 13, fontWeight: 600 }}>{c.telefono}</td>
                  <td style={{ padding: '15px 20px' }}>
                    {c.vehiculos?.[0] ? (
                      <div>
                        <span style={{ background: C.navy, color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }}>{c.vehiculos[0].placa}</span>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{c.vehiculos[0].marca} {c.vehiculos[0].modelo}</div>
                      </div>
                    ) : '---'}
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <button onClick={() => setModalCita(c)} style={{ background: '#eef6ff', border: `1px solid ${C.blue}`, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', color: C.blue, fontSize: 11, fontWeight: 700 }}>📅 CITA</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL RESERVAR CITA ── */}
      {modalCita && (
        <Modal title="Reservar Espacio en Taller" subtitle={`${modalCita.nombres} · ${modalCita.vehiculos?.[0]?.placa}`} onClose={() => setModalCita(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 25 }}>
            <div>
              <SectionTitle icon="🚗">Información del Vehículo</SectionTitle>
              <div style={{ background: '#eef6ff', padding: 12, borderRadius: 10, marginBottom: 20 }}>
                <div style={{ fontWeight: 800, color: C.navy }}>{modalCita.vehiculos?.[0]?.marca} {modalCita.vehiculos?.[0]?.modelo}</div>
                <div style={{ fontSize: 11 }}>TIPO: {modalCita.vehiculos?.[0]?.tipo}</div>
              </div>

              <SectionTitle icon="🔧">Tipo de Atención</SectionTitle>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button onClick={() => setTipoAtencion('MANTENIMIENTO')} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: tipoAtencion === 'MANTENIMIENTO' ? C.navy : C.bg, color: tipoAtencion === 'MANTENIMIENTO' ? '#fff' : C.muted, fontWeight: 700, cursor: 'pointer' }}>MANTENIMIENTO</button>
                <button onClick={() => setTipoAtencion('DIAGNOSTICO')} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: tipoAtencion === 'DIAGNOSTICO' ? C.navy : C.bg, color: tipoAtencion === 'DIAGNOSTICO' ? '#fff' : C.muted, fontWeight: 700, cursor: 'pointer' }}>DIAGNÓSTICO</button>
              </div>

              <Field label="Servicio">
                <select value={formCita.servicioId} onChange={e => setFormCita({...formCita, servicioId: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${C.border}` }}>
                  <option value="">Seleccionar servicio...</option>
                  {serviciosFiltrados.map(s => <option key={s.id} value={s.id}>{s.especialidad} {s.nivel}</option>)}
                </select>
              </Field>
            </div>
            <div>
              <SectionTitle icon="🕐">Horario de Ingreso</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'].map(h => (
                  <button key={h} onClick={() => setFormCita({...formCita, hora: h})} style={{ padding: 10, borderRadius: 8, border: `1px solid ${formCita.hora === h ? C.blue : C.border}`, background: formCita.hora === h ? C.blue : '#fff', color: formCita.hora === h ? '#fff' : C.ink, fontWeight: 700, cursor: 'pointer' }}>{h}</button>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: 30, padding: 15, background: C.blue, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>CONFIRMAR RESERVA</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL NUEVO CLIENTE ── */}
      {modalNuevo && (
        <Modal title="Nuevo Cliente" subtitle="Complete los datos del propietario y vehículo" onClose={() => setModalNuevo(false)} wide>
          <form onSubmit={handleCrear}>
            <SectionTitle icon="👤">INFORMACIÓN DEL PROPIETARIO</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 20 }}>
              <Field label="Nombres"><SInput required value={form.nombres} onChange={e => handleInput('nombres', e.target.value)} placeholder="JUAN" /></Field>
              <Field label="Apellidos"><SInput required value={form.apellidos} onChange={e => handleInput('apellidos', e.target.value)} placeholder="PÉREZ" /></Field>
              <Field label="DNI / RUC"><SInput required value={form.dni} onChange={e => handleInput('dni', e.target.value)} placeholder="1075..." /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 15, marginBottom: 30 }}>
              <Field label="Correo Electrónico (Opcional)"><SInput type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="cliente@correo.com" /></Field>
              <Field label="Teléfono"><SInput required value={form.telefono} onChange={e => handleInput('telefono', e.target.value)} placeholder="987..." /></Field>
            </div>
            <SectionTitle icon="🚗">INFORMACIÓN DEL VEHÍCULO</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr', gap: 12, marginBottom: 15 }}>
              <Field label="Placa"><SInput required value={form.vehiculo.placa} onChange={e => handleVehiculo('placa', e.target.value)} placeholder="ABC-123" extraStyle={{ background: '#eef6ff', borderColor: '#bcd8f7', fontWeight: 'bold' }} /></Field>
              <Field label="Marca"><SInput required value={form.vehiculo.marca} onChange={e => handleVehiculo('marca', e.target.value)} placeholder="TOYOTA" /></Field>
              <Field label="Modelo"><SInput required value={form.vehiculo.modelo} onChange={e => handleVehiculo('modelo', e.target.value)} placeholder="COROLLA" /></Field>
              <Field label="Año"><SInput type="number" value={form.vehiculo.anio} onChange={e => handleVehiculo('anio', e.target.value)} placeholder="2022" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr', gap: 12, marginBottom: 30 }}>
              <Field label="Color"><SInput value={form.vehiculo.color} onChange={e => handleVehiculo('color', e.target.value)} placeholder="GRIS PLATA" /></Field>
              {/* Campo de Combustible */}
              <Field label="Combustible">
                <select 
                  required 
                  value={form.vehiculo.combustible} 
                  onChange={e => handleVehiculo('combustible', e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '9px', border: `1px solid ${C.border}`, fontSize: '13px', background: '#f8fafc' }}
                >
                  <option value="">ELEGIR COMBUSTIBLE...</option>
                  {/* Agregamos .toUpperCase() tanto al value como al texto */}
                  {COMBUSTIBLES.map(c => (
                    <option key={c} value={c.toUpperCase()}>{c.toUpperCase()}</option>
                  ))}
                </select>
              </Field>

              {/* Campo de Tipo de Vehículo */}
              <Field label="Tipo de Vehículo">
                <select 
                  required 
                  value={form.vehiculo.tipo} 
                  onChange={e => handleVehiculo('tipo', e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '9px', 
                    border: `1px solid ${C.border}`, 
                    fontSize: '13px', 
                    background: '#eef6ff', 
                    color: C.blue, 
                    fontWeight: 'bold',
                    appearance: 'none'
                  }}
                >
                  <option value="">Elegir categoría...</option>
                  {OPCIONES_TIPOS.map(tipo => (
                    <option key={tipo} value={tipo.toUpperCase()}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button type="submit" style={{ width: '100%', padding: '15px', background: C.blue, color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
               REGISTRAR CLIENTE Y VEHÍCULO
            </button>
          </form>
        </Modal>
      )}
    </Layout>
  )
}