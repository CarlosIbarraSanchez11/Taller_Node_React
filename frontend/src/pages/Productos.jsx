import React, { useState, useMemo, useEffect } from 'react'
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import Layout from '../components/layout/Layout'
import toast from 'react-hot-toast'

const CATEGORIAS = ['Aceites', 'Motor', 'Suspensión', 'Fluidos', 'Filtros', 'Frenos', 'Transmisión', 'Eléctrico', 'Carrocería', 'Otros']
const MEDIDAS = ['Unidad', 'Litros', 'Galón', 'Set']

const INIT_FORM = {
  costoMaestroId: '',
  tallerId: null,
  stockActual: 0,
  stockMin: 5,
}

/* ─── UI: COMPONENTES ─── */
function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-none pointer-events-auto animate-in fade-in zoom-in duration-200">
          <div className="px-8 py-5 border-b flex justify-between items-center">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{title}</span>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors">
               <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="px-8 py-6">{children}</div>
        </div>
      </div>
    </>
  )
}

/* ─── FORMULARIO: VINCULACIÓN + CREACIÓN RÁPIDA ─── */
function FormInventario({ form, setForm, maestros, talleres, onSubmit, isEdit, esGlobal, refreshMaestros }) {
  const [modoCrear, setModoCrear] = useState(false);
  const [filtroCat, setFiltroCat] = useState('Aceites');
  
  // Estado para la creación de identidad rápida
  const [nuevaIdentidad, setNuevaIdentidad] = useState({
    nombre: '', 
    marca: '', 
    medida: 'Unidad',
    categoria: 'ACEITES' // 🚀 Agregamos esto
  });

  const maestrosFiltrados = useMemo(() => {
    return maestros.filter(m => m.categoria.toLowerCase() === filtroCat.toLowerCase())
  }, [maestros, filtroCat])

  const maestroSeleccionado = useMemo(() => {
    return maestros.find(m => m.id === Number(form.costoMaestroId))
  }, [maestros, form.costoMaestroId])

  // Lógica para crear identidad desde aquí
  const handleCrearMaestroRapido = async () => {
    // 1. Validaciones básicas
    const nombreLimpio = nuevaIdentidad.nombre?.trim().toUpperCase();
    const marcaLimpia = (nuevaIdentidad.marca || 'GENERICO').trim().toUpperCase();

    if (!nombreLimpio) return toast.error("El nombre es obligatorio");

    // 2. 🛡️ Validación de Duplicados (Evita errores de SQL antes de enviar)
    const existe = maestros.find(m => 
      m.nombre.toUpperCase() === nombreLimpio && 
      m.marca.toUpperCase() === marcaLimpia &&
      m.medida === nuevaIdentidad.medida
    );

    if (existe) {
      toast.error("Este repuesto ya existe en el catálogo global.");
      setForm({ ...form, costoMaestroId: existe.id }); // Lo seleccionamos automáticamente
      setModoCrear(false);
      return;
    }

    const tid = toast.loading("Guardando identidad en el catálogo...");

    try {
      // 3. 🚀 Envío con los nombres de variables que el Backend espera
      const res = await api.post('/costos-maestros/save', {
        nombre: nombreLimpio,
        marca: marcaLimpia,
        medida: nuevaIdentidad.medida || 'Unidad',
        categoria: nuevaIdentidad.categoria.toUpperCase(), // 👈 Categoría seleccionada en el modal
        costoInsumo: 0,
        hh: 0,
        costoHH: 0,
        tecnicos: 1,
        precioVenta: 0
      });

      // 4. ✨ Sincronización y Limpieza
      await refreshMaestros(); 
      
      // Seteamos el ID del nuevo producto en el formulario principal
      setForm(prev => ({ ...prev, costoMaestroId: res.data.id })); 
      
      // Reseteamos el estado de creación para la próxima vez
      setNuevaIdentidad({ nombre: '', marca: '', medida: 'Unidad', categoria: 'ACEITES' });
      setModoCrear(false);
      
      toast.success("¡Identidad creada y vinculada!", { id: tid });
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la operación", { id: tid });
    }
  };

  if (modoCrear) return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <p className="text-[10px] font-black text-blue-600 uppercase">Nuevo Repuesto para el Catálogo</p>
      <div className="grid grid-cols-2 gap-3">
        {/* 🚀 CATEGORÍA (NUEVO) */}
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase">Categoría</label>
          <select className="w-full px-4 py-2 text-sm rounded-xl border bg-slate-50 font-bold" 
            value={nuevaIdentidad.categoria} 
            onChange={e => setNuevaIdentidad({...nuevaIdentidad, categoria: e.target.value})}>
            {CATEGORIAS.map(cat => (
              <option key={cat} value={cat.toUpperCase()}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase">Nombre</label>
          <input className="w-full px-4 py-2 text-sm rounded-xl border bg-slate-50 uppercase font-bold" 
            value={nuevaIdentidad.nombre} 
            onChange={e => setNuevaIdentidad({...nuevaIdentidad, nombre: e.target.value.toUpperCase()})} 
            placeholder="EJ: FILTRO ACEITE" />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase">Marca</label>
          <input className="w-full px-4 py-2 text-sm rounded-xl border bg-slate-50 uppercase font-bold" 
            value={nuevaIdentidad.marca} 
            onChange={e => setNuevaIdentidad({...nuevaIdentidad, marca: e.target.value.toUpperCase()})} 
            placeholder="EJ: TOYOTA" />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase">U. Medida</label>
          <select className="w-full px-4 py-2 text-sm rounded-xl border bg-slate-50 font-bold" 
            value={nuevaIdentidad.medida} 
            onChange={e => setNuevaIdentidad({...nuevaIdentidad, medida: e.target.value})}>
            {MEDIDAS.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
          </select>
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => setModoCrear(false)} className="flex-1 py-3 text-xs font-bold text-slate-400 uppercase">Cancelar</button>
        <button type="button" onClick={handleCrearMaestroRapido} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-blue-100">Guardar en Catálogo</button>
      </div>
    </div>
  )

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block mb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Filtrar por Categoría</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIAS.map(cat => (
              <button key={cat} type="button" onClick={() => setFiltroCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${filtroCat === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex justify-between items-end mb-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Seleccionar Repuesto</label>
            {!isEdit && (
              <button type="button" onClick={() => setModoCrear(true)} className="text-[9px] font-black text-blue-600 underline uppercase tracking-tighter">
                + ¿No existe? Crear Identidad
              </button>
            )}
          </div>
          <select className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={form.costoMaestroId} disabled={isEdit} onChange={e => setForm({...form, costoMaestroId: e.target.value})} required>
            <option value="">Seleccionar del catálogo...</option>
            {maestrosFiltrados.map(m => (
              <option key={m.id} value={m.id}>{m.nombre} - {m.marca} ({m.medida})</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block mb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Taller Destino</label>
          <select className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none"
            value={form.tallerId ?? ''} disabled={!esGlobal || isEdit} onChange={e => setForm({...form, tallerId: e.target.value ? Number(e.target.value) : null})} required>
            <option value="">Seleccionar sede...</option>
            {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerta Stock Mínimo</label>
            {maestroSeleccionado && (
              <span className="text-[9px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md uppercase">En {maestroSeleccionado.medida}</span>
            )}
          </div>
          <input className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-100 bg-slate-50 font-bold" 
            type="number" min={1} value={form.stockMin} onChange={e => setForm({...form, stockMin: Number(e.target.value)})} />
        </div>
      </div>

      <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
        {isEdit ? 'Guardar Cambios' : 'Vincular a Taller'}
      </button>
    </form>
  )
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function Productos() {
  const { user } = useAuth()
  const esGlobal = useMemo(() => user?.rol === 'Admin' || user?.rol === 'Gerente', [user])

  const [productos, setProductos] = useState([]) 
  const [maestros, setMaestros] = useState([])   
  const [talleres, setTalleres] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, item: null })
  const [form, setForm] = useState(INIT_FORM)
  
  // Estado de la pestaña activa (Taller 1, Taller 2, etc)
  const [tabSede, setTabSede] = useState(user?.tallerId ? Number(user.tallerId) : 'todos')

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [resP, resT, resM] = await Promise.all([
        api.get('/productos'),
        api.get('/talleres'),
        api.get('/costos-maestros')
      ])
      setProductos(resP.data)
      setTalleres(resT.data)
      setMaestros(resM.data)
      
      if (!esGlobal && user?.tallerId) setTabSede(Number(user.tallerId))
    } catch (err) {
      toast.error("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarDatos() }, [user])

  const handleSave = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!modal.item) {
      const duplicado = productos.find(p => 
        Number(p.costoMaestroId) === Number(form.costoMaestroId) && 
        Number(p.tallerId) === Number(form.tallerId)
      );

      if (duplicado) {
        return toast.error('Este repuesto ya está registrado en este taller.', {
          icon: '🚫',
          style: { borderRadius: '15px', background: '#1e293b', color: '#fff', fontWeight: 'bold' }
        });
      }
    }

    const toastId = toast.loading('Sincronizando...');
    try {
      if (modal.item) {
        const res = await api.put(`/productos/${modal.item.id}`, form);
        setProductos(prev => prev.map(p => p.id === modal.item.id ? res.data : p));
        toast.success("Actualizado", { id: toastId });
      } else {
        const res = await api.post('/productos', form);
        setProductos(prev => [res.data, ...prev]);
        toast.success("Vinculado", { id: toastId });
      }
      setModal({ open: false, item: null });
    } catch (err) {
      toast.error("Fallo en el servidor", { id: toastId });
    }
  };

  // 🚀 LÓGICA DE FILTRADO (AHORA FUERA DE handleSave)
  const filtrados = useMemo(() => {
    return tabSede === 'todos' 
      ? productos 
      : productos.filter(p => Number(p.tallerId) === Number(tabSede));
  }, [productos, tabSede]);

  // Estadísticas calculadas sobre los productos filtrados
  const stockBajoCount = useMemo(() => 
    filtrados.filter(p => p.stockActual <= p.stockMin).length, 
  [filtrados]);

  const totalUnidades = useMemo(() => 
    filtrados.reduce((acc, p) => acc + (p.stockActual || 0), 0), 
  [filtrados]);

  if (loading) return (
    <Layout tituloNavbar="Catálogo"> 
      <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">Sincronizando...</div> 
    </Layout>
  )

  return (
    <Layout tituloNavbar="Catálogo de Productos">
      <div className="p-6 bg-[#f8fafc] min-h-screen">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestión de Stock</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               {esGlobal ? 'Panel Centralizado' : `Logística • Sede ${talleres.find(t => t.id === Number(user?.tallerId))?.nombre}`}
            </p>
          </div>
          <button 
            onClick={() => { 
               setForm({ ...INIT_FORM, tallerId: user?.tallerId ? Number(user.tallerId) : null }); 
               setModal({ open: true, item: null }); 
            }}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
          >
            + Vincular Repuesto
          </button>
        </div>

        {/* Stats Section usando las variables corregidas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Items en Sede</p>
                <p className="text-3xl font-black text-slate-800">{filtrados.length}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Unidades</p>
                <p className="text-3xl font-black text-blue-600">{totalUnidades}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Bajo</p>
                <p className="text-3xl font-black text-red-500">{stockBajoCount}</p>
            </div>
        </div>

        {/* Tabs de Sede */}
        {esGlobal && (
          <div className="flex gap-2 mb-6 bg-white p-1 rounded-2xl border w-fit shadow-sm">
            <button onClick={() => setTabSede('todos')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tabSede === 'todos' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>TODOS</button>
            {talleres.map(t => (
              <button key={t.id} onClick={() => setTabSede(t.id)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tabSede === t.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                {t.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Tabla principal */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Marca</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Medida</th>
                {tabSede === 'todos' && <th className="px-6 py-4 text-center">Sede</th>}
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtrados.map(p => {
                const maestro = p.costoMaestro || {}
                const critico = p.stockActual <= p.stockMin
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800 uppercase leading-none">{maestro.nombre}</p>
                      <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{maestro.categoria}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{maestro.marca}</td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex flex-col items-center px-4 py-1.5 rounded-2xl ${critico ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <span className="text-sm font-black">{p.stockActual}</span>
                        {critico && <span className="text-[8px] font-black uppercase tracking-tighter">Reponer</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{maestro.medida}</td>
                    {tabSede === 'todos' && (
                      <td className="px-6 py-4 text-center">
                          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase">
                            {p.taller?.nombre || `Taller ${p.tallerId}`} 
                          </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                       <button onClick={() => { setForm(p); setModal({ open: true, item: p }) }} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                       </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtrados.length === 0 && <div className="p-20 text-center font-bold text-slate-200 uppercase tracking-widest">Sin productos registrados</div>}
        </div>
      </div>

      {modal.open && (
        <Modal title={modal.item ? "Ajustar Parámetros" : "Vincular Repuesto a Taller"} onClose={() => setModal({ open: false, item: null })}>
          <FormInventario 
            form={form} setForm={setForm} maestros={maestros} talleres={talleres} 
            onSubmit={handleSave} isEdit={!!modal.item} esGlobal={esGlobal}
            refreshMaestros={cargarDatos}
          />
        </Modal>
      )}
    </Layout>
  )
}