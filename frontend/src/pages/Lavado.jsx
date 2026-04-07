import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Layout from '../components/layout/Layout';

const CLOUD_RECEPCION = "https://storage.googleapis.com/taller-dr-motors-storage/gestion-taller-node/recepcion";

// 🧊 Tu función mágica de compresión (Mantenla siempre a mano)
const comprimirImagen = (archivo) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(archivo);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;
                if (width > height && width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                else if (height > MAX_WIDTH) { width *= MAX_WIDTH / height; height = MAX_WIDTH; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], archivo.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.7);
            };
        };
    });
};

const Lavado = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const idCita = searchParams.get('id_cita');

    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fotoFinal, setFotoFinal] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    
    // Estado para el checklist (puedes añadir más campos)
    const [checklist, setChecklist] = useState({
        carroceria: false,
        aspirado: false,
        vidrios: false,
        niveles: false
    });

    // 1. Cargar datos del vehículo y fotos de recepción
    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/lavado/${idCita}`);
                setDatos(res.data);
            } catch (error) {
                toast.error("Error al cargar datos");
            } finally {
                setLoading(false);
            }
        };
        if (idCita) fetchDatos();
    }, [idCita]);

    const handleCheck = (campo) => {
        setChecklist(prev => ({ ...prev, [campo]: !prev[campo] }));
    };

    // 2. Acción Final de Lavado
    const handleFinalizar = async () => {
        // Validación: Al menos la foto y que los checks estén bien
        if (!fotoFinal) return toast.error("📸 Toma la foto final para el cliente");
        if (!checklist.carroceria || !checklist.aspirado) {
            return toast.error("⚠️ Completa el checklist de limpieza");
        }

        setSubiendo(true);
        try {
            // 🚀 PASO CLAVE: La foto adelgaza antes de viajar (Adiós 5MB)
            const fotoFlaquita = await comprimirImagen(fotoFinal);
            
            const formData = new FormData();
            formData.append('foto_final', fotoFlaquita); // 👈 Nombre exacto del backend
            formData.append('checklist', JSON.stringify(checklist));

            // PATCH: http://localhost:4000/api/lavado/:id/finalizar
            await axios.patch(`http://localhost:4000/api/lavado/${idCita}/finalizar`, formData);

            toast.success("✨ ¡Vehículo listo para entrega!");
            navigate('/citas'); // Volvemos a la agenda
        } catch (error) {
            toast.error("Error al finalizar el lavado");
        } finally {
            setSubiendo(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-blue-500 animate-pulse text-xl">🚿 Sincronizando datos de lavado...</div>;

    return (
        <Layout tituloNavbar="Control de Lavado y Salida">
            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* COLUMNA IZQUIERDA: DATOS DE REFERENCIA */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Datos de la unidad</h3>
                            <p className="text-xl font-black text-[#1a3a5c] mb-1">Placa: <span className="bg-black text-white px-2 py-1 rounded-lg font-mono">{datos?.vehiculoPlaca}</span></p>
                            <p className="text-sm font-bold text-gray-500 uppercase">{datos?.vehiculo?.marca} {datos?.vehiculo?.modelo}</p>
                            
                            <hr className="my-6 border-dashed" />
                            
                            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Foto de recepción (Referencia)</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {datos?.ordenTrabajo?.fotos?.map((f, i) => (
                                    <img 
                                        key={i} 
                                        // 🚀 CAMBIO: Ahora apuntamos a la carpeta /recepcion en la nube
                                        src={`${CLOUD_RECEPCION}/${f}`} 
                                        className="rounded-xl border border-gray-100 shadow-sm aspect-square object-cover" 
                                        alt="Referencia Recepción" 
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Sin+Foto"; }}
                                    />
                                ))}
                            </div>
                            <p className="text-[9px] text-gray-300 italic text-center mt-3">Así llegó el vehículo al taller.</p>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: CONTROL DE LAVADO */}
                    <div className="md:col-span-8">
                        <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-black text-cyan-500 mb-8 flex items-center gap-3">🧼 Evidencia de Lavado Final</h3>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Checklist */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Checklist de Calidad</p>
                                    {Object.keys(checklist).map((key) => (
                                        <div key={key} onClick={() => handleCheck(key)} className="flex items-center gap-4 cursor-pointer group">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checklist[key] ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-100' : 'border-gray-100'}`}>
                                                {checklist[key] && '✓'}
                                            </div>
                                            <span className={`text-sm font-bold uppercase ${checklist[key] ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {key.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Captura de Foto */}
                                <div className="flex flex-col items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Foto del vehículo terminado</p>
                                    <label className={`w-full aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${fotoFinal ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                                        <span className="text-4xl">{fotoFinal ? '✨' : '📸'}</span>
                                        <span className="text-[10px] font-black uppercase">{fotoFinal ? '✓ Foto Lista' : 'Toma la foto final para el cliente'}</span>
                                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setFotoFinal(e.target.files[0])} />
                                    </label>
                                </div>
                            </div>

                            <hr className="my-10" />

                            <button 
                                onClick={handleFinalizar}
                                disabled={subiendo}
                                className={`w-full py-6 rounded-[2rem] font-black text-lg shadow-xl transition-all flex items-center justify-center gap-4 ${subiendo ? 'bg-gray-200 text-gray-400 cursor-wait' : 'bg-cyan-500 text-white hover:scale-[1.01] active:scale-95 shadow-cyan-100'}`}
                            >
                                {subiendo ? 'PROCESANDO...' : 'FINALIZAR Y LISTO PARA ENTREGA ✅'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Lavado;