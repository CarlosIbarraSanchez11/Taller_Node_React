import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { productosMock, talleresMock, configuracionRentabilidadMock } from '../services/mockData'

const ROWS_PER_PAGE = 8

/* ─── Fórmula centralizada ───────────────────────────────────────── */
function calcularPrecioSugerido(insumo, hh, costoHH, tecnicos, matriz) {
  const subMO        = hh * costoHH * tecnicos
  const subTotal     = insumo + subMO
  const totalGastosPct = (matriz.alquiler + matriz.gestion + matriz.marketing + matriz.herramientas + matriz.transporte) / 100
  const montoGastos  = subTotal * totalGastosPct
  const montoUtil    = (subTotal + montoGastos) * (matriz.utilidad / 100)
  return subTotal + montoGastos + montoUtil
}

/* ─── UI Primitives (mismo estilo que Productos) ─────────────────── */
function Overlay({ onClose }) {
  return <div onClick={onClose} className="fixed inset-0 z-40"
    style={{ background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(2px)' }} />
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
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
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  )
}

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
const inputCls = 'w-full px-3 py-2 text-sm rounded-lg outline-none transition-all'

function SInput({ ...props }) {
  const [f, setF] = useState(false)
  return <input {...props} className={inputCls}
    style={{ ...baseInput, ...(f ? focusInput : {}) }}
    onFocus={() => setF(true)} onBlur={() => setF(false)} />
}

/* ─── Sort Icon ──────────────────────────────────────────────────── */
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

/* ─── Modal de ajuste con preview en tiempo real ─────────────────── */
function ModalAjuste({ item, onClose, onSave }) {
  const [ci,  setCi]  = useState(item.costoInsumo)
  const [hh,  setHh]  = useState(item.hh)
  const [chh, setChh] = useState(item.costoHH)
  const [tec, setTec] = useState(item.tecnicos)

  const pvs   = calcularPrecioSugerido(Number(ci), Number(hh), Number(chh), Number(tec), configuracionRentabilidadMock)
  const moBase = Number(hh) * Number(chh) * Number(tec)
  const subT  = Number(ci) + moBase
  const totalGastosPct = (configuracionRentabilidadMock.alquiler + configuracionRentabilidadMock.gestion + configuracionRentabilidadMock.marketing + configuracionRentabilidadMock.herramientas + configuracionRentabilidadMock.transporte)
  const gastos = subT * (totalGastosPct / 100)
  const util   = (subT + gastos) * (configuracionRentabilidadMock.utilidad / 100)

  const handleSubmit = e => {
    e.preventDefault()
    onSave(item.id, { costoInsumo: Number(ci), hh: Number(hh), costoHH: Number(chh), tecnicos: Number(tec) })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Info producto */}
      <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
        style={{ background: '#f8fafc', border: '1px solid #e9edf2' }}>
        <span style={{ fontSize: 20 }}>🔧</span>
        <div>
          <p className="text-sm font-bold" style={{ color: '#1e293b' }}>{item.nombre}</p>
          <p className="text-xs font-semibold" style={{ color: '#94a3b8', letterSpacing: '0.04em' }}>{item.marca?.toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Costo Insumo (S/.)">
          <SInput type="number" step="0.01" min={0} value={ci} onChange={e => setCi(e.target.value)} />
        </Field>
        <Field label="Tiempo Estimado (HH)">
          <SInput type="number" step="0.1" min={0} value={hh} onChange={e => setHh(e.target.value)} />
        </Field>
        <Field label="Costo Hora Técnico (S/.)">
          <SInput type="number" step="0.1" min={0} value={chh} onChange={e => setChh(e.target.value)} />
        </Field>
        <Field label="N° de Técnicos">
          <SInput type="number" step="1" min={1} value={tec} onChange={e => setTec(e.target.value)} />
        </Field>
      </div>

      {/* Desglose */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #e9edf2' }}>
        {[
          { label: 'Sub Total Repuesto',         value: `S/ ${Number(ci).toFixed(2)}` },
          { label: 'Sub Total MO',               value: `S/ ${moBase.toFixed(2)}` },
          { label: 'Sub Total',                  value: `S/ ${subT.toFixed(2)}` },
          { label: `Gastos (${totalGastosPct}%)`, value: `S/ ${gastos.toFixed(2)}`, dim: true },
          { label: `Utilidad (${configuracionRentabilidadMock.utilidad}%)`, value: `S/ ${util.toFixed(2)}`, dim: true },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none', background: i % 2 === 0 ? '#fafcff' : '#fff' }}>
            <span className="text-xs" style={{ color: r.dim ? '#94a3b8' : '#475569' }}>{r.label}</span>
            <span className="text-xs font-semibold" style={{ color: r.dim ? '#94a3b8' : '#1e293b' }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* PVS destacado */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
        style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Precio Venta Sugerido
          </p>
          <p style={{ fontSize: 11, color: '#3b82f6' }}>Aplicando Matriz de Rentabilidad Maestra</p>
        </div>
        <p className="text-2xl font-bold" style={{ color: '#1d4ed8' }}>S/ {pvs.toFixed(2)}</p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2 text-sm rounded-lg font-medium"
          style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 py-2 text-sm rounded-lg font-medium text-white"
          style={{ background: '#1a3a5c' }}
          onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
          onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
          Guardar Estructura
        </button>
      </div>
    </form>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function GestorCostos() {
  const { user } = useAuth()

  /* ─── HOOKS (Sinceramente, aquí está el orden correcto para React) ─── */
  
  const [costos, setCostos] = useState(() =>
    productosMock.map(p => ({
      ...p,
      costoInsumo: p.id === 1 ? 150 : 0,
      hh:          p.id === 1 ? 1   : 0,
      costoHH:     p.id === 1 ? 10  : 0,
      tecnicos:    1,
    }))
  )

  const [modalEdit, setModalEdit] = useState(null)
  const [search, setSearch]       = useState('')
  const [sort, setSort]           = useState({ col: 'nombre', dir: 'asc' })
  const [page, setPage]           = useState(1)

  useEffect(() => setPage(1), [search, sort])

  // 🚀 useMemo DEBE ejecutarse siempre (antes del return condicional)
  const filtered = useMemo(() => {
    if (!user) return [] // Seguridad interna pero el hook se registró
    
    let d = costos.filter(c =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.marca.toLowerCase().includes(search.toLowerCase())
    )
    d.sort((a, b) => {
      const va = sort.col === 'pvs' ? calcularPrecioSugerido(a.costoInsumo, a.hh, a.costoHH, a.tecnicos, configuracionRentabilidadMock) : (a[sort.col] ?? '')
      const vb = sort.col === 'pvs' ? calcularPrecioSugerido(b.costoInsumo, b.hh, b.costoHH, b.tecnicos, configuracionRentabilidadMock) : (b[sort.col] ?? '')
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb), undefined, { numeric: true })
        : String(vb).localeCompare(String(va), undefined, { numeric: true })
    })
    return d
  }, [costos, search, sort, user])

  /* ─── VALIDACIÓN (Solo después de declarar todos los Hooks) ─── */
  if (!user) return null

  /* ─── LÓGICA DE COMPONENTE ─── */
  const toggleSort = col => setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const handleUpdate = (id, data) => setCostos(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))

  const conCosto = costos.filter(c => c.costoInsumo > 0).length
  const totalGastosPct = configuracionRentabilidadMock.alquiler + configuracionRentabilidadMock.gestion + configuracionRentabilidadMock.marketing + configuracionRentabilidadMock.herramientas + configuracionRentabilidadMock.transporte

  const TH = ({ col, label, width, right }) => (
    <th onClick={() => col && toggleSort(col)}
      className="px-4 py-3 select-none"
      style={{ width, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {label}{col && <SortIcon dir={sort.col === col ? sort.dir : null} />}
      </span>
    </th>
  )

  return (
    <Layout tituloNavbar="Estructura de Costos Maestros">
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Gestor de Costos Maestros</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Configuración individual de Mano de Obra, Costo HH y Personal.</p>
          </div>
          {/* Matriz activa chip */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ border: '1px solid #e9edf2', background: '#fff' }}>
            <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Matriz de Rentabilidad</p>
              <p className="text-xs font-bold" style={{ color: '#1a3a5c' }}>
                {totalGastosPct}% Gastos + {configuracionRentabilidadMock.utilidad}% Utilidad
              </p>
            </div>
          </div>
        </div>

        {/* Stat cards — mismo estilo que Productos */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total productos',          value: costos.length,                icon: '📦', accent: '#1a3a5c' },
            { label: 'Con costo configurado',    value: conCosto,                     icon: '✅', accent: '#15803d' },
            { label: 'Sin configurar',           value: costos.length - conCosto,     icon: '⚠️', accent: costos.length - conCosto > 0 ? '#b45309' : '#94a3b8' },
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

        {/* Table card */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por producto o marca…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
                onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'none' }} />
            </div>
            <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>{filtered.length} productos</span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <TH col="nombre"      label="Producto / Repuesto" width="26%" />
                  <TH col="costoInsumo" label="Costo Insumo"        width="13%" right />
                  <TH col="hh"          label="HH"                  width="10%" right />
                  <TH col="costoHH"     label="Costo HH"            width="12%" right />
                  <TH col="tecnicos"    label="Técnicos"            width="10%" right />
                  <TH col="pvs"         label="P. Venta Sugerido"   width="16%" right />
                  <TH                   label=""                     width="5%"  />
                </tr>
              </thead>
              <tbody>
                {rows.map(c => {
                  const pvs    = calcularPrecioSugerido(c.costoInsumo, c.hh, c.costoHH, c.tecnicos, configuracionRentabilidadMock)
                  const moBase = c.hh * c.costoHH * c.tecnicos
                  const noCost = c.costoInsumo === 0 && c.hh === 0

                  return (
                    <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafcff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Nombre */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{c.nombre}</p>
                        <p className="text-xs mt-0.5 font-semibold" style={{ color: '#94a3b8', letterSpacing: '0.04em' }}>{c.marca?.toUpperCase()}</p>
                      </td>

                      {/* Costo insumo */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm" style={{ color: noCost ? '#cbd5e1' : '#475569' }}>
                          S/ {c.costoInsumo.toFixed(2)}
                        </span>
                      </td>

                      {/* HH */}
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#f1f5f9', color: '#475569' }}>
                          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          {c.hh.toFixed(2)} h
                        </span>
                      </td>

                      {/* Costo HH = MO base */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold" style={{ color: moBase > 0 ? '#1d4ed8' : '#cbd5e1' }}>
                          S/ {moBase.toFixed(2)}
                        </span>
                      </td>

                      {/* Técnicos */}
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#f0fdf4', color: '#15803d' }}>
                          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          </svg>
                          x{c.tecnicos}
                        </span>
                      </td>

                      {/* PVS */}
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold" style={{ color: noCost ? '#cbd5e1' : '#15803d' }}>
                          S/ {pvs.toFixed(2)}
                        </p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>BASE MO: S/ {moBase.toFixed(2)}</p>
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setModalEdit(c)}
                          className="flex items-center justify-center rounded-lg transition-all ml-auto"
                          style={{ width: 28, height: 28, color: '#94a3b8', border: '1px solid #e2e8f0' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#1a3a5c'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a3a5c' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-14 text-center" style={{ color: '#94a3b8' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                      <p className="text-sm font-medium">Sin productos</p>
                      <p className="text-xs mt-1">Intenta con otros filtros</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <span className="text-xs" style={{ color: '#94a3b8' }}>Pág. {page} de {totalPages}</span>
              <div className="flex items-center gap-1">
                {[
                  { label: '«', action: () => setPage(1),                               disabled: page === 1 },
                  { label: '‹', action: () => setPage(p => Math.max(1, p - 1)),          disabled: page === 1 },
                  { label: '›', action: () => setPage(p => Math.min(totalPages, p + 1)),disabled: page === totalPages },
                  { label: '»', action: () => setPage(totalPages),                      disabled: page === totalPages },
                ].map((b, i) => (
                  <button key={i} onClick={b.action} disabled={b.disabled}
                    className="flex items-center justify-center rounded-lg text-sm transition-all"
                    style={{ width: 30, height: 30, border: '1px solid #e2e8f0', color: b.disabled ? '#cbd5e1' : '#475569', background: '#fff', cursor: b.disabled ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}
                    onMouseEnter={e => { if (!b.disabled) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ajuste */}
      {modalEdit && (
        <Modal title="Ajuste de Estructura de Costos" onClose={() => setModalEdit(null)}>
          <ModalAjuste item={modalEdit} onClose={() => setModalEdit(null)} onSave={handleUpdate} />
        </Modal>
      )}
    </Layout>
  )
}