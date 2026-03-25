import { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios' // Asegúrate de que esta ruta sea correcta

const GASTOS = [
  { key: 'alquiler',     label: 'Alquiler (%)'    },
  { key: 'gestion',      label: 'Gestión (%)'      },
  { key: 'marketing',    label: 'Marketing (%)'    },
  { key: 'herramientas', label: 'Herramientas (%)' },
  { key: 'transporte',   label: 'Transporte (%)'   },
]

/* ─── UI Primitives ─────────────────── */
function Field({ label, children }) {
  return (
    <div>
      <label className="block mb-1" style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const baseInput = { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }
const focusInput = { border: '1px solid #1a3a5c', background: '#fff', boxShadow: '0 0 0 3px rgba(26,58,92,0.08)' }
const inputCls = 'w-full px-3 py-2 text-sm rounded-lg outline-none transition-all font-semibold'

function SInput({ ...props }) {
  const [f, setF] = useState(false)
  return <input {...props} className={inputCls}
    style={{ ...baseInput, ...(f ? focusInput : {}) }}
    onFocus={() => setF(true)} onBlur={() => setF(false)} />
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function Rentabilidad() {
  const { user } = useAuth()
  const [matrix, setMatrix] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  // 1. Cargar la configuración desde la Base de Datos
  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const { data } = await api.get('/rentabilidad')
        setMatrix(data)
      } catch (err) {
        console.error("Error al cargar la matriz maestra:", err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchMatrix()
  }, [user])

  if (!user || loading) return (
    <Layout tituloNavbar="Configuración del Negocio">
      <div className="p-10 text-center text-slate-400 font-medium">Cargando parámetros financieros...</div>
    </Layout>
  )

  const setVal = (key, val) => {
    // Convertimos a número para asegurar compatibilidad con Float en la DB
    setMatrix(m => ({ ...m, [key]: val === '' ? 0 : parseFloat(val) }))
    setSaved(false)
  }

  // Cálculos dinámicos
  const totalGastos   = GASTOS.reduce((acc, g) => acc + (Number(matrix[g.key]) || 0), 0)
  const utilidadFinal = Number(matrix.utilidad || 0)

  // 2. Guardar cambios en la Base de Datos
  const handleGuardar = async () => {
    setSaving(true)
    try {
      // Limpiamos el objeto para enviar solo los campos de la tabla
      const { id, updatedAt, ...payload } = matrix
      await api.put('/rentabilidad', payload)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error("Error al guardar:", err)
      alert("Hubo un error al actualizar la Matriz Maestra")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout tituloNavbar="Configuración del Negocio">
      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>
              Configuración de Rentabilidad
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Ajusta los porcentajes de la Matriz Maestra que se aplican a los costos de taller.
            </p>
          </div>
          <button 
            onClick={handleGuardar}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm disabled:opacity-50"
            style={{ background: saved ? '#15803d' : '#1a3a5c' }}
          >
            {saving ? (
               <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : saved ? (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Cambios guardados
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                Actualizar Matriz Maestra
              </>
            )}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total gastos operativos', value: `${totalGastos.toFixed(2)}%`,    icon: '📊', accent: '#1a3a5c' },
            { label: 'Margen de utilidad',      value: `${utilidadFinal.toFixed(2)}%`, icon: '💰', accent: '#15803d' },
            { label: 'Carga total sobre costo', value: `${(totalGastos + utilidadFinal).toFixed(2)}%`, icon: '📈', accent: '#2b6cb0' },
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

        <div className="grid grid-cols-3 gap-5">
          {/* ── Gastos operativos ── */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <svg width="14" height="14" fill="none" stroke="#1a3a5c" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1a3a5c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Gastos Operativos (Porcentajes)
                </span>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {GASTOS.slice(0, 3).map(g => (
                    <div key={g.key} className="rounded-xl p-3.5"
                      style={{ border: '1px solid #e9edf2', background: '#f8fafc' }}>
                      <Field label={g.label}>
                        <SInput type="number" min={0} max={100} step={0.1}
                          value={matrix[g.key]}
                          onChange={e => setVal(g.key, e.target.value)} />
                      </Field>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {GASTOS.slice(3).map(g => (
                    <div key={g.key} className="rounded-xl p-3.5"
                      style={{ border: '1px solid #e9edf2', background: '#f8fafc' }}>
                      <Field label={g.label}>
                        <SInput type="number" min={0} max={100} step={0.1}
                          value={matrix[g.key]}
                          onChange={e => setVal(g.key, e.target.value)} />
                      </Field>
                    </div>
                  ))}

                  <div className="rounded-xl p-3.5 flex flex-col justify-center"
                    style={{ border: '1px solid #bfdbfe', background: '#eff6ff' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                      Total gastos
                    </p>
                    <p className="text-3xl font-bold" style={{ color: '#1d4ed8' }}>
                      {totalGastos.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-5 mb-5 px-4 py-3 rounded-xl" style={{ background: '#1a3a5c' }}>
                <p style={{ fontSize: 10, color: 'rgba(122,175,212,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Fórmula de precio sugerido activa
                </p>
                <p className="text-sm font-medium" style={{ color: '#fff' }}>
                  Costo Directo × <span style={{ color: '#fbbf24' }}>(1 + {totalGastos}%)</span> × <span style={{ color: '#4ade80' }}>(1 + {utilidadFinal}%)</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Margen neto ── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <svg width="14" height="14" fill="none" stroke="#15803d" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Margen de Ganancia
                </span>
              </div>

              <div className="p-5">
                <div className="rounded-xl p-3.5 mb-4" style={{ border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                  <Field label="Utilidad Final (%)">
                    <input type="number" min={0} max={100} step={0.1}
                      value={matrix.utilidad}
                      onChange={e => setVal('utilidad', e.target.value)}
                      className={inputCls}
                      style={{ border: '1px solid #bbf7d0', background: '#fff', color: '#15803d' }} />
                  </Field>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#15803d' }}>
                    {utilidadFinal.toFixed(2)}%
                  </p>
                </div>

                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <svg width="13" height="13" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                    Este margen se aplica después de cubrir todos los gastos operativos.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl px-4 py-3 bg-white" style={{ border: '1px solid #e9edf2' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  Afectará el "Precio Sugerido" global.
                </p>
              </div>
              <p className="text-xs font-semibold" style={{ color: '#1a3a5c' }}>
                Matriz activa: {totalGastos}% Gastos + {utilidadFinal}% Utilidad
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}