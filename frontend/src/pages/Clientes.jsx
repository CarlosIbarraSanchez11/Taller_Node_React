import { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { COMBUSTIBLES } from '../services/mockData'

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
  'GAMA ALTA (PREMIUM)':     'AUTO'    
}

const INIT_FORM = {
  nombres: '', apellidos: '', dni: '', email: '', telefono: '',
  vehiculo: { placa: '', marca: '', modelo: '', anio: '', color: '', combustible: '', tipo: '' },
}

const C = {
  navy:      '#1a3a5c',
  blue:      '#007bff',
  border:    '#e8ecf1',
  bg:        '#f4f7fb',
  surface:   '#ffffff',
  muted:     '#64748b',
  subtle:    '#94a3b8',
}

// ── UI COMPONENTS ────────────────────────────────────────────────
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

function SectionTitle({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15, paddingBottom: 8, borderBottom: `2px solid ${C.bg}` }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color: C.blue, textTransform: 'uppercase' }}>{children}</span>
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
    <input type={type} {...props} style={{ border: `1px solid ${C.border}`, background: '#f8fafc', borderRadius: 9, padding: '10px 12px', fontSize: 13, width: '100%', outline: 'none', textTransform: isEmail ? 'none' : 'uppercase', ...extraStyle }} />
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────

export default function Clientes() {
  const { user } = useAuth()
  const [clientes, setClientes] = useState([])
  const [serviciosDB, setServiciosDB] = useState([])
  const [usuariosDB, setUsuariosDB] = useState([])
  const [citasDB, setCitasDB] = useState([])
  const [modalEditar, setModalEditar] = useState(null);
  const [formEdit, setFormEdit] = useState({ nombres: '', apellidos: '', dni: '', email: '', telefono: '' }); 
  
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalCita, setModalCita] = useState(null)
  const [modalVerCita, setModalVerCita] = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  
  const [form, setForm] = useState(INIT_FORM)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [tipoAtencion, setTipoAtencion] = useState('MANTENIMIENTO')
  const [formCita, setFormCita] = useState({ servicioId: '', tecnicoId: '', fecha: new Date().toISOString().split('T')[0], hora: '' })
  const [talleresDB, setTalleresDB] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Aquí definimos las 5 variables (resC, resS, resU, resCitas, resT)
      const [resC, resS, resU, resCitas, resT] = await Promise.all([
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/servicios`),
        axios.get(`${API_URL}/usuarios`),
        axios.get(`${API_URL}/citas`),
        axios.get(`${API_URL}/talleres`) // 👈 2. Asegúrate de que este llamado esté aquí
      ]);

      // 3. Ahora sí podemos usarlas todas
      setClientes(resC.data);
      setServiciosDB(resS.data);
      setUsuariosDB(resU.data);
      setCitasDB(resCitas.data);
      setTalleresDB(resT.data); // 👈 4. Esto ya no dará error
    } catch (err) {
      console.error("Error sincronizando data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData() }, [user])

  // Lógica de filtrado
  const serviciosFiltrados = useMemo(() => {
    if (!modalCita || !serviciosDB.length) return [];
    const v = modalCita.vehiculos?.[0] || {};
    const catDB = CATEGORIA_MAP[String(v.tipo).toUpperCase()] || 'AUTO';
    return serviciosDB.filter(s => s.tipo === tipoAtencion && s.categoriaVehiculo === catDB);
  }, [tipoAtencion, modalCita, serviciosDB]);

  const mecanicosFiltrados = useMemo(() => {
    // 1. Determinamos el ID del taller a filtrar:
    // Si el usuario logueado ya tiene tallerId (Call Center), usamos ese.
    // Si es null (Admin), usamos el que se seleccionó en el formulario.
    const tallerIdFiltro = user?.tallerId || Number(formCita.tallerId);

    return usuariosDB.filter(u => {
      const esMecanico = String(u.rol).toUpperCase().includes('MECÁNICO');

      // 2. Si logramos identificar un taller para filtrar:
      if (tallerIdFiltro) {
        return esMecanico && u.tallerId === tallerIdFiltro;
      }

      // 3. Si no hay tallerId (caso Admin que aún no selecciona nada en el modal):
      // Devolvemos false para que la lista esté vacía y no asigne a alguien por error.
      return false; 
    });
  }, [usuariosDB, formCita.tallerId, user?.tallerId]); // 👈 Importante incluir user?.tallerId aquí

  // Lógica de horarios
  const isTimeInRange = (slotTime) => {
    if (!formCita.hora || !formCita.servicioId) return false;
    const servicio = serviciosDB.find(s => s.id === Number(formCita.servicioId));
    if (!servicio) return false;
    const duracion = parseInt(servicio.duracion); 
    const horaInicio = parseInt(formCita.hora.split(':')[0]); 
    const horaSlot = parseInt(slotTime.split(':')[0]); 
    return horaSlot >= horaInicio && horaSlot < (horaInicio + duracion);
  };

  const isTechnicianBusy = (slotTime) => {
    if (!formCita.tecnicoId || !formCita.fecha) return false;
    return citasDB.some(cita => {
      const mismoTecnico = Number(cita.tecnicoId) === Number(formCita.tecnicoId);
      const mismaFecha = cita.fecha.split('T')[0] === formCita.fecha;
      if (mismoTecnico && mismaFecha && cita.estado !== 'CANCELADO') {
        const inicio = parseInt(cita.hora_inicio.split(':')[0]);
        const fin = parseInt(cita.hora_fin.split(':')[0]);
        const horaSlot = parseInt(slotTime.split(':')[0]);
        return horaSlot >= inicio && horaSlot < fin;
      }
      return false;
    });
  };

  const abrirModalCita = (cliente) => {
    setFormCita({
      ...formCita,
      tallerId: user?.tallerId || '', 
      hora: ''
    });
    setModalCita(cliente);
  };

  const abrirEdicion = (cliente) => {
    setFormEdit({
      id: cliente.id,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      dni: cliente.numDocumento,
      email: cliente.email || '',
      telefono: cliente.telefono || ''
    });
    setModalEditar(cliente);
  };

  const handleInput = (field, val) => setForm({ ...form, [field]: val.toUpperCase() })
  const handleVehiculo = (field, val) => setForm({ ...form, vehiculo: { ...form.vehiculo, [field]: val.toUpperCase() } })

  const handleCrear = async (e) => {
    e.preventDefault()
    const payload = {
      tipoDocumento: 'DNI', numDocumento: form.dni.trim(),
      nombres: form.nombres.trim().toUpperCase(), apellidos: form.apellidos.trim().toUpperCase(),
      telefono: form.telefono.trim(), email: form.email.toLowerCase().trim(),
      placa: form.vehiculo.placa.trim().toUpperCase(), marca: form.vehiculo.marca.trim().toUpperCase(),
      modelo: form.vehiculo.modelo.trim().toUpperCase(), anio: parseInt(form.vehiculo.anio),
      color: form.vehiculo.color.trim().toUpperCase(), combustible: form.vehiculo.combustible, tipo: form.vehiculo.tipo
    }
    try {
      await axios.post(`${API_URL}/clientes`, payload);
      fetchData();
      setModalNuevo(false);
      setForm(INIT_FORM);
    } catch (err) { alert(err.response?.data?.error || "Error al registrar") }
  }

  const handleConfirmarCita = async () => {
    // 1. Rescatamos el tallerId (del formulario o del usuario logueado)
    const idTallerFinal = formCita.tallerId || user?.tallerId;

    const payload = {
      fecha: formCita.fecha,
      hora_inicio: formCita.hora,
      vehiculoPlaca: modalCita.vehiculos[0].placa,
      tecnicoId: parseInt(formCita.tecnicoId),
      servicioId: parseInt(formCita.servicioId),
      tallerId: parseInt(idTallerFinal) // 👈 Aquí aseguramos que no sea NaN
    };

    console.log("🚀 PAYLOAD FINAL:", payload);

    // 2. Validación de seguridad antes de enviar
    if (isNaN(payload.tecnicoId) || isNaN(payload.servicioId) || isNaN(payload.tallerId)) {
      alert("⚠️ Faltan datos: Por favor selecciona un Servicio y un Técnico.");
      console.error("IDs inválidos detectados:", payload);
      return;
    }

    try {
      // 3. Envío al servidor
      await axios.post(`${API_URL}/citas`, payload);
      alert("✅ Cita reservada con éxito");
      setModalCita(null);
      fetchData(); // Refrescamos la tabla
    } catch (err) {
      // Mostramos el error exacto que manda nuestro controlador de Node
      const mensajeError = err.response?.data?.error || "Error de conexión";
      alert("❌ Error: " + mensajeError);
    }
  };

  const handleEliminarCliente = async () => {
    try {
      await axios.delete(`${API_URL}/clientes/${modalEliminar.id}`);
      setModalEliminar(null);
      fetchData();
    } catch (err) { alert("Error al eliminar"); }
  }

  const filtered = useMemo(() => {
    return clientes.filter(c => 
      c.nombres.toLowerCase().includes(search.toLowerCase()) || 
      c.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      c.numDocumento.includes(search) ||
      c.vehiculos?.some(v => v.placa.toLowerCase().includes(search.toLowerCase()))
    )
  }, [clientes, search])

  const hoy = new Date().toISOString().split('T')[0];

  const isPastTime = (slotTime) => {
    const ahora = new Date();
    const hoyStr = ahora.toISOString().split('T')[0];
    
    // Si la fecha elegida no es hoy, no bloqueamos por hora
    if (formCita.fecha !== hoyStr) return false;

    // Si es hoy, comparamos las horas
    const horaActual = ahora.getHours();
    const horaSlot = parseInt(slotTime.split(':')[0]);

    // Bloqueamos si la hora del slot es menor o igual a la hora actual
    return horaSlot <= horaActual;
  };

  const renderEstadoCita = (cliente) => {
    const citaActiva = cliente.vehiculos.some(v => 
      v.citas.some(c => c.estado === 'PENDIENTE' || c.estado === 'EN PROCESO')
    );

    if (citaActiva) {
      return (
        <div className="flex flex-col items-start">
          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-black uppercase flex items-center gap-1 border border-emerald-100">
            <span className="animate-pulse">🗓️</span> CITA ACTIVA
          </span>
          <span className="text-[10px] text-gray-400 mt-1 italic">
              {cliente.correo}
          </span>
        </div>
      );
    }

    // Si no hay ninguna pendiente o en proceso, está "SIN CITA"
    return (
      <div className="flex flex-col items-start opacity-50">
        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-[10px] font-black uppercase flex items-center gap-1 border border-gray-200">
          ⚪ SIN CITA
        </span>
        <span className="text-[10px] text-gray-300 mt-1">
            {cliente.correo}
        </span>
      </div>
    );
  };

  return (
    <Layout tituloNavbar="Directorio de Clientes · Dr. Motors">
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(.97) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .row-hover:hover { background: #f8fafc; }
        .cell { padding: 15px 20px; border-bottom: 1px solid #e8ecf1; }
      `}</style>

      <div style={{ padding: '2rem', background: C.bg, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.navy }}>Gestión de Propietarios</h1>
            <p style={{ color: C.muted, fontSize: 13 }}>Registra y administra la flota de tus clientes</p>
          </div>
          <button onClick={() => { setForm(INIT_FORM); setModalNuevo(true); }} style={{ background: C.blue, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,123,255,0.25)' }}>
            + NUEVO CLIENTE
          </button>
        </div>

        <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px 16px 0 0', border: `1px solid ${C.border}`, borderBottom: 'none' }}>
           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar por nombre, DNI o placa..." style={{ width: '100%', maxWidth: 400, padding: '10px 15px', borderRadius: 10, border: `1px solid ${C.border}`, outline: 'none', fontSize: 13 }} />
        </div>

        <div style={{ background: '#fff', borderRadius: '0 0 16px 16px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>CLIENTE</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>DNI / RUC</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>TELÉFONO</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>VEHÍCULO</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: C.subtle }}>CITA / CORREO</th>
                <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: 11, color: C.subtle }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const v = c.vehiculos?.[0] || {};

                // 1. CAMBIO CLAVE: Buscamos la cita específica para tener el objeto completo
                const citaActiva = c.vehiculos?.flatMap(veh => veh.citas || [])
                  .find(cita => cita.estado === 'PENDIENTE' || cita.estado === 'EN PROCESO');

                // 2. Definimos el booleano para el bloqueo del botón
                const tieneCitaActiva = Boolean(citaActiva);

                return (
                  <tr key={c.id} className="row-hover">
                    <td className="cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#eef6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007bff' }}>
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: C.navy }}>{c.nombres} {c.apellidos}</div>
                          <div style={{ fontSize: 10, color: C.subtle, fontWeight: 600 }}>CLIENTE REGISTRADO</div>
                        </div>
                      </div>
                    </td>

                    <td className="cell" style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{c.numDocumento}</td>
                    <td className="cell" style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{c.telefono}</td>
                    
                    <td className="cell">
                      {v.placa ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ background: C.navy, color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 900, width: 'fit-content', fontFamily: 'monospace' }}>{v.placa}</span>
                          <span style={{ fontSize: 10, color: C.blue, fontWeight: 800 }}>{v.tipo}</span>
                          <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{v.marca} {v.modelo}</span>
                        </div>
                      ) : '---'}
                    </td>

                    <td className="cell">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {/* ✅ Ahora citaActiva ya está definida */}
                        {tieneCitaActiva ? (
                          <button 
                            onClick={() => setModalVerCita({ cliente: c, cita: citaActiva })} 
                            style={{ border: 'none', background: '#ecfdf5', color: '#15803d', padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: 'pointer', width: 'fit-content' }}
                          >
                            📅 CITA ACTIVA
                          </button>
                        ) : (
                          <span style={{ color: C.muted, background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, width: 'fit-content' }}>
                            🔘 SIN CITA
                          </span>
                        )}
                        <div style={{ fontSize: 11, color: C.subtle }}>{c.email || 'sin-correo@mail.com'}</div>
                      </div>
                    </td>

                    <td className="cell" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        {/* BOTÓN AGENDAR / BLOQUEADO */}
                        <button 
                          onClick={() => { 
                            setFormCita({ ...formCita, hora: '', tallerId: user?.tallerId || '', tecnicoId: '', servicioId: '' }); 
                            setModalCita(c); 
                          }} 
                          disabled={tieneCitaActiva} 
                          title={tieneCitaActiva ? "Cliente con cita en curso" : "Agendar Cita"}
                          style={{ 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            padding: '8px', 
                            borderRadius: 8, 
                            color: '#64748b', 
                            cursor: tieneCitaActiva ? 'not-allowed' : 'pointer',
                            opacity: tieneCitaActiva ? 0.4 : 1,
                            filter: tieneCitaActiva ? 'grayscale(1)' : 'none'
                          }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </button>

                        {/* EDITAR (Opcional, puedes poner el ícono de lápiz aquí) */}
                        <button 
                          onClick={() => abrirEdicion(c)}
                          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: 8, color: '#64748b', cursor: 'pointer' }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>

                        {/* ELIMINAR */}
                        <button 
                          onClick={() => setModalEliminar(c)} 
                          title="Eliminar"
                          style={{ background: '#fff1f2', border: '1px solid #fda4af', padding: '8px', borderRadius: 8, color: '#e11d48', cursor: 'pointer' }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL NUEVO CLIENTE (RESTAURADO) ── */}
      {modalNuevo && (
        <Modal title="Nuevo Cliente" subtitle="Complete los datos del propietario y vehículo" onClose={() => setModalNuevo(false)} wide>
          <form onSubmit={handleCrear}>
            <SectionTitle icon="👤">INFORMACIÓN DEL PROPIETARIO</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginBottom: 20 }}>
              <Field label="Nombres"><SInput required value={form.nombres} onChange={e => handleInput('nombres', e.target.value)} /></Field>
              <Field label="Apellidos"><SInput required value={form.apellidos} onChange={e => handleInput('apellidos', e.target.value)} /></Field>
              <Field label="DNI / RUC"><SInput required value={form.dni} onChange={e => handleInput('dni', e.target.value)} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 15, marginBottom: 30 }}>
              <Field label="Correo Electrónico (Opcional)"><SInput type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="cliente@correo.com" /></Field>
              <Field label="Teléfono"><SInput required value={form.telefono} onChange={e => handleInput('telefono', e.target.value)} /></Field>
            </div>
            <SectionTitle icon="🚗">INFORMACIÓN DEL VEHÍCULO</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr', gap: 12, marginBottom: 15 }}>
              <Field label="Placa"><SInput required value={form.vehiculo.placa} onChange={e => handleVehiculo('placa', e.target.value)} extraStyle={{ background: '#eef6ff', fontWeight: 'bold' }} /></Field>
              <Field label="Marca"><SInput required value={form.vehiculo.marca} onChange={e => handleVehiculo('marca', e.target.value)} /></Field>
              <Field label="Modelo"><SInput required value={form.vehiculo.modelo} onChange={e => handleVehiculo('modelo', e.target.value)} /></Field>
              <Field label="Año"><SInput type="number" value={form.vehiculo.anio} onChange={e => handleVehiculo('anio', e.target.value)} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.2fr', gap: 12, marginBottom: 30 }}>
              <Field label="Color"><SInput value={form.vehiculo.color} onChange={e => handleVehiculo('color', e.target.value)} /></Field>
              <Field label="Combustible">
                <select required value={form.vehiculo.combustible} onChange={e => handleVehiculo('combustible', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 13 }}>
                  <option value="">ELEGIR COMBUSTIBLE...</option>
                  {COMBUSTIBLES.map(c => <option key={c} value={c.toUpperCase()}>{c.toUpperCase()}</option>)}
                </select>
              </Field>
              <Field label="Tipo de Vehículo">
                <select required value={form.vehiculo.tipo} onChange={e => handleVehiculo('tipo', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 13, background: '#eef6ff', color: C.blue, fontWeight: 'bold' }}>
                  <option value="">Elegir categoría...</option>
                  {OPCIONES_TIPOS.map(tipo => <option key={tipo} value={tipo.toUpperCase()}>{tipo}</option>)}
                </select>
              </Field>
            </div>
            <button type="submit" style={{ width: '100%', padding: '15px', background: C.blue, color: 'white', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,123,255,0.3)' }}>
              <svg width="18" height="18" fill="currentColor" style={{marginRight: 8}} viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
              REGISTRAR CLIENTE Y VEHÍCULO
            </button>
          </form>
        </Modal>
      )}

      {/* ── MODAL RESERVAR CITA ── */}
      {modalCita && (
        <Modal title="RESERVAR ESPACIO EN TALLER" subtitle={`${modalCita.apellidos} · ${modalCita.vehiculos?.[0]?.placa}`} onClose={() => setModalCita(null)} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionTitle icon="🏎️">Información del Vehículo</SectionTitle>
              <div style={{ background: '#eef6ff', padding: '15px', borderRadius: '12px', border: '1px solid #bcd8f7' }}>
                <div style={{ fontWeight: 900, color: '#1a3a5c', fontSize: '15px' }}>{modalCita.vehiculos?.[0]?.marca} {modalCita.vehiculos?.[0]?.modelo}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#007bff', marginTop: '4px' }}>TIPO: {modalCita.vehiculos?.[0]?.tipo}</div>
              </div>
              <SectionTitle icon="🔧">Tipo de Atención</SectionTitle>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['MANTENIMIENTO', 'DIAGNOSTICO'].map(t => (
                  <button key={t} type="button" onClick={() => setTipoAtencion(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', border: `2px solid ${tipoAtencion === t ? C.navy : '#f1f5f9'}`, background: tipoAtencion === t ? C.navy : '#fff', color: tipoAtencion === t ? '#fff' : C.muted }}>{t}</button>
                ))}
              </div>
              <Field label="Servicio">
                <select value={formCita.servicioId} onChange={e => setFormCita({...formCita, servicioId: e.target.value, hora: ''})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, fontWeight: 600 }}>
                  <option value="">Seleccionar servicio...</option>
                  {serviciosFiltrados.map(s => <option key={s.id} value={s.id}>{s.especialidad} {s.nivel} ({s.duracion}H)</option>)}
                </select>
              </Field>
              {/* SECCIÓN DE TALLER */}
              <Field label="Sede / Taller">
                {!user?.tallerId ? (
                  // VISTA ADMIN: Puede elegir taller
                  <select 
                    value={formCita.tallerId} 
                    onChange={e => setFormCita({...formCita, tallerId: e.target.value, tecnicoId: ''})} // Reset técnico al cambiar taller
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, fontWeight: 600, background: '#fff' }}
                  >
                    <option value="">Seleccionar taller...</option>
                    {talleresDB.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                ) : (
                  // VISTA STAFF: Solo ve su taller (bloqueado)
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '10px', fontWeight: 700, color: C.navy, border: `1px solid ${C.border}` }}>
                    📍 {talleresDB.find(t => t.id === user.tallerId)?.nombre || 'Cargando taller...'}
                  </div>
                )}
              </Field>
              <Field label="Asignar Mecánico">
                <select value={formCita.tecnicoId} onChange={e => setFormCita({...formCita, tecnicoId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, fontWeight: 600 }}>
                  <option value="">Seleccionar técnico...</option>
                  {mecanicosFiltrados.map(m => <option key={m.id} value={m.id}>{m.nombre} {(!user?.tallerId && m.tallerId) ? `(Taller ${m.tallerId})` : ''}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SectionTitle icon="🕐">Horario de Ingreso</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(h => {
                  const ocupado = isTechnicianBusy(h);
                  const esPasado = isPastTime(h); // 🚀 Nueva validación
                  const seleccionado = isTimeInRange(h);

                  return (
                    <button 
                      key={h} 
                      type="button" 
                      // Deshabilitamos si está ocupado O si la hora ya pasó
                      disabled={ocupado || esPasado} 
                      onClick={() => setFormCita({...formCita, hora: h})} 
                      style={{ 
                        padding: '14px 5px', 
                        borderRadius: '10px', 
                        fontWeight: '800', 
                        fontSize: '13px', 
                        // Cambiamos el cursor y estilo si es una hora pasada
                        cursor: (ocupado || esPasado) ? 'not-allowed' : 'pointer', 
                        border: `2px solid ${seleccionado ? C.blue : (ocupado || esPasado) ? '#fee2e2' : '#f1f5f9'}`, 
                        background: seleccionado ? C.blue : (ocupado || esPasado) ? '#fef2f2' : '#fff', 
                        color: seleccionado ? '#fff' : (ocupado || esPasado) ? '#ef4444' : C.navy, 
                        opacity: (ocupado || esPasado) ? 0.6 : 1 
                      }}
                    >
                      {ocupado ? 'OCUPADO' : esPasado ? 'PASADO' : h}
                    </button>
                  );
                })}
              </div>
              <Field label="Fecha Programada">
                <input 
                  type="date" 
                  min={hoy} // 🚀 Esto bloquea cualquier día anterior a hoy
                  value={formCita.fecha} 
                  onChange={e => setFormCita({...formCita, fecha: e.target.value, hora: ''})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, fontWeight: '700' }} 
                />
              </Field>
              <button onClick={handleConfirmarCita} disabled={!formCita.hora || !formCita.servicioId || !formCita.tecnicoId} style={{ width: '100%', padding: '16px', background: C.blue, color: 'white', border: 'none', borderRadius: '15px', fontSize: '14px', fontWeight: '900', cursor: 'pointer', opacity: (!formCita.hora || !formCita.servicioId) ? 0.5 : 1 }}>CONFIRMAR RESERVA</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL VER DETALLE (RESTAURADO) ── */}
      {modalVerCita && (
        <Modal 
          title="DETALLES DE LA CITA" 
          subtitle={`${modalVerCita.cliente.apellidos} · ${modalVerCita.cita.vehiculoPlaca}`} 
          onClose={() => setModalVerCita(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* SECCIÓN SERVICIO */}
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.subtle, textTransform: 'uppercase', marginBottom: 8 }}>Servicio Programado</div>
              <div style={{ fontWeight: 800, color: C.navy, fontSize: '15px' }}>
                {modalVerCita.cita.servicio?.especialidad || "SERVICIO NO DEFINIDO"}
              </div>
              <div style={{ fontSize: '12px', color: C.blue, fontWeight: 700 }}>
                {modalVerCita.cita.servicio?.nivel || "MANTENIMIENTO"}
              </div>
            </div>

            {/* SECCIÓN FECHA Y HORA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: '#eef6ff' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.blue }}>FECHA</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {new Date(modalVerCita.cita.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: '#eef6ff' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.blue }}>HORARIO</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{modalVerCita.cita.hora_inicio} - {modalVerCita.cita.hora_fin}</div>
              </div>
            </div>

            {/* SECCIÓN MECÁNICO */}
            <div style={{ padding: '15px', borderRadius: '12px', border: `1px dashed ${C.border}`, background: '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.subtle, textTransform: 'uppercase', marginBottom: 5 }}>Mecánico Responsable</div>
              <div style={{ fontWeight: 800, color: C.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.blue, color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {modalVerCita.cita.tecnico?.nombre?.charAt(0) || "M"}
                </div>
                {modalVerCita.cita.tecnico?.nombre || "TÉCNICO POR ASIGNAR"}
              </div>
            </div>

            <button 
              onClick={() => setModalVerCita(null)}
              style={{ width: '100%', padding: '15px', background: C.navy, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', marginTop: 10 }}
            >
              CERRAR VISTA
            </button>
          </div>
        </Modal>
      )}

      {/* ── MODAL ELIMINAR (RESTAURADO) ── */}
      {modalEliminar && (
        <Modal title="Eliminar Cliente" onClose={() => setModalEliminar(null)}>
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
            <p style={{ fontWeight: 700, color: C.navy }}>¿Estás seguro de eliminar a {modalEliminar.nombres}?</p>
            <p style={{ fontSize: '12px', color: C.muted, marginTop: '5px' }}>Esta acción no se puede deshacer y borrará sus vehículos asociados.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 25 }}>
              <button onClick={() => setModalEliminar(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleEliminarCliente} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#e11d48', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Sí, eliminar</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL EDITAR ── */}
      {modalEditar && (
        <Modal title="Editar Perfil del Cliente" subtitle={`Actualizando datos de ${modalEditar.nombres}`} onClose={() => setModalEditar(null)}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await axios.put(`${API_URL}/clientes/${formEdit.id}`, {
                nombres: formEdit.nombres.toUpperCase(),
                apellidos: formEdit.apellidos.toUpperCase(),
                numDocumento: formEdit.dni,
                email: formEdit.email.toLowerCase(),
                telefono: formEdit.telefono
              });
              setModalEditar(null);
              fetchData(); // Recargamos la tabla
            } catch (err) { alert("Error al actualizar"); }
          }}>
            <div style={{ display: 'grid', gap: 15 }}>
              <Field label="Nombres"><SInput required value={formEdit.nombres} onChange={e => setFormEdit({...formEdit, nombres: e.target.value})} /></Field>
              <Field label="Apellidos"><SInput required value={formEdit.apellidos} onChange={e => setFormEdit({...formEdit, apellidos: e.target.value})} /></Field>
              <Field label="DNI / RUC"><SInput required value={formEdit.dni} onChange={e => setFormEdit({...formEdit, dni: e.target.value})} /></Field>
              <Field label="Teléfono"><SInput required value={formEdit.telefono} onChange={e => setFormEdit({...formEdit, telefono: e.target.value})} /></Field>
              <Field label="Correo Electrónico"><SInput type="email" value={formEdit.email} onChange={e => setFormEdit({...formEdit, email: e.target.value})} /></Field>
              
              <button type="submit" style={{ width: '100%', padding: '15px', background: C.blue, color: 'white', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer', marginTop: 10 }}>
                ACTUALIZAR DATOS
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}