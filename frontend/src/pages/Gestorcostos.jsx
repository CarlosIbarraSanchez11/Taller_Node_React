import React, { useState, useMemo, useEffect } from 'react'
import api from "../api/axios"
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

const ROWS_PER_PAGE = 8

/* ─── Fórmula centralizada (Matriz dinámica) ──────────────── */
function calcularPrecioSugerido(insumo, hh, costoHH, tecnicos, matriz) {
  const subMO = hh * costoHH * tecnicos
  const subTotal = insumo + subMO
  const totalGastosPct = (matriz.alquiler + matriz.gestion + matriz.marketing + matriz.herramientas + matriz.transporte) / 100
  const montoGastos = subTotal * totalGastosPct
  const montoUtil = (subTotal + montoGastos) * (matriz.utilidad / 100)
  return subTotal + montoGastos + montoUtil
}

/* ─── UI Primitives ─────────────────────────────────────────── */
function Overlay({ onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-40"
      style={{ background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(2px)' }}
    />
  )
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
          style={{
            pointerEvents: 'auto',
            background: '#fff',
            border: '1px solid #e2e8f0',
            animation: 'modalIn .18s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid #f1f5f9' }}
          >
            <div className="flex items-center gap-2.5">
              <div style={{ width: 6, height: 6, borderRadius: 3, background: '#1a3a5c' }} />
              <span className="text-sm font-semibold text-gray-800 tracking-tight">{title}</span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-lg transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              style={{ width: 28, height: 28 }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  )
}

function Field({ label, children, span }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block mb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg outline-none transition-all border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5'

function ActionBtn({ onClick, title }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center justify-center rounded-lg transition-all"
      style={{
        width: 28,
        height: 28,
        background: hov ? '#1a3a5c' : 'transparent',
        color: hov ? '#fff' : '#94a3b8',
        border: '1px solid',
        borderColor: hov ? '#1a3a5c' : '#e2e8f0',
        cursor: 'pointer',
      }}
    >
      {/* Gear icon */}
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
  )
}

/* ─── Modal de Ajuste ───────────────────────────────────────── */
function ModalAjuste({ item, matriz, onClose, onSave }) {
  const [ci, setCi] = useState(item.costoInsumo)
  const [hh, setHh] = useState(item.hh)
  const [chh, setChh] = useState(item.costoHH)
  const [tec, setTec] = useState(item.tecnicos)

  const pvs = calcularPrecioSugerido(Number(ci), Number(hh), Number(chh), Number(tec), matriz)
  const moBase = Number(hh) * Number(chh) * Number(tec)
  const subT = Number(ci) + moBase
  const totalGastosPct = matriz.alquiler + matriz.gestion + matriz.marketing + matriz.herramientas + matriz.transporte
  const gastos = subT * (totalGastosPct / 100)
  const util = (subT + gastos) * (matriz.utilidad / 100)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(item.id, { costoInsumo: Number(ci), hh: Number(hh), costoHH: Number(chh), tecnicos: Number(tec) })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="Costo Insumo">
          <input className={inputCls} type="number" step="0.01" value={ci} onChange={(e) => setCi(e.target.value)} />
        </Field>
        <Field label="Tiempo (HH)">
          <input className={inputCls} type="number" step="0.1" value={hh} onChange={(e) => setHh(e.target.value)} />
        </Field>
        <Field label="Costo HH">
          <input className={inputCls} type="number" step="0.1" value={chh} onChange={(e) => setChh(e.target.value)} />
        </Field>
        <Field label="Técnicos">
          <input className={inputCls} type="number" value={tec} onChange={(e) => setTec(e.target.value)} />
        </Field>
      </div>

      <div
        className="rounded-xl mb-5 border"
        style={{ background: '#eff6ff', borderColor: '#bfdbfe', padding: '14px 16px' }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Precio Sugerido</p>
            <p className="text-2xl font-black text-blue-700">S/ {pvs.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Utilidad</p>
            <p className="text-sm font-bold text-blue-600">S/ {util.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 text-sm border rounded-lg font-medium text-slate-500 hover:bg-slate-50 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-sm bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  )
}

/* ─── Tabla con paginación ──────────────────────────────────── */
function DataTable({ data, matriz, onEdit }) {
  const [sort, setSort] = useState({ col: 'nombre', dir: 'asc' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [search, sort])

  const filtered = useMemo(() => {
    if (!matriz) return []
    let d = [...data]
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          (c.marca && c.marca.toLowerCase().includes(q))
      )
    }
    d.sort((a, b) => {
      let va, vb
      if (sort.col === 'pvs') {
        va = calcularPrecioSugerido(a.costoInsumo, a.hh, a.costoHH, a.tecnicos, matriz)
        vb = calcularPrecioSugerido(b.costoInsumo, b.hh, b.costoHH, b.tecnicos, matriz)
      } else {
        va = a[sort.col] ?? ''
        vb = b[sort.col] ?? ''
      }
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb), undefined, { numeric: true })
        : String(vb).localeCompare(String(va), undefined, { numeric: true })
    })
    return d
  }, [data, search, sort, matriz])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const toggleSort = (col) =>
    setSort((s) =>
      s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' }
    )

  const SortIcon = ({ col }) => (
    <span
      style={{
        opacity: sort.col === col ? 1 : 0.3,
        marginLeft: 3,
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <svg width="7" height="4" viewBox="0 0 8 5" fill="none">
        <path d="M4 0L7.46 4.5H.54L4 0Z" fill={sort.col === col && sort.dir === 'asc' ? '#1a3a5c' : '#94a3b8'} />
      </svg>
      <svg width="7" height="4" viewBox="0 0 8 5" fill="none" style={{ transform: 'rotate(180deg)' }}>
        <path d="M4 0L7.46 4.5H.54L4 0Z" fill={sort.col === col && sort.dir === 'desc' ? '#1a3a5c' : '#94a3b8'} />
      </svg>
    </span>
  )

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-slate-900 transition-all"
          />
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th onClick={() => toggleSort('nombre')} className="px-5 py-3 cursor-pointer select-none">
                <span className="inline-flex items-center">
                  Producto <SortIcon col="nombre" />
                </span>
              </th>
              <th onClick={() => toggleSort('costoInsumo')} className="px-5 py-3 text-right cursor-pointer select-none">
                <span className="inline-flex items-center justify-end w-full">
                  Insumo <SortIcon col="costoInsumo" />
                </span>
              </th>
              <th className="px-5 py-3 text-right">M.O. Base</th>
              <th onClick={() => toggleSort('pvs')} className="px-5 py-3 text-right cursor-pointer select-none">
                <span className="inline-flex items-center justify-end w-full">
                  P. Sugerido <SortIcon col="pvs" />
                </span>
              </th>
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-xs">
                  <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>💰</div>
                  Sin registros para mostrar
                </td>
              </tr>
            )}
            {rows.map((c) => {
              const pvs = calcularPrecioSugerido(c.costoInsumo, c.hh, c.costoHH, c.tecnicos, matriz)
              const moBase = c.hh * c.costoHH * c.tecnicos
              return (
                <tr key={c.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="px-5 py-3">
                    {/* Nombre del producto principal */}
                    <p className="text-sm font-bold text-slate-800 leading-tight">{c.nombre}</p>
                    
                    {/* Fila de detalles: Marca y Medida */}
                    <div className="flex items-center gap-2 mt-1">
                      {c.marca && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {c.marca}
                        </span>
                      )}
                      
                      {/* Separador sutil */}
                      <span className="text-slate-300 text-[10px]">•</span>
                      
                      {/* Unidad de medida resaltada en azul Dr. Motors */}
                      <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                        {c.medida}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600 font-medium">
                    S/ {c.costoInsumo.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: '#eff6ff', color: '#2b6cb0' }}
                    >
                      S/ {moBase.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: '#f0fff4', color: '#276749' }}
                    >
                      S/ {pvs.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <ActionBtn onClick={() => onEdit(c)} title="Ajustar costos" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50 bg-slate-50/30">
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
            Página {page} de {totalPages} · {filtered.length} registros
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              ← Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    border: `1px solid ${n === page ? '#1a3a5c' : '#e2e8f0'}`,
                    background: n === page ? '#1a3a5c' : '#fff',
                    color: n === page ? '#fff' : '#64748b',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              )
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Componente Principal ──────────────────────────────────── */
export default function GestorCostos() {
  const { user } = useAuth()
  const [costos, setCostos] = useState([])
  const [matriz, setMatriz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalEdit, setModalEdit] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [resCostos, resMatriz] = await Promise.all([
          api.get('/costos-maestros'),
          api.get('/rentabilidad'),
        ])
        setCostos(resCostos.data)
        setMatriz(Array.isArray(resMatriz.data) ? resMatriz.data[0] : resMatriz.data)
      } catch (err) {
        console.error('Error Dr. Motors API:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleUpdate = async (id, data) => {
    const item = costos.find((c) => c.id === id)
    if (!item || !matriz) return
    const fullData = { ...item, ...data }
    const pvs = calcularPrecioSugerido(
      fullData.costoInsumo,
      fullData.hh,
      fullData.costoHH,
      fullData.tecnicos,
      matriz
    )
    try {
      const res = await api.post('/costos-maestros/save', { ...fullData, precioVenta: pvs })
      
      setCostos((prev) =>
        prev.map((c) =>
          // 🚀 LA CLAVE: Añadir la comparación de medida
          c.nombre === item.nombre && c.marca === item.marca && c.medida === item.medida
            ? { ...c, ...data, id: res.data.id }
            : c
        )
      )
    } catch (err) {
      alert('Error al guardar')
    }
  }

  if (loading || !matriz)
    return (
      <Layout tituloNavbar="Gestor de Costos">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <svg className="animate-spin" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#e2e8f0" strokeWidth="4" />
            <path fill="#1a3a5c" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '.1em',
            }}
          >
            Sincronizando costos...
          </span>
        </div>
      </Layout>
    )

  const totalGastosPct =
    matriz.alquiler + matriz.gestion + matriz.marketing + matriz.herramientas + matriz.transporte

  const totalPVS = costos.reduce(
    (acc, c) => acc + calcularPrecioSugerido(c.costoInsumo, c.hh, c.costoHH, c.tecnicos, matriz),
    0
  )
  const totalMO = costos.reduce((acc, c) => acc + c.hh * c.costoHH * c.tecnicos, 0)

  return (
    <Layout tituloNavbar="Gestor de Costos">
      <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(.96) translateY(6px) } to { opacity: 1; transform: scale(1) translateY(0) } }`}</style>

      <div className="p-6 min-h-screen bg-[#f6f8fb]">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                color: '#94a3b8',
                marginBottom: 4,
              }}
            >
              Módulo
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Estructura de Costos Maestros</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Panel de Control Centralizado
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            <div style={{ width: 6, height: 6, borderRadius: 3, background: '#1a3a5c' }} />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Gastos {totalGastosPct}% · Utilidad {matriz.utilidad}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Servicios', value: costos.length, icon: '🔧', color: '#1a3a5c' },
            {
              label: 'M.O. Total',
              value: `S/ ${totalMO.toFixed(2)}`,
              icon: '👷',
              color: '#2b6cb0',
            },
            {
              label: 'P.V.S. Prom.',
              value: costos.length ? `S/ ${(totalPVS / costos.length).toFixed(2)}` : '—',
              icon: '💰',
              color: '#276749',
            },
          ].map((s) => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {s.label}
                </span>
                <span className="text-base">{s.icon}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <DataTable data={costos} matriz={matriz} onEdit={(c) => setModalEdit(c)} />
      </div>

      {modalEdit && (
        <Modal title="Ajustar Costos" onClose={() => setModalEdit(null)}>
          <ModalAjuste
            item={modalEdit}
            matriz={matriz}
            onClose={() => setModalEdit(null)}
            onSave={handleUpdate}
          />
        </Modal>
      )}
    </Layout>
  )
}