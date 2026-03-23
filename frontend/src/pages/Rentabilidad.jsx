import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { configuracionRentabilidadMock } from '../services/mockData'

const GASTOS = [
  { key: 'alquiler',     label: 'Alquiler (%)'    },
  { key: 'gestion',      label: 'Gestión (%)'      },
  { key: 'marketing',    label: 'Marketing (%)'    },
  { key: 'herramientas', label: 'Herramientas (%)' },
  { key: 'transporte',   label: 'Transporte (%)'   },
]

/* ─── UI Primitives (mismo estilo que Productos) ─────────────────── */
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

/* ─── Main ───────────────────────────────────────────────────────── */
export default function Rentabilidad() {
  const { user } = useAuth()
  const [matrix, setMatrix] = useState(configuracionRentabilidadMock)
  const [saved, setSaved]   = useState(false)

  if (!user) return null

  const setVal = (key, val) => {
    setMatrix(m => ({ ...m, [key]: val }))
    setSaved(false)
  }

  const totalGastos   = GASTOS.reduce((acc, g) => acc + Number(matrix[g.key] || 0), 0)
  const utilidadFinal = Number(matrix.utilidad || 0)

  const handleGuardar = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    console.log('Nueva Matriz Maestra:', matrix)
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
          <button onClick={handleGuardar}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm"
            style={{ background: saved ? '#15803d' : '#1a3a5c' }}
            onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#243f66' }}
            onMouseLeave={e => { if (!saved) e.currentTarget.style.background = saved ? '#15803d' : '#1a3a5c' }}>
            {saved ? (
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

        {/* Stat cards — mismo estilo que Productos */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total gastos operativos', value: `${totalGastos.toFixed(2)}%`,                  icon: '📊', accent: '#1a3a5c' },
            { label: 'Margen de utilidad',      value: `${utilidadFinal.toFixed(2)}%`,                icon: '💰', accent: '#15803d' },
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

        {/* Cuerpo principal */}
        <div className="grid grid-cols-3 gap-5">

          {/* ── Gastos operativos (2/3) ── */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <svg width="14" height="14" fill="none" stroke="#1a3a5c" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1a3a5c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Gastos Operativos (Porcentajes)
                </span>
              </div>

              <div className="p-5">
                {/* Fila 1: 3 gastos */}
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

                {/* Fila 2: 2 gastos + total */}
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

                  {/* Card total gastos */}
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

              {/* Fórmula activa */}
              <div className="mx-5 mb-5 px-4 py-3 rounded-xl"
                style={{ background: '#1a3a5c' }}>
                <p style={{ fontSize: 10, color: 'rgba(122,175,212,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Fórmula de precio sugerido activa
                </p>
                <p className="text-sm font-medium" style={{ color: '#fff' }}>
                  Costo Directo ×{' '}
                  <span style={{ color: '#fbbf24' }}>(1 + {totalGastos}% gastos)</span>
                  {' '}×{' '}
                  <span style={{ color: '#4ade80' }}>(1 + {utilidadFinal}% utilidad)</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Margen neto (1/3) ── */}
          <div className="flex flex-col gap-4">

            <div className="bg-white rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <svg width="14" height="14" fill="none" stroke="#15803d" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Margen de Ganancia
                </span>
              </div>

              <div className="p-5">
                {/* Input utilidad */}
                <div className="rounded-xl p-3.5 mb-4"
                  style={{ border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                  <Field label="Utilidad Final (%)">
                    <input type="number" min={0} max={100} step={0.1}
                      value={matrix.utilidad}
                      onChange={e => setVal('utilidad', e.target.value)}
                      className={inputCls}
                      style={{ border: '1px solid #bbf7d0', background: '#fff', color: '#15803d' }}
                      onFocus={e => { e.target.style.border = '1px solid #15803d'; e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.1)' }}
                      onBlur={e => { e.target.style.border = '1px solid #bbf7d0'; e.target.style.boxShadow = 'none' }} />
                  </Field>
                  <p className="text-3xl font-bold mt-2" style={{ color: '#15803d' }}>
                    {utilidadFinal.toFixed(2)}%
                  </p>
                </div>

                {/* Nota */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <svg width="13" height="13" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                    Este margen se aplica después de cubrir todos los gastos operativos mencionados arriba.
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen activo */}
            <div className="rounded-xl px-4 py-3 bg-white"
              style={{ border: '1px solid #e9edf2' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  Los cambios afectarán el "Precio Sugerido" en todo el Gestor de Costos.
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