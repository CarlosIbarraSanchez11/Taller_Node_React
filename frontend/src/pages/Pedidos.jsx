import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { talleresMock, productosMock, pedidosMock } from '../services/mockData'

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

/* ─── EstadoPedidoBadge (lógica original) ────────────────────────── */
function EstadoPedidoBadge({ estado }) {
  const config = {
    'SOLICITADO':             { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe' },
    'SOLICITADO POR CLIENTE': { bg: '#fff7ed', color: '#c2410c', dot: '#f97316', border: '#fed7aa' },
    'SOLICITADO POR TALLER':  { bg: '#faf5ff', color: '#6d28d9', dot: '#8b5cf6', border: '#e9d5ff' },
    'ENTREGADO':              { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', border: '#bbf7d0' },
  }
  const c = config[estado] || config['SOLICITADO']
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {estado}
    </span>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function Pedidos() {
  const { user } = useAuth()

  /* ─── 1. HOOKS (Orden Estricto) ─── */
  const [pedidos, setPedidos]           = useState(pedidosMock)
  const [filtroTab, setFiltroTab]       = useState('PENDIENTES')
  const [search, setSearch]             = useState('')
  const [sort, setSort]                 = useState({ col: 'fecha', dir: 'desc' })

  const userRol  = user?.rol?.toUpperCase()
  const esGlobal = userRol === 'ADMIN' || userRol === 'GERENTE'

  const tabsSedes = useMemo(() => {
    if (esGlobal) return [{ id: 'todos', nombre: 'Todos' }, ...talleresMock]
    return talleresMock.filter(t => t.id === user?.tallerId)
  }, [esGlobal, user?.tallerId])

  const [tabSedeActiva, setTabSedeActiva] = useState('todos')

  useEffect(() => { setSearch('') }, [tabSedeActiva])

  /* ─── 2. FILTRADO INTELIGENTE (lógica original) ─── */
  const filtrados = useMemo(() => {
    let d = pedidos.filter(p => {
      const matchSede   = tabSedeActiva === 'todos' || String(p.tallerId) === String(tabSedeActiva)
      const matchEstado = filtroTab === 'PENDIENTES' ? p.estado !== 'ENTREGADO' : p.estado === 'ENTREGADO'
      const q           = search.toLowerCase()
      const matchSearch = p.referencia.toLowerCase().includes(q) || p.repuesto.toLowerCase().includes(q)
      return matchSede && matchEstado && matchSearch
    })
    d.sort((a, b) => sort.dir === 'asc'
      ? String(a[sort.col] ?? '').localeCompare(String(b[sort.col] ?? ''))
      : String(b[sort.col] ?? '').localeCompare(String(a[sort.col] ?? ''))
    )
    return d
  }, [pedidos, tabSedeActiva, filtroTab, search, sort])

  if (!user) return null

  const toggleSort = col => setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const handleEntregar = id => {
    if (window.confirm('¿Confirmar despacho físico de repuesto?')) {
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: 'ENTREGADO' } : p))
    }
  }

  /* Stats */
  const pendientesCount = pedidos.filter(x =>
    x.estado !== 'ENTREGADO' && (tabSedeActiva === 'todos' || String(x.tallerId) === String(tabSedeActiva))
  ).length
  const entregadosCount = pedidos.filter(x =>
    x.estado === 'ENTREGADO' && (tabSedeActiva === 'todos' || String(x.tallerId) === String(tabSedeActiva))
  ).length
  const sinStockCount = filtrados.filter(p => p.stockSede < p.cantidad).length

  const TH = ({ col, label, width, center }) => (
    <th onClick={() => col && toggleSort(col)}
      className="px-4 py-3 select-none"
      style={{ width, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap', textAlign: center ? 'center' : 'left' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {label}{col && <SortIcon dir={sort.col === col ? sort.dir : null} />}
      </span>
    </th>
  )

  return (
    <Layout tituloNavbar="Gestión de Almacén y Pedidos">
      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Gestión de Almacén</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Despacho de repuestos para servicios y ventas</p>
          </div>
          {/* Buscador en el header */}
          <div className="relative" style={{ width: 280 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por placa o producto…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl outline-none transition-all"
              style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
              onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }} />
          </div>
        </div>

        {/* Stat cards — mismo estilo que Productos */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Pendientes',   value: pendientesCount, icon: '⏳', accent: pendientesCount > 0 ? '#b45309' : '#94a3b8' },
            { label: 'Entregados',   value: entregadosCount, icon: '✅', accent: '#15803d' },
            { label: 'Sin stock',    value: sinStockCount,   icon: '⚠️', accent: sinStockCount  > 0 ? '#dc2626' : '#94a3b8' },
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

        {/* Tabs de sedes */}
        {tabsSedes.length > 1 && (
          <div className="flex items-center gap-1 mb-4">
            {tabsSedes.map(t => {
              const active = String(tabSedeActiva) === String(t.id)
              return (
                <button key={t.id} onClick={() => setTabSedeActiva(t.id)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  style={{ background: active ? '#1a3a5c' : '#fff', color: active ? '#fff' : '#64748b', border: active ? '1px solid #1a3a5c' : '1px solid #e2e8f0', boxShadow: active ? '0 2px 8px rgba(26,58,92,0.18)' : 'none' }}>
                  {t.nombre}
                </button>
              )
            })}
          </div>
        )}

        {/* Tabs proceso — Pendientes / Entregados */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl w-fit"
          style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          {[
            { key: 'PENDIENTES', label: `Solicitudes Pendientes (${pendientesCount})` },
            { key: 'ENTREGADOS', label: 'Historial Entregados' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFiltroTab(tab.key)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: filtroTab === tab.key ? '#1a3a5c' : 'transparent',
                color:      filtroTab === tab.key ? '#fff' : '#64748b',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <TH col="referencia" label="Placa / Fecha"          width="16%" />
                  <TH col="repuesto"   label="Repuesto / Solicitante" width="24%" />
                  <TH col="cantidad"   label="Cant."                  width="8%"  center />
                  <TH                  label="Sede / Stock"           width="14%" center />
                  <TH col="estado"     label="Estado"                 width="18%" center />
                  <TH                  label="Acción"                 width="10%" center />
                </tr>
              </thead>
              <tbody>
                {filtrados.length > 0 ? filtrados.map(p => {
                  const tallerNom = talleresMock.find(t => t.id === p.tallerId)?.nombre || '—'
                  const sinStock  = p.stockSede < p.cantidad
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafcff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Placa + fecha */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold" style={{ color: '#1a3a5c' }}>{p.referencia}</p>
                        <p className="text-xs mt-0.5 font-semibold" style={{ color: '#94a3b8' }}>
                          {new Date(p.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </td>

                      {/* Repuesto + solicitante */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{p.repuesto}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{p.solicitante}</p>
                      </td>

                      {/* Cantidad */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-sm font-bold"
                          style={{ background: '#f1f5f9', color: '#1a3a5c' }}>
                          {p.cantidad}
                        </span>
                      </td>

                      {/* Sede + stock */}
                      <td className="px-4 py-3 text-center">
                        <p className="text-xs font-bold mb-0.5" style={{ color: '#2a5f94' }}>{tallerNom}</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={sinStock
                            ? { background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca' }
                            : { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sinStock ? '#dc2626' : '#22c55e', flexShrink: 0 }} />
                          {p.stockSede} unidades
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        <EstadoPedidoBadge estado={p.estado} />
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {p.estado !== 'ENTREGADO' && (
                            <button onClick={() => handleEntregar(p.id)}
                              disabled={sinStock}
                              title={sinStock ? 'Sin stock suficiente' : 'Confirmar entrega'}
                              className="flex items-center justify-center rounded-lg transition-all"
                              style={{
                                width: 28, height: 28,
                                background: sinStock ? '#f1f5f9' : 'transparent',
                                color: sinStock ? '#cbd5e1' : '#94a3b8',
                                border: `1px solid ${sinStock ? '#e2e8f0' : '#e2e8f0'}`,
                                cursor: sinStock ? 'not-allowed' : 'pointer',
                              }}
                              onMouseEnter={e => { if (!sinStock) { e.currentTarget.style.background = '#15803d'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#15803d' } }}
                              onMouseLeave={e => { if (!sinStock) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0' } }}>
                              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}
                          <button title="Ver detalle"
                            className="flex items-center justify-center rounded-lg transition-all"
                            style={{ width: 28, height: 28, color: '#94a3b8', border: '1px solid #e2e8f0', background: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#1a3a5c'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a3a5c' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} className="py-14 text-center" style={{ color: '#94a3b8' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                      <p className="text-sm font-medium">No hay solicitudes para mostrar</p>
                      <p className="text-xs mt-1">Intenta con otros filtros o cambia de sede</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  )
}