import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';

// 🧊 Función para adelgazar las fotos (Canvas)
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

const GestionTaller = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const idCita = searchParams.get('id_cita');

    const [datosCita, setDatosCita] = useState(null);
    const [inspeccion, setInspeccion] = useState({});
    const [archivosTemp, setArchivosTemp] = useState({});
    const [loading, setLoading] = useState(true);
    const [abierto, setAbierto] = useState(null);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        const cargarGestion = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/gestion/${idCita}`);
                setDatosCita(res.data);
                setInspeccion(res.data.inspeccionActual || {});
            } catch (err) { console.error("Error cargando:", err); }
            finally { setLoading(false); }
        };
        if (idCita) cargarGestion();
    }, [idCita]);

    const esDiagnostico = datosCita?.servicio?.especialidad === 'DIAGNOSTICO';

    // 🏎️ Cálculo de progreso reactivo
    const progresoLocal = useMemo(() => {
        let total = 0;
        let completados = 0;
        Object.entries(inspeccion).forEach(([sector, contenido]) => {
            contenido.tareas?.forEach(t => {
                total++;
                const tieneFoto = t.foto || archivosTemp[`foto_${sector}_${t.id}`];
                if (t.estado === 'N/A' || (['OK', 'REG.', 'MAL'].includes(t.estado) && tieneFoto)) {
                    completados++;
                }
            });
        });
        return total > 0 ? Math.round((completados / total) * 100) : 0;
    }, [inspeccion, archivosTemp]);

    const handleCambiarEstado = (sector, index, nuevoEstado) => {
        setInspeccion(prev => ({
            ...prev,
            [sector]: {
                ...prev[sector],
                tareas: prev[sector].tareas.map((t, i) => 
                    i === index ? { ...t, estado: nuevoEstado } : t
                )
            }
        }));
    };

    const handleFileChange = async (e, sector, idx, pointId) => {
        const file = e.target.files[0];
        if (!file) return;

        const fotoComprimida = await comprimirImagen(file);
        const fieldname = `foto_${sector}_${pointId}`;

        // 1. Guardamos el archivo
        setArchivosTemp(prev => ({ ...prev, [fieldname]: fotoComprimida }));

        // 2. Actualizamos el estado con una copia profunda
        setInspeccion(prev => ({
            ...prev,
            [sector]: {
                ...prev[sector],
                tareas: prev[sector].tareas.map((t, i) => 
                    i === idx ? { ...t, temp_photo_name: file.name } : t
                )
            }
        }));
    };

    const handleVideoChange = (e, sector) => {
        const file = e.target.files[0];
        if (!file) return;
        const limite = esDiagnostico ? 40.5 : 20.5;
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            if (video.duration > limite) {
                alert(`⚠️ Video muy largo para ${esDiagnostico ? 'DIAGNÓSTICO' : 'PREVENTIVO'} (Máx ${Math.floor(limite)}s)`);
                e.target.value = ""; return;
            }
            setArchivosTemp(prev => ({ ...prev, [`video_${sector}`]: file }));
            const copia = { ...inspeccion };
            copia[sector].video_temp_name = file.name;
            setInspeccion(copia);
        };
        video.src = URL.createObjectURL(file);
    };

    const handleGuardarDefinitivo = async () => {
        if (procesando) return;
        setProcesando(true);
        const formData = new FormData();
        formData.append('inspeccion', JSON.stringify(inspeccion));
        Object.entries(archivosTemp).forEach(([key, file]) => formData.append(key, file));

        try {
            const res = await axios.put(`http://localhost:4000/api/gestion/actualizar/${datosCita?.ordenTrabajo?.id}`, formData);
            
            // ✨ LA CLAVE: Actualizamos la inspección con los datos reales que guardó el servidor
            // Esto reemplaza los 'temp_photo_name' por los nombres de archivo reales (ej: INS-123.jpg)
            if (res.data.ordenActualizada) {
                setInspeccion(res.data.ordenActualizada.inspeccionTecnica);
            }

            alert("✅ ¡Inspección guardada!");
            setArchivosTemp({}); // Ahora sí podemos borrar esto sin que baje el %
        } catch (err) { 
            alert("❌ Error al sincronizar."); 
        } finally {
            setProcesando(false); // Liberamos el botón
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-blue-500 animate-pulse text-xl">🚀 Sincronizando...</div>;

    return (
        <Layout tituloNavbar="Gestión de Taller">
            <div className="max-w-7xl mx-auto px-4 pb-20">
                
                {/* HEADER */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#1a3a5c]">Orden #{datosCita?.ordenTrabajo?.id.slice(-4).toUpperCase()}</h1>
                        <span className="bg-cyan-100 text-cyan-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            Estado: {datosCita?.ordenTrabajo?.estado}
                        </span>
                    </div>
                    <button onClick={() => navigate('/citas')} className="bg-white border p-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all">← Volver</button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    
                    {/* SIDEBAR IZQUIERDO */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-24 max-h-[90vh] overflow-y-auto">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Información del Cliente</h4>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm uppercase">
                                    {datosCita?.vehiculo?.cliente?.nombre?.charAt(0)}{datosCita?.vehiculo?.cliente?.apellidos?.charAt(0)}
                                </div>
                                <p className="text-xs font-black text-[#1a3a5c] uppercase">{datosCita?.vehiculo?.cliente?.nombre} {datosCita?.vehiculo?.cliente?.apellidos}</p>
                            </div>

                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ficha del Vehículo</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-black text-white px-3 py-1 rounded-lg border-2 border-gray-700 shadow-md">
                                        <p className="text-[7px] font-bold text-center opacity-60">PERU</p>
                                        <p className="text-lg font-black font-mono tracking-wider">{datosCita?.vehiculoPlaca}</p>
                                    </div>
                                    <p className="text-sm font-black text-[#1a3a5c] uppercase">{datosCita?.vehiculo?.marca} {datosCita?.vehiculo?.modelo}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white p-2 rounded-xl border border-gray-100 text-[11px] font-bold text-gray-700">🎨 {datosCita?.vehiculo?.color || 'Gris'}</div>
                                    <div className="bg-white p-2 rounded-xl border border-gray-100 text-[11px] font-bold text-gray-700">⛽ {datosCita?.vehiculo?.combustible}</div>
                                </div>
                            </div>

                            <hr className="my-6" />

                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Estado de Ingreso</h4>
                            <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                                <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                                    <p className="text-[9px] text-blue-400 font-bold uppercase">KM</p>
                                    <p className="text-sm font-black text-blue-900">{datosCita?.ordenTrabajo?.kilometraje?.toLocaleString()}</p>
                                </div>
                                <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50">
                                    <p className="text-[9px] text-orange-400 font-bold uppercase">Tanque</p>
                                    <p className="text-sm font-black text-orange-600">⛽ {datosCita?.ordenTrabajo?.nivelCombustible}</p>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-2xl shadow-inner mb-6">
                                <p className="text-[9px] font-black text-yellow-500 uppercase mb-2 italic">Aceite Recomendado</p>
                                <div className="flex justify-between items-end">
                                    <div><p className="text-[10px] text-gray-400 font-bold">GRADO</p><p className="text-sm font-black text-white">{datosCita?.ordenTrabajo?.gradoAceite || '---'}</p></div>
                                    <div className="text-right"><p className="text-[10px] text-gray-400 font-bold">MARCA</p><p className="text-sm font-black text-yellow-400">{datosCita?.ordenTrabajo?.marcaAceiteSugerida || '---'}</p></div>
                                </div>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-emerald-500 uppercase">{datosCita?.servicio?.especialidad}</span>
                                <span className="text-xl font-black text-emerald-600">S/ {Number(datosCita?.servicio?.precioBase).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: INSPECCIÓN / DIAGNÓSTICO */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-[#1a3a5c]">✅ Inspección Técnica</h3>
                                <p className="text-2xl font-black text-emerald-500">{progresoLocal}%</p>
                            </div>

                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-8">
                                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progresoLocal}%` }}></div>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(inspeccion).map(([sector, contenido]) => (
                                    <div key={sector} className={esDiagnostico ? "space-y-3" : "border border-gray-100 rounded-3xl overflow-hidden shadow-sm"}>
                                        
                                        {!esDiagnostico && (
                                            <button onClick={() => setAbierto(abierto === sector ? null : sector)} className="w-full p-5 flex justify-between items-center bg-white hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-gray-700 uppercase">{sector}</span>
                                                    <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-lg">{contenido.tareas?.length} Puntos</span>
                                                </div>
                                                <span className={`text-gray-300 transition-transform ${abierto === sector ? 'rotate-180' : ''}`}>▼</span>
                                            </button>
                                        )}

                                        {(esDiagnostico || abierto === sector) && (
                                            <div className={esDiagnostico ? "space-y-3" : "p-4 bg-gray-50/50 space-y-2 border-t border-gray-50"}>
                                                {contenido.tareas?.map((t, idx) => (
                                                    <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center gap-4 border border-gray-50 shadow-sm hover:border-blue-100 transition-all">
                                                        <span className="text-xs font-bold text-gray-600 flex-1">{t.tarea}</span>
                                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                                            {['OK', 'REG.', 'MAL', 'N/A'].map(est => (
                                                                <button key={est} onClick={() => handleCambiarEstado(sector, idx, est)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${t.estado === est ? (est === 'OK' ? 'bg-emerald-500 text-white shadow-lg' : est === 'REG.' ? 'bg-orange-400 text-white shadow-lg' : est === 'MAL' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-400 text-white shadow-lg') : 'text-gray-400 hover:text-gray-600'}`}> {est} </button>
                                                            ))}
                                                        </div>
                                                        <label className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                                                            (t.foto || t.temp_photo_name) 
                                                            ? 'bg-emerald-50 text-emerald-500 border-emerald-200 cursor-default' // 🔒 BLOQUEADO
                                                            : 'bg-gray-50 text-gray-400 border-gray-100 cursor-pointer hover:bg-blue-50'
                                                        }`}>
                                                            <span className="text-xl">{(t.foto || t.temp_photo_name) ? '✅' : '📷'}</span>
                                                            
                                                            {/* Solo mostramos el input si NO hay foto */}
                                                            {!(t.foto || t.temp_photo_name) && (
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*" 
                                                                    capture="environment" 
                                                                    className="hidden" 
                                                                    onChange={(e) => handleFileChange(e, sector, idx, t.id)} 
                                                                />
                                                            )}
                                                        </label>
                                                    </div>
                                                ))}

                                                {/* 🎥 VIDEO DINÁMICO */}
                                                <label className={`px-5 py-2.5 rounded-2xl text-[10px] font-black shadow-md transition-all ${
                                                    (contenido.video || contenido.video_temp_name)
                                                    ? 'bg-emerald-100 text-emerald-600 cursor-default opacity-80' // 🔒 BLOQUEADO
                                                    : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                                                }`}>
                                                    { (contenido.video || contenido.video_temp_name) ? '✓ VIDEO CARGADO' : 'GRABAR' }
                                                    
                                                    {/* Input condicional */}
                                                    {!(contenido.video || contenido.video_temp_name) && (
                                                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoChange(e, sector)} />
                                                    )}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={handleGuardarDefinitivo}
                                disabled={procesando} // 🔒 Evita que se envíe 2 veces
                                className={`w-full mt-10 py-5 rounded-[1.5rem] font-black shadow-2xl transition-all flex items-center justify-center gap-3 ${
                                    procesando 
                                    ? 'bg-gray-400 cursor-wait opacity-80' // Estilo de "estoy ocupado"
                                    : 'bg-blue-600 text-white hover:scale-[1.01] active:scale-[0.98]' // Estilo normal
                                }`}
                            >
                                {procesando ? (
                                    <>
                                        {/* Animación de carga (Spinner) */}
                                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>OPTIMIZANDO Y GUARDANDO...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span> 
                                        GUARDAR PROGRESO TÉCNICO
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GestionTaller;