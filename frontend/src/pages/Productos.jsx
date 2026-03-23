import { useState, useEffect, useMemo } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { productosMock, talleresMock } from '../services/mockData'

const CATEGORIAS = ['Aceites', 'Motor', 'Suspensión', 'Fluidos', 'Filtros', 'Frenos', 'Transmisión', 'Eléctrico', 'Carrocería', 'Otros']

const UNIDADES = [
  { value: 'UNID',   label: 'Unidad (Pza/Und)' },
  { value: 'LITROS', label: 'Litros' },
  { value: 'PAR',    label: 'Par' },
  { value: 'KG',     label: 'Kilogramos' },
  { value: 'ML',     label: 'Mililitros' },
  { value: 'MT',     label: 'Metros' },
]

const CATEGORIA_STYLE = {
  'Aceites':      { bg: '#e6fffa', color: '#2c7a7b' },
  'Motor':        { bg: '#ebf8ff', color: '#2b6cb0' },
  'Suspensión':   { bg: '#faf5ff', color: '#6b46c1' },
  'Fluidos':      { bg: '#fffff0', color: '#b7791f' },
  'Filtros':      { bg: '#f0fff4', color: '#276749' },
  'Frenos':       { bg: '#fff5f5', color: '#c53030' },
  'Transmisión':  { bg: '#fffaf0', color: '#c05621' },
  'Eléctrico':    { bg: '#ebf8ff', color: '#2c5282' },
  'Carrocería':   { bg: '#faf5ff', color: '#553c9a' },
  'Otros':        { bg: '#f7fafc', color: '#718096' },
}

const INIT_FORM = {
  nombre: '', codigo: '', marca: '', categoria: CATEGORIAS[0],
  stockActual: 0, stockMin: 5, medida: 'UNID', tallerId: 1,
}

const ROWS_PER_PAGE = 8

/* ─── Helpers ────────────────────────────────────────────────────── */
function tallerNombre(id) {
  return talleresMock.find(t => t.id === id)?.nombre ?? '—'
}

/* ─── UI Primitives ──────────────────────────────────────────────── */
function Overlay({ onClose }) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-40"
      style={{ background: 'rgba(10,20,40,0.55)', backdropFilter: 'blur(2px)' }} />
  )
}

function Modal({ title, icon, onClose, children }) {
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

const baseInput = {
  border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b',
}
const focusInput = {
  border: '1px solid #1a3a5c', background: '#fff', boxShadow: '0 0 0 3px rgba(26,58,92,0.08)',
}
const inputCls = 'w-full px-3 py-2 text-sm rounded-lg outline-none transition-all'

function SInput({ type = 'text', ...props }) {
  const [f, setF] = useState(false)
  return <input type={type} {...props} className={inputCls}
    style={{ ...baseInput, ...(f ? focusInput : {}) }}
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

function ActionBtn({ icon, title, hoverBg, onClick }) {
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

/* ─── Form ───────────────────────────────────────────────────────── */
function FormProducto({ form, setForm, onSubmit, onClose, submitLabel, showTaller }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-3 mb-5">

        <Field label="Nombre del repuesto" span={2}>
          <SInput required placeholder="Ej: Filtro de Aceite Sintético"
            value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        </Field>

        <Field label="Marca">
          <SInput placeholder="Ej: Bosch"
            value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} />
        </Field>

        <Field label="Categoría">
          <SSelect value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </SSelect>
        </Field>

        <Field label="Unidad de medida">
          <SSelect value={form.medida} onChange={e => setForm({ ...form, medida: e.target.value })}>
            {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </SSelect>
        </Field>

        <Field label="Stock mínimo">
          <SInput type="number" min={0}
            value={form.stockMin} onChange={e => setForm({ ...form, stockMin: Number(e.target.value) })} />
        </Field>

        {showTaller && (
          <Field label="Taller asignado" span={2}>
            <SSelect value={form.tallerId} onChange={e => setForm({ ...form, tallerId: Number(e.target.value) })}>
              {talleresMock.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </SSelect>
          </Field>
        )}

      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4"
        style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <svg width="14" height="14" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p style={{ fontSize: 12, color: '#1d4ed8', lineHeight: 1.5 }}>
          Los precios y costos de obra se configuran en el <strong>Gestor de Costos</strong>.
        </p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2 text-sm rounded-lg font-medium transition-colors"
          style={{ border: '1px solid #e2e8f0', color: '#64748b', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          Cancelar
        </button>
        <button type="submit"
          className="flex-1 py-2 text-sm rounded-lg font-medium text-white transition-all"
          style={{ background: '#1a3a5c' }}
          onMouseEnter={e => e.currentTarget.style.background = '#243f66'}
          onMouseLeave={e => e.currentTarget.style.background = '#1a3a5c'}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
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

/* ─── Data Table ─────────────────────────────────────────────────── */
function DataTable({ data, showTaller, onEdit, onDelete }) {
  const [sort, setSort]           = useState({ col: 'nombre', dir: 'asc' })
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [catFilter, setCatFilter] = useState('Todas')
  const [medFilter, setMedFilter] = useState('Todas')

  useEffect(() => setPage(1), [search, catFilter, medFilter, sort])

  const toggleSort = col =>
    setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const filtered = useMemo(() => {
    let d = [...data]
    if (search) {
      const q = search.toLowerCase()
      d = d.filter(p => p.nombre.toLowerCase().includes(q) || (p.marca || '').toLowerCase().includes(q))
    }
    if (catFilter !== 'Todas') d = d.filter(p => p.categoria === catFilter)
    if (medFilter !== 'Todas') d = d.filter(p => p.medida === medFilter)
    d.sort((a, b) => {
      const va = a[sort.col] ?? ''
      const vb = b[sort.col] ?? ''
      return sort.dir === 'asc'
        ? String(va).localeCompare(String(vb), undefined, { numeric: true })
        : String(vb).localeCompare(String(va), undefined, { numeric: true })
    })
    return d
  }, [data, search, catFilter, medFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const rows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const TH = ({ col, label, width, right }) => (
    <th onClick={() => col && toggleSort(col)}
      className="px-4 py-3 text-left select-none"
      style={{ width, fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', cursor: col ? 'pointer' : 'default', whiteSpace: 'nowrap', textAlign: right ? 'center' : 'left' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {label}{col && <SortIcon dir={sort.col === col ? sort.dir : null} />}
      </span>
    </th>
  )

  return (
    // <Layout>
        <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #e9edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="relative flex-1" style={{ minWidth: 200 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o marca…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all"
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                onFocus={e => { e.target.style.border = '1px solid #1a3a5c'; e.target.style.boxShadow = '0 0 0 3px rgba(26,58,92,0.08)' }}
                onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'none' }} />
            </div>

            {[
            { value: catFilter, setter: setCatFilter, options: ['Todas', ...CATEGORIAS], placeholder: 'Categoría' },
            { value: medFilter, setter: setMedFilter, options: ['Todas', ...UNIDADES.map(u => u.value)], placeholder: 'Medida' },
            ].map((f, i) => (
            <select key={i} value={f.value} onChange={e => f.setter(e.target.value)}
                className="py-2 pl-3 pr-7 text-xs rounded-lg outline-none transition-all"
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
                {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
            ))}

            <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
            </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: '#f8fafc' }}>
                <TH col="nombre"     label="Cód / Producto"  width="28%" />
                <TH col="marca"      label="Marca"           width="12%" />
                <TH col="categoria"  label="Categoría"       width="13%" />
                <TH col="stockActual" label="Stock actual"   width="12%" right />
                <TH col="stockMin"   label="Stock mín."      width="10%" right />
                <TH col="medida"     label="Medida"          width="10%" />
                {showTaller && <TH label="Taller" width="10%" />}
                <TH                  label="Acciones"        width="8%"  />
                </tr>
            </thead>
            <tbody>
                {rows.map(p => {
                const cs = CATEGORIA_STYLE[p.categoria] || { bg: '#f7fafc', color: '#718096' }
                const stockBajo = p.stockActual <= p.stockMin
                return (
                    <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafcff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    {/* Nombre + código */}
                    <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{p.nombre}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                        {/* {p.codigo ? `#${p.codigo}` : 'Sin Código'} */}
                        </p>
                    </td>

                    {/* Marca */}
                    <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: '#475569' }}>{p.marca || '—'}</span>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: cs.bg, color: cs.color }}>
                        {p.categoria}
                        </span>
                    </td>

                    {/* Stock actual */}
                    <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white"
                        style={{ background: stockBajo ? '#dc2626' : '#1a3a5c' }}>
                        {p.stockActual}
                        </span>
                    </td>

                    {/* Stock mín */}
                    <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {p.stockMin}
                        </span>
                    </td>

                    {/* Medida */}
                    <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: '#64748b', letterSpacing: '0.04em' }}>
                        {p.medida}
                        </span>
                    </td>

                    {/* Taller */}
                    {showTaller && (
                        <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-md font-medium"
                            style={{ background: '#f1f5f9', color: '#64748b' }}>
                            {tallerNombre(p.tallerId)}
                        </span>
                        </td>
                    )}

                    {/* Acciones */}
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                        <ActionBtn icon="edit"   title="Editar"   hoverBg="#1a3a5c" onClick={() => onEdit(p)} />
                        <ActionBtn icon="delete" title="Eliminar" hoverBg="#dc2626" onClick={() => onDelete(p.id)} />
                        </div>
                    </td>
                    </tr>
                )
                })}

                {rows.length === 0 && (
                <tr>
                    <td colSpan={showTaller ? 8 : 7} className="py-14 text-center" style={{ color: '#94a3b8' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                    <p className="text-sm font-medium">Sin productos</p>
                    <p className="text-xs mt-1">Intenta con otros filtros de búsqueda</p>
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
                { label: '«', action: () => setPage(1),                              disabled: page === 1 },
                { label: '‹', action: () => setPage(p => Math.max(1, p - 1)),        disabled: page === 1 },
                { label: '›', action: () => setPage(p => Math.min(totalPages, p+1)), disabled: page === totalPages },
                { label: '»', action: () => setPage(totalPages),                     disabled: page === totalPages },
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
    // </Layout>
  )
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function Productos() {
  // 1. EXTRAEMOS EL CONTEXTO
  const { user } = useAuth();

  /* ─── 2. TODOS LOS HOOKS VAN AQUÍ ARRIBA (Sin condiciones) ─── */
  // Declaramos los estados primero para que React siempre vea el mismo orden
  const [productos, setProductos] = useState(productosMock);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [search, setSearch] = useState(''); // Si usas buscador, agrégalo aquí
  const [page, setPage] = useState(1);      // Si usas paginación, agrégalo aquí

  // Definimos las variables de acceso usando ?. para prevenir errores si user es null
  const esGlobal = user?.rol === 'Admin' || user?.rol === 'Gerente';
  
  const tabs = esGlobal
    ? [{ id: 'todos', nombre: 'Todos' }, ...talleresMock]
    : talleresMock.filter(t => t.id === user?.tallerId);

  // El estado de la tab activa también debe declararse aquí arriba
  const [tabActiva, setTabActiva] = useState('todos');

  /* ─── 3. RECIÉN AQUÍ EL FILTRO DE SEGURIDAD ─── */
  // Si no hay usuario, mostramos la carga, pero los Hooks de arriba ya se registraron
  if (!user) {
    return (
      <Layout tituloNavbar="Cargando...">
        <div className="p-6 text-gray-400 font-bold text-[10px] tracking-widest uppercase">
          Verificando credenciales...
        </div>
      </Layout>
    );
  }

  /* ─── 4. LÓGICA DE NEGOCIO (Después de que user existe) ─── */
  const filtrados = tabActiva === 'todos'
    ? productos
    : productos.filter(p => p.tallerId === tabActiva);

  const stockBajos = filtrados.filter(p => p.stockActual <= p.stockMin).length;
  const totalStock = filtrados.reduce((acc, p) => acc + p.stockActual, 0);

  // Handlers
  const abrirNuevo = () => {
    setForm({ 
      ...INIT_FORM, 
      tallerId: esGlobal 
        ? (tabActiva === 'todos' ? talleresMock[0]?.id : tabActiva) 
        : user.tallerId 
    });
    setModalNuevo(true);
  };

  const abrirEditar = p => {
    setForm({ ...p });
    setModalEditar(p.id);
  };

  const handleCrear = e => {
    e.preventDefault();
    const nombreLimpio = form.nombre.trim();
    const marcaLimpia = form.marca.trim();
    const medidaActual = form.medida;

    const existe = productos.some(p => 
      p.nombre.toLowerCase() === nombreLimpio.toLowerCase() && 
      (p.marca || '').toLowerCase() === marcaLimpia.toLowerCase() &&
      p.tallerId === form.tallerId &&
      p.medida === medidaActual
    );

    if (existe) {
      alert(`⚠️ Ya existe "${nombreLimpio}" (${marcaLimpia}) para este taller.`);
      return; 
    }

    const nuevo = { 
      ...form, 
      id: Date.now(), 
      nombre: nombreLimpio, 
      marca: marcaLimpia,
      codigo: form.codigo || `${marcaLimpia.slice(0,3)}-${medidaActual}-${Math.floor(Math.random() * 100)}`.toUpperCase()
    };

    setProductos(prev => [...prev, nuevo]);
    setModalNuevo(false);
    setForm(INIT_FORM);
  };

  const handleEditar = e => {
    e.preventDefault();
    setProductos(prev => prev.map(p => p.id === modalEditar ? { ...p, ...form } : p));
    setModalEditar(null);
  };

  const handleEliminar = () => {
    setProductos(prev => prev.filter(p => p.id !== modalEliminar));
    setModalEliminar(null);
  };

  return (
    <Layout tituloNavbar="Catálogo de Productos">
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(6px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
      `}</style>

      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1a3a5c' }}>Catálogo de Productos</h1>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              {/* 6. CORRECCIÓN FINAL: Usamos 'user' aquí también */}
              {esGlobal ? 'Panel de Control Centralizado' : `Inventario: ${talleresMock.find(t => t.id === user.tallerId)?.nombre}`}
            </p>
          </div>
          <button onClick={abrirNuevo}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm"
            style={{ background: '#1a3a5c' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear Nuevo Producto
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'En Inventario',   value: filtrados.length, icon: '📦', accent: '#1a3a5c' },
            { label: 'Unidades Stock', value: totalStock,        icon: '🗂',  accent: '#2b6cb0' },
            { label: 'Stock Crítico',  value: stockBajos,        icon: '⚠️',  accent: stockBajos > 0 ? '#dc2626' : '#94a3b8' },
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

        {/* Tabs: Solo se muestran si el usuario tiene acceso a más de un taller */}
        {tabs.length > 1 && (
          <div className="flex items-center gap-1 mb-4">
            {tabs.map(tab => {
              const active = tabActiva === tab.id
              return (
                <button key={tab.id} onClick={() => setTabActiva(tab.id)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  style={{
                    background: active ? '#1a3a5c' : '#fff',
                    color: active ? '#fff' : '#64748b',
                    border: active ? '1px solid #1a3a5c' : '1px solid #e2e8f0',
                  }}>
                  {tab.nombre}
                </button>
              )
            })}
          </div>
        )}

        <DataTable
          data={filtrados}
          showTaller={tabActiva === 'todos'}
          onEdit={abrirEditar}
          onDelete={setModalEliminar}
        />
      </div>

      {/* Modales */}
      {modalNuevo && (
        <Modal title="Nuevo Producto en Catálogo" onClose={() => setModalNuevo(false)}>
          <FormProducto form={form} setForm={setForm}
            onSubmit={handleCrear} onClose={() => setModalNuevo(false)}
            submitLabel="Guardar Ficha Técnica"
            showTaller={esGlobal} />
        </Modal>
      )}

      {modalEditar && (
        <Modal title="Editar Producto" onClose={() => setModalEditar(null)}>
          <FormProducto form={form} setForm={setForm}
            onSubmit={handleEditar} onClose={() => setModalEditar(null)}
            submitLabel="Guardar cambios"
            showTaller={esGlobal} />
        </Modal>
      )}

      {modalEliminar && (
        <Modal title="Eliminar producto" onClose={() => setModalEliminar(null)}>
          <div className="flex items-start gap-3 mb-5 p-3.5 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #fee2e2' }}>
            <p className="text-sm text-red-800">Esta acción es permanente. El producto será eliminado del catálogo.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModalEliminar(null)} className="flex-1 py-2 text-sm border rounded-lg">Cancelar</button>
            <button onClick={handleEliminar} className="flex-1 py-2 text-sm text-white rounded-lg bg-red-600">Sí, eliminar</button>
          </div>
        </Modal>
      )}
    </Layout>
  )
}