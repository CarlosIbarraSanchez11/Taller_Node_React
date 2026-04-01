import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Layout from '../components/layout/Layout';

const RecepcionVehiculo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idCita = searchParams.get('id_cita');
  const idTecnico = searchParams.get('id_tecnico');

  const [datosCita, setDatosCita] = useState(null);
  const [mecanico, setMecanico] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. ESTADO DE FORMULARIO
  const [formValues, setFormValues] = useState({
    kilometraje: '',
    combustible: '1/2',
    aceiteActual: '',
    aceiteSugerido: '',
    observaciones: ''
  });

  // 2. ESTADO DE FOTOS CON PREVIEW
  const [fotos, setFotos] = useState({
    frontal: { file: null, preview: null },
    detalle: { file: null, preview: null },
    trasera1: { file: null, preview: null },
    trasera2: { file: null, preview: null },
    tablero1: { file: null, preview: null },
    tablero2: { file: null, preview: null },
  });

  // 3. ESTADO DE INVENTARIO
  const [inventario, setInventario] = useState([
    { id: 1, nombre: 'Tarjeta de Propiedad y SOAT', estado: true },
    { id: 2, nombre: 'Gata y Llave de Ruedas', estado: true },
    { id: 3, nombre: 'Llave de Repuesto', estado: true },
    { id: 4, nombre: 'Espejos y Antenas', estado: true },
    { id: 5, nombre: 'Radio / Pantalla Táctil', estado: true },
    { id: 6, nombre: 'Vasos / Tapas de Ruedas', estado: true },
    { id: 7, nombre: 'Extintor y Triángulos', estado: true },
    { id: 8, nombre: 'Encendedor / Cenicero', estado: true },
  ]);

  // Cargar información inicial
  useEffect(() => {
    const cargarInfo = async () => {
      try {
        setLoading(true);
        const [resCita, resTec] = await Promise.all([
          axios.get(`http://localhost:4000/api/citas/${idCita}`),
          axios.get(`http://localhost:4000/api/usuarios/${idTecnico}`)
        ]);
        setDatosCita(resCita.data);
        setMecanico(resTec.data);
      } catch (err) {
        toast.error("Error al cargar datos del servidor");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (idCita && idTecnico) cargarInfo();
  }, [idCita, idTecnico]);

  const toggleInventario = (id, valor) => {
    setInventario(prev => prev.map(item => 
      item.id === id ? { ...item, estado: valor } : item
    ));
  };

  const handleFileChange = (e, posicion) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("La imagen es muy pesada (Máx 2MB)");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFotos(prev => ({
        ...prev,
        [posicion]: { file: file, preview: event.target.result }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formValues.kilometraje) return toast.error("El kilometraje es obligatorio");

    const t = toast.loading("Abriendo orden de trabajo...");

    try {
      const formData = new FormData();
      formData.append('citaId', idCita);
      formData.append('mecanicoId', idTecnico);
      formData.append('kilometraje', formValues.kilometraje);
      formData.append('nivelCombustible', formValues.combustible);
      formData.append('gradoAceite', formValues.aceiteActual);
      formData.append('marcaAceiteSugerida', formValues.aceiteSugerido);
      formData.append('inventario', JSON.stringify(inventario));
      formData.append('observaciones', formValues.observaciones);

      // Adjuntar archivos reales al FormData
      Object.keys(fotos).forEach(key => {
        if (fotos[key].file) {
          formData.append('fotos', fotos[key].file);
        }
      });

      await axios.post('http://localhost:4000/api/ordenes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.dismiss(t);
      toast.success("¡Orden abierta! El vehículo ingresó a taller.");
      navigate('/citas');
    } catch (err) {
      toast.dismiss(t);
      toast.error("Error al guardar la recepción");
      console.error(err);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-black text-blue-900 uppercase tracking-widest animate-pulse">Sincronizando Dr. Motors...</p>
      </div>
    </div>
  );

  return (
    <Layout tituloNavbar="Recepción Técnica">
      <div className="max-w-7xl mx-auto px-4 pb-20">
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 mt-4">
          
          {/* ─── COLUMNA IZQUIERDA (DATOS) ─── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. MECÁNICO RESPONSABLE */}
            <div className="bg-[#e0f0ff] border border-blue-200 p-3 px-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xl font-bold">🛠️</span>
                <p className="text-[11px] font-black text-blue-600 uppercase tracking-tight mr-2">Mecánico Responsable</p>
                <div className="bg-white px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100 shadow-sm">
                   <span className="text-green-500 text-xs">👤</span>
                   <span className="text-xs font-bold text-gray-700">{mecanico?.nombre || 'Cargando...'}</span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">({mecanico?.rol || 'Técnico'})</span>
                </div>
              </div>
              <span className="text-blue-300 opacity-50">🔒</span>
            </div>

            {/* 2. CARD PRINCIPAL DE RECEPCIÓN */}
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-blue-600 text-2xl">📝</span>
                <h2 className="text-xl font-black text-[#1a3a5c]">Hoja de Recepción Técnica</h2>
              </div>

              {/* BANNER VEHÍCULO DINÁMICO */}
              <div className="bg-[#e1f0ff] p-5 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center border border-blue-50 gap-4">
                 <div className="text-center md:text-left">
                    <h3 className="text-[#007bff] font-black text-lg uppercase tracking-tight leading-none mb-2">
                        {datosCita?.vehiculo?.marca} {datosCita?.vehiculo?.modelo}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                       <span className="bg-[#0056b3] text-white px-3 py-1 rounded-md text-[12px] font-black tracking-widest shadow-sm">
                          {datosCita?.vehiculoPlaca}
                       </span>
                       <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wide">
                          COLOR: {datosCita?.vehiculo?.color || '—'}
                       </span>
                       <span className="text-[11px] text-blue-500 font-black uppercase tracking-wide bg-blue-100/50 px-2 py-0.5 rounded-lg">
                          ⛽ {datosCita?.vehiculo?.combustible || 'No definido'}
                       </span>
                    </div>
                 </div>
                 <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-blue-200 pt-4 md:pt-0 md:pl-6">
                    <span className="text-[10px] text-blue-400 font-black uppercase block leading-none mb-1">Cliente:</span>
                    <span className="text-lg font-black text-[#1a3a5c] italic uppercase tracking-tighter">
                        {datosCita?.vehiculo?.cliente?.apellidos} {datosCita?.vehiculo?.cliente?.nombre}
                    </span>
                 </div>
              </div>

              {/* INPUTS TÉCNICOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
                <InputGroup 
                  label="Kilometraje Actual" icon="🔘" placeholder="00000" 
                  value={formValues.kilometraje} 
                  onChange={(val) => setFormValues({...formValues, kilometraje: val})} 
                />
                <SelectGroup 
                  label="Nivel de Combustible" icon="⛽" 
                  value={formValues.combustible} 
                  onChange={(val) => setFormValues({...formValues, combustible: val})}
                />
                <InputGroup 
                  label="Grado de Aceite" icon="🛢️" placeholder="EJ: 10W-30 / 5W-40" 
                  value={formValues.aceiteActual} 
                  onChange={(val) => setFormValues({...formValues, aceiteActual: val})}
                />
                <InputGroup 
                  label="Marca de Aceite Sugerida" icon="🧪" placeholder="EJ: MOBIL / CASTROL" 
                  value={formValues.aceiteSugerido} 
                  onChange={(val) => setFormValues({...formValues, aceiteSugerido: val})}
                />
              </div>

              {/* SECCIÓN INVENTARIO */}
              <div className="mt-4">
                <h4 className="text-sm font-black text-[#1a3a5c] mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Inventario de Ingreso
                </h4>
                <div className="w-full">
                  <div className="grid grid-cols-12 text-[10px] font-black text-gray-300 uppercase mb-4 px-4 tracking-widest">
                    <div className="col-span-8">Elemento</div>
                    <div className="col-span-4 text-center">Estado</div>
                  </div>
                  <div className="space-y-1">
                    {inventario.map(item => (
                      <div key={item.id} className="grid grid-cols-12 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="col-span-8 flex items-center gap-3">
                           <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px]">✔️</div>
                           <span className="text-sm font-bold text-gray-600">{item.nombre}</span>
                        </div>
                        <div className="col-span-4 flex justify-center">
                           <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                              <button 
                                onClick={() => toggleInventario(item.id, true)}
                                className={`px-6 py-1.5 text-xs font-black transition-all ${item.estado ? 'bg-[#10b981] text-white shadow-inner' : 'text-gray-300 hover:bg-gray-50'}`}
                              >✓</button>
                              <button 
                                onClick={() => toggleInventario(item.id, false)}
                                className={`px-6 py-1.5 text-xs font-black transition-all border-l ${!item.estado ? 'bg-[#ef4444] text-white shadow-inner' : 'text-gray-300 hover:bg-gray-50'}`}
                              >✕</button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* OBSERVACIONES */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
               <h4 className="text-xs font-black text-[#1a3a5c] uppercase mb-4 tracking-widest">Observaciones, Daños o Pertenencias</h4>
               <textarea 
                 value={formValues.observaciones}
                 onChange={(e) => setFormValues({...formValues, observaciones: e.target.value})}
                 placeholder="Escriba aquí daños visuales o pertenencias de valor dejadas en el vehículo..." 
                 className="w-full h-32 p-5 bg-[#f8fafc] rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm italic font-medium text-gray-600" 
               />
            </div>
          </div>

          {/* ─── COLUMNA DERECHA (FOTOS) ─── */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-50 sticky top-6">
                <h3 className="font-black text-[#1a3a5c] mb-8 flex items-center gap-2 text-sm uppercase">
                  <span className="text-blue-500">📸</span> Fotos del Ingreso
                </h3>
                
                <PhotoSection 
                  title="Vistas Frontales / Placa" 
                  label1="Principal" pos1="frontal"
                  label2="Detalle" pos2="detalle"
                  fotos={fotos} onFileChange={handleFileChange}
                />
                
                <PhotoSection 
                  title="Vista Posterior" 
                  label1="Foto 1" pos1="trasera1"
                  label2="Foto 2" pos2="trasera2"
                  fotos={fotos} onFileChange={handleFileChange}
                />
                
                <PhotoSection 
                  title="Tablero (KM / Luces)" 
                  label1="Kilometraje" pos1="tablero1"
                  label2="Testigos" pos2="tablero2"
                  fotos={fotos} onFileChange={handleFileChange}
                />

                <div className="mt-10 space-y-4">
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 group"
                    >
                        ABRIR ORDEN DE TRABAJO
                        <span className="group-hover:translate-x-1 transition-transform text-lg">→</span>
                    </button>
                    <button 
                        onClick={() => navigate('/citas')} 
                        className="w-full text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors tracking-tighter uppercase"
                    >
                        Cancelar y volver
                    </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

// --- COMPONENTES AUXILIARES ---

const InputGroup = ({ label, icon, placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</label>
    <div className="relative">
       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">{icon}</span>
       <input 
         type="text" 
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder} 
         className="w-full pl-10 pr-4 py-3.5 bg-[#f8fafc] rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all" 
       />
    </div>
  </div>
);

const SelectGroup = ({ label, icon, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</label>
    <div className="relative">
       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">{icon}</span>
       <select 
         value={value}
         onChange={(e) => onChange(e.target.value)}
         className="w-full pl-10 pr-4 py-3.5 bg-[#f8fafc] rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 appearance-none transition-all cursor-pointer"
       >
          <option value="E">Vacío (E)</option>
          <option value="1/4">1/4</option>
          <option value="1/2">1/2</option>
          <option value="3/4">3/4</option>
          <option value="F">Lleno (F)</option>
       </select>
       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">▼</span>
    </div>
  </div>
);

const PhotoSection = ({ title, label1, pos1, label2, pos2, fotos, onFileChange }) => (
    <div className="mb-6">
        <p className="text-[9px] font-black text-blue-500 uppercase mb-3 text-center tracking-[0.2em]">{title}</p>
        <div className="grid grid-cols-2 gap-3">
            <PhotoInput label={label1} pos={pos1} data={fotos[pos1]} onFileChange={onFileChange} />
            <PhotoInput label={label2} pos={pos2} data={fotos[pos2]} onFileChange={onFileChange} />
        </div>
    </div>
);

const PhotoInput = ({ label, pos, data, onFileChange }) => (
    <label className="relative aspect-[4/3] bg-white border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-200 transition-all group shadow-sm hover:shadow-md">
        {data.preview ? (
            <img src={data.preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
            <>
                <span className="text-xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">📷</span>
                <span className="text-[8px] font-black text-gray-300 uppercase mt-1 tracking-tighter">{label}</span>
            </>
        )}
        <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => onFileChange(e, pos)} 
        />
    </label>
);

export default RecepcionVehiculo;