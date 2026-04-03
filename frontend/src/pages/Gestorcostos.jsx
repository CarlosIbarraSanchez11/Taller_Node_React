import React, { useState, useMemo, useEffect } from 'react'
import api from "../api/axios"
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ROWS_PER_PAGE = 8

/* ─── Fórmulas de Rentabilidad ─── */
function calcularPrecioSugerido(insumo, hh, costoHH, tecnicos, matriz) {
  if (!matriz) return 0
  const subMO = Number(hh) * Number(costoHH) * Number(tecnicos)
  const subTotal = Number(insumo) + subMO
  const totalGastosPct = (matriz.alquiler + matriz.gestion + matriz.marketing + matriz.herramientas + matriz.transporte) / 100
  const montoGastos = subTotal * totalGastosPct
  const montoUtil = (subTotal + montoGastos) * (matriz.utilidad / 100)
  return subTotal + montoGastos + montoUtil
}

/* ─── UI: Componentes Atómicos ─── */
function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200 pointer-events-auto animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{title}</span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  )
}

const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all"

/* ─── Modal: Formulario Maestro ─── */
function ModalProducto({ item, matriz, costosExistentes, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: item?.id || null, 
    categoria: item?.categoria || '',
    nombre: item?.nombre || '',
    marca: item?.marca || '',
    medida: item?.medida || 'Unidad',
    costoInsumo: item?.costoInsumo || 0,
    hh: item?.hh || 0,
    costoHH: item?.costoHH || 0,
    tecnicos: item?.tecnicos || 1,
  })

  const yaExiste = useMemo(() => {
    if (item) return false 
    return costosExistentes.some(c => 
      c.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim() && 
      c.marca.toLowerCase().trim() === formData.marca.toLowerCase().trim() &&
      c.medida === formData.medida
    )
  }, [formData.nombre, formData.marca, formData.medida, costosExistentes, item])

  // 🚀 ¡REVISA QUE ESTA LÍNEA ESTÉ AQUÍ! (Línea 150 aprox)
  const pvs = calcularPrecioSugerido(formData.costoInsumo, formData.hh, formData.costoHH, formData.tecnicos, matriz)

  const handleSubmit = (e) => {
    e.preventDefault()
    const dataLimpia = {
      ...formData,
      nombre: formData.nombre.trim().toUpperCase(),
      marca: formData.marca.trim().toUpperCase(),
      categoria: formData.categoria.trim().toUpperCase(),
    }
    onSave(dataLimpia, !!item?.id) 
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alertas */}
      {yaExiste && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Producto Registrado</p>
            <p className="text-[11px] text-amber-700 font-medium">Se actualizarán los costos del registro existente.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-1">
          <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</label>
          <select className={inputCls} value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} required>
            <option value="">Seleccionar...</option>
            <option value="ACEITES">ACEITES</option>
            <option value="FILTROS">FILTROS</option>
            <option value="MOTOR">MOTOR</option>
            <option value="FRENOS">FRENOS</option>
            <option value="SUSPENSIÓN">SUSPENSIÓN</option>
            <option value="BATERÍAS">BATERÍAS</option>
            <option value="ILUMINACIÓN">ILUMINACIÓN</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">U. Medida</label>
          <select className={inputCls} value={formData.medida} onChange={e => setFormData({...formData, medida: e.target.value})}>
            <option value="Unidad">UNIDAD (PZA)</option>
            <option value="Litros">LITROS</option>
            <option value="Galón">GALÓN</option>
            <option value="Set">SET/JUEGO</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre del Repuesto</label>
          <input 
            className={inputCls} 
            value={formData.nombre} 
            onChange={e => setFormData({...formData, nombre: e.target.value.toUpperCase()})} 
            required 
            placeholder="EJ: ACEITE 10W30 SINTÉTICO" 
          />
        </div>
        <div className="col-span-1">
          <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marca</label>
          <input 
            className={inputCls} 
            value={formData.marca} 
            onChange={e => setFormData({...formData, marca: e.target.value.toUpperCase()})} 
            placeholder="EJ: MOBIL" 
          />
        </div>
        <div className="col-span-1">
          <label className="block mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Costo Insumo (S/)</label>
          <input className={inputCls} type="number" step="0.01" value={formData.costoInsumo} onChange={e => setFormData({...formData, costoInsumo: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div>
           <label className="block mb-1 text-[9px] font-bold text-slate-400 uppercase">Horas (HH)</label>
           <input className={inputCls} type="number" step="0.1" value={formData.hh} onChange={e => setFormData({...formData, hh: e.target.value})} />
        </div>
        <div>
           <label className="block mb-1 text-[9px] font-bold text-slate-400 uppercase">Costo HH</label>
           <input className={inputCls} type="number" step="0.1" value={formData.costoHH} onChange={e => setFormData({...formData, costoHH: e.target.value})} />
        </div>
        <div>
           <label className="block mb-1 text-[9px] font-bold text-slate-400 uppercase">Técnicos</label>
           <input className={inputCls} type="number" value={formData.tecnicos} onChange={e => setFormData({...formData, tecnicos: e.target.value})} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 text-white flex justify-between items-center shadow-xl shadow-slate-200">
        <div>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Precio Sugerido</p>
          <p className="text-2xl font-black text-blue-400">S/ {pvs.toFixed(2)}</p>
        </div>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-500 transition-all">
          {yaExiste ? 'Actualizar Costos' : 'Guardar Producto'}
        </button>
      </div>
    </form>
  )
}

/* ─── Componente Principal ─── */
export default function GestorCostos() {
  const [costos, setCostos] = useState([])
  const [matriz, setMatriz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, item: null })
  const [search, setSearch] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [resCostos, resMatriz] = await Promise.all([
        api.get('/costos-maestros'),
        api.get('/rentabilidad')
      ])
      setCostos(resCostos.data)
      setMatriz(Array.isArray(resMatriz.data) ? resMatriz.data[0] : resMatriz.data)
    } catch (err) {
      toast.error("Error al sincronizar con Dr. Motors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async (dataLimpia, esEdicionDirecta) => {
    const toastId = toast.loading('Sincronizando con Dr. Motors...');
    try {
      // ✅ Forzar tipos numéricos
      const payload = {
        ...dataLimpia,
        costoInsumo: Number(dataLimpia.costoInsumo),
        hh:          Number(dataLimpia.hh),
        costoHH:     Number(dataLimpia.costoHH),
        tecnicos:    Number(dataLimpia.tecnicos),
      }
      const pvs = calcularPrecioSugerido(
        payload.costoInsumo, payload.hh, payload.costoHH, payload.tecnicos, matriz
      )
      await api.post('/costos-maestros/save', { ...payload, precioVenta: pvs })
      
      toast.dismiss(toastId);
      
      if (esEdicionDirecta) {
        toast('♻️ Registro Actualizado', { 
          icon: '🔄', 
          style: { borderRadius: '10px', background: '#334155', color: '#fff' } 
        });
      } else {
        toast.success('🚀 Producto creado correctamente');
      }

      loadData()
      setModal({ open: false, item: null })
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Error al guardar en la base de datos');
    }
  }

  const filtered = useMemo(() => {
    return costos.filter(c => 
      c.nombre.toLowerCase().includes(search.toLowerCase()) || 
      c.categoria.toLowerCase().includes(search.toLowerCase()) ||
      c.marca.toLowerCase().includes(search.toLowerCase())
    )
  }, [costos, search])

  if (loading || !matriz) return (
    <Layout tituloNavbar="Gestor de Costos">
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dr. Motors · Sincronizando</p>
      </div>
    </Layout>
  )

  return (
    <Layout tituloNavbar="Gestor de Costos">
      <div className="p-6 bg-[#f8fafc] min-h-screen">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Estructura de Costos</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión Central de Identidad y Rentabilidad</p>
          </div>
          <button 
            onClick={() => setModal({ open: true, item: null })}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Nuevo Producto
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Totales</p>
            <p className="text-3xl font-black text-slate-800">{costos.length}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock en Red</p>
            <p className="text-3xl font-black text-blue-600">{costos.reduce((acc, c) => acc + c.stockTotal, 0)}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm md:col-span-2 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Matriz Activa</p>
              <p className="text-xs font-bold text-slate-600">Gastos Operativos: {(matriz.alquiler + matriz.gestion + matriz.marketing + matriz.herramientas + matriz.transporte)}%</p>
              <p className="text-xs font-bold text-blue-600">Margen de Utilidad: {matriz.utilidad}%</p>
            </div>
            <div className="h-10 w-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
          </div>
        </div>

        {/* Tabla Centralizada */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-slate-50/30">
            <div className="relative max-w-md">
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
               <input 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-4 ring-slate-900/5 focus:border-slate-900 transition-all"
                placeholder="Buscar por repuesto, marca o categoría..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50/50">
                  <th className="px-6 py-4">Identidad</th>
                  <th className="px-6 py-4 text-center">Categoría</th>
                  <th className="px-6 py-4 text-center">Stock Red</th>
                  <th className="px-6 py-4 text-right">Costo Insumo</th>
                  <th className="px-6 py-4 text-right">P. Sugerido</th>
                  <th className="px-6 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      {/* 🚀 Usamos clase 'uppercase' de Tailwind para la vista de tabla */}
                      <p className="text-sm font-black text-slate-800 uppercase">{c.nombre}</p>
                      <div className="flex gap-2 mt-0.5">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">{c.marca}</span>
                         <span className="text-[9px] font-bold text-blue-500 uppercase">/ {c.medida}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                        {c.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-black ${c.stockTotal > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                        {c.stockTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-500">S/ {c.costoInsumo.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-black shadow-sm shadow-green-100">
                        S/ {calcularPrecioSugerido(c.costoInsumo, c.hh, c.costoHH, c.tecnicos, matriz).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setModal({ open: true, item: c })}
                        className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all shadow-none hover:shadow-sm"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal.open && (
        <Modal 
          title={modal.item ? "Editar Configuración Maestro" : "Definir Identidad de Repuesto"} 
          onClose={() => setModal({ open: false, item: null })}
        >
          <ModalProducto 
            item={modal.item} 
            matriz={matriz} 
            costosExistentes={costos}
            onClose={() => setModal({ open: false, item: null })}
            onSave={handleSave}
          />
        </Modal>
      )}
    </Layout>
  )
}