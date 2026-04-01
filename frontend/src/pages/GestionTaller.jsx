import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';

const GestionTaller = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idCita = searchParams.get('id_cita');
  const [datosCita, setDatosCita] = useState(null);
  const [loading, setLoading] = useState(true);

  // Categorías de Inspección (Hardcoded por ahora)
  const categorias = ["DIRECCION", "FRENOS", "MOTOR", "SUSPENSION DELANTERA", "SUSPENSION POSTERIOR", "TRANSMISION"];

  useEffect(() => {
    const cargarCita = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/citas/${idCita}`);
        setDatosCita(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (idCita) cargarCita();
  }, [idCita]);

  if (loading) return <div className="p-20 text-center font-black text-blue-500 animate-pulse">Sincronizando Orden de Trabajo...</div>;

  return (
    <Layout tituloNavbar="Gestión de Taller">
      <div className="max-w-7xl mx-auto px-4 pb-20">
        
        {/* HEADER DE ORDEN */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1a3a5c]">Gestión de Orden #70</h1>
            <span className="bg-cyan-100 text-cyan-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                Estado: {datosCita?.estado || 'EN PROCESO'}
            </span>
          </div>
          <button onClick={() => navigate('/citas')} className="bg-white border border-gray-200 text-gray-500 px-6 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 flex items-center gap-2">
             ← Volver
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: RESUMEN (Sticky) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Información General</h4>
                <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700">Placa: <span className="bg-black text-white px-2 py-0.5 rounded ml-2">{datosCita?.vehiculoPlaca}</span></p>
                    <p className="text-sm font-bold text-gray-700">Vehículo: <span className="text-gray-500 font-medium">{datosCita?.vehiculo?.marca} {datosCita?.vehiculo?.modelo}</span></p>
                    <p className="text-sm font-bold text-gray-700">Cliente: <span className="text-gray-500 font-medium uppercase">{datosCita?.vehiculo?.cliente?.apellidos}</span></p>
                </div>

                <hr className="my-6 border-gray-50" />

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Datos Técnicos Ingreso</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Kilometraje</p>
                        <p className="text-sm font-black text-blue-900">🌐 53,165 km</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Combustible</p>
                        <p className="text-sm font-black text-orange-500">⛽ 1/2</p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Mano de Obra</p>
                        <p className="text-xs font-bold text-blue-900 mt-1">{datosCita?.servicio?.nombre}</p>
                    </div>
                    <p className="text-xl font-black text-blue-600">S/ {datosCita?.servicio?.precio || '0.00'}</p>
                </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: INSPECCIÓN */}
          <div className="col-span-12 lg:col-span-8">
             <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-[#1a3a5c] flex items-center gap-2">
                        <span className="text-blue-500">✅</span> Inspección Técnica
                    </h3>
                    <div className="text-right">
                        <p className="text-2xl font-black text-emerald-500">100%</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase">Completado</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-8">
                    <div className="bg-emerald-500 h-full w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>

                {/* Categorías (Acordeones) */}
                <div className="space-y-2">
                    {categorias.map(cat => (
                        <div key={cat} className="border border-gray-50 rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-black text-gray-600 group-hover:text-blue-600">{cat}</span>
                            </div>
                            <span className="text-gray-300">▼</span>
                        </div>
                    ))}
                </div>

                <button className="w-full bg-blue-600 text-white mt-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    💾 GUARDAR PROGRESO TÉCNICO
                </button>
             </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default GestionTaller;