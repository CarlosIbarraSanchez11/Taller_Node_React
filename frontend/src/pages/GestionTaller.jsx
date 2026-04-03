import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const idCita = searchParams.get('id_cita');

    const [datosCita, setDatosCita] = useState(null);
    const [inspeccion, setInspeccion] = useState({});
    const [archivosTemp, setArchivosTemp] = useState({});
    const [loading, setLoading] = useState(true);
    const [abierto, setAbierto] = useState(null);
    const [procesando, setProcesando] = useState(false);

    // ✨ ESTADOS PARA HALLAZGOS INDEPENDIENTES
    const [hallazgos, setHallazgos] = useState([]); // Los que ya están en DB
    const [showModal, setShowModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [itemSel, setItemSel] = useState(null);
    const [descripcionH, setDescripcionH] = useState("");
    const [puntoFallaH, setPuntoFallaH] = useState("INSPECCIÓN GENERAL / ADICIONAL");
    const [cantH, setCantH] = useState(1);
    const [fotoH, setFotoH] = useState(null);
    const [fotoHPrev, setFotoHPrev] = useState(null);

    const [hallazgoAEvidenciar, setHallazgoAEvidenciar] = useState(''); // Guarda el ID del repuesto elegido
    const [fotoEvidencia, setFotoEvidencia] = useState(null);           // Guarda el archivo de la foto
    const [subiendoEvidencia, setSubiendoEvidencia] = useState(false);   // Para el loader del botón

    useEffect(() => {
        // 1. Definimos la función de carga (la mantenemos igual)
        const cargarGestion = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/gestion/${idCita}`);
                setDatosCita(res.data);
                
                if (res.data.ordenTrabajo?.hallazgos) {
                    setHallazgos(res.data.ordenTrabajo.hallazgos);
                }
                setInspeccion(res.data.inspeccionActual || {});
                
            } catch (err) { 
                console.error("Error cargando:", err); 
            } finally { 
                setLoading(false); 
            }
        };

        // 2. La ejecutamos de inmediato al entrar
        if (idCita) {
            cargarGestion();

            // 3. 🚀 ESTE ES EL CAMBIO: Creamos el intervalo
            // 20000 ms = 20 segundos. Puedes ponerle 30000 (30 seg) si prefieres.
            const intervalo = setInterval(() => {
                console.log("🔄 Sincronizando estados con el servidor...");
                cargarGestion();
            }, 20000); 

            // 4. 🧹 MUY IMPORTANTE: Limpiar el intervalo al salir
            // Esto evita que la app se ponga lenta o que el navegador colapse
            return () => clearInterval(intervalo);
        }
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

    const repuestosParaInstalar = useMemo(() => {
        // 🚀 Filtramos TODO lo que el mecánico ya tiene (Kit + Hallazgos Adicionales)
        return hallazgos.filter(h => 
            h.estado === 'RECIBIDO' && // Almacén ya lo entregó
            !h.fotoInstalacion          // Aún no tiene foto de evidencia
        );
    }, [hallazgos]);

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

    const buscarMaestro = async (val) => {
        setBusqueda(val);
        if (val.length < 2) return setResultados([]);
        try {
            const res = await axios.get(`http://localhost:4000/api/gestion/buscar-maestro?q=${val}`);
            setResultados(res.data);
        } catch (e) { console.log(e); }
    };

    const confirmarHallazgo = async () => {
        if (!itemSel || !fotoH) return alert("⚠️ Selecciona un producto y toma la foto de evidencia.");
        
        setProcesando(true);
        const formData = new FormData();
        formData.append('costoMaestroId', itemSel.id);
        formData.append('nombre', itemSel.nombre);
        formData.append('puntoFalla', puntoFallaH);
        formData.append('descripcion', descripcionH);
        formData.append('cantidad', cantH);
        formData.append('precioVenta', itemSel.precioVenta);
        formData.append('foto_hallazgo', fotoH);

        try {
            const res = await axios.post(`http://localhost:4000/api/gestion/hallazgo/${datosCita?.ordenTrabajo?.id}`, formData);
            setHallazgos([...hallazgos, res.data]); // Actualizamos tabla local
            setShowModal(false);
            // Limpiar modal
            setItemSel(null); setBusqueda(""); setFotoH(null); setFotoHPrev(null); setCantH(1); setDescripcionH("");
            alert("✅ Hallazgo registrado correctamente.");
        } catch (e) { alert("❌ Error al guardar hallazgo."); }
        finally { setProcesando(false); }
    };

    const handleNotificarCliente = async () => {
        try {
            const res = await axios.post(`http://localhost:4000/api/gestion/enviar-presupuesto/${datosCita?.ordenTrabajo?.id}`);
            
            // Refrescamos los hallazgos locales para que cambien a "ENVIADO"
            const nuevosHallazgos = hallazgos.map(h => 
                h.estado === 'POR ENVIAR' ? { ...h, estado: 'ENVIADO' } : h
            );
            setHallazgos(nuevosHallazgos);
            
            alert(`✅ Link generado: ${res.data.linkEnviado} (Copiado a consola)`);
            console.log("Link para el cliente:", res.data.linkEnviado);
        } catch (e) {
            alert("❌ Error al notificar");
        }
    };

    const handleGuardarEvidencia = async () => {
    if (!hallazgoAEvidenciar || !fotoEvidencia) {
        return toast.error("Selecciona un repuesto y toma la foto");
    }

    setSubiendoEvidencia(true);
    const formData = new FormData();
    formData.append('foto', fotoEvidencia);
    formData.append('usuarioId', user?.id || 4); // 👈 Ahora sí reconoce 'user'

    try {
        // 🎯 IMPORTANTE: Usa la URL completa o tu instancia 'api'
        await axios.patch(`http://localhost:4000/api/gestion/hallazgos/${hallazgoAEvidenciar}/evidencia`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.success("¡Evidencia guardada!");
        setFotoEvidencia(null);
        setHallazgoAEvidenciar('');
        
        cargarGestion(); // 👈 CAMBIADO: Usamos tu función para refrescar
    } catch (error) {
        toast.error("Error al subir la foto");
    } finally {
        setSubiendoEvidencia(false);
    }
};

    const handleEliminarEvidencia = async (id) => {
    if (!window.confirm("¿Eliminar esta evidencia?")) return;
    try {
        await axios.patch(`http://localhost:4000/api/gestion/hallazgos/${id}/evidencia-eliminar`);
        toast.success("Evidencia eliminada");
        cargarGestion(); // 👈 CAMBIADO: Refrescamos la lista
    } catch (error) {
        toast.error("No se pudo borrar");
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
                    <div className="col-span-12 lg:col-span-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
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
                                                            ? 'bg-emerald-50 text-emerald-500 border-emerald-200 cursor-default'
                                                            : 'bg-gray-50 text-gray-400 border-gray-100 cursor-pointer hover:bg-blue-50'
                                                        }`}>
                                                            <span className="text-xl">{(t.foto || t.temp_photo_name) ? '✅' : '📷'}</span>
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
                                                    ? 'bg-emerald-100 text-emerald-600 cursor-default opacity-80'
                                                    : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                                                }`}>
                                                    { (contenido.video || contenido.video_temp_name) ? '✓ VIDEO CARGADO' : 'GRABAR' }
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
                                disabled={procesando}
                                className={`w-full mt-10 py-5 rounded-[1.5rem] font-black shadow-2xl transition-all flex items-center justify-center gap-3 ${
                                    procesando
                                    ? 'bg-gray-400 cursor-wait opacity-80'
                                    : 'bg-blue-600 text-white hover:scale-[1.01] active:scale-[0.98]'
                                }`}
                            >
                                {procesando ? (
                                    <>
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

                    {/* ✨ SECCIÓN: NUEVOS HALLAZGOS (TABLA) — ahora correctamente dentro del grid */}
                    <div className="col-span-12">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-[2rem] mb-6">
                                <p className="text-[11px] font-bold text-gray-400 mb-4">¿Encontraste algo que no está en la lista?</p>
                                <button onClick={() => setShowModal(true)} className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:scale-105 transition-all">
                                    + NUEVO HALLAZGO GENERAL
                                </button>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-black text-red-500 flex items-center gap-2">📑 Presupuestos Adicionales</h3>
                                
                                {/* Este botón solo aparece si hay al menos uno "POR ENVIAR" */}
                                {hallazgos.some(h => h.estado === 'POR ENVIAR') && (
                                    <button 
                                        onClick={handleNotificarCliente}
                                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-lg hover:bg-emerald-600 transition-all animate-bounce"
                                    >
                                        <span>💬</span> NOTIFICAR AL CLIENTE POR WHATSAPP
                                    </button>
                                )}
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="text-gray-400 font-black uppercase border-b border-gray-50">
                                        <tr>
                                            <th className="py-4">DETALLE DEL HALLAZGO</th>
                                            <th className="py-4 text-center">CANT.</th>
                                            <th className="py-4 text-right">TOTAL PRESUPUESTO</th>
                                            <th className="py-4 text-center">ESTADO</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {hallazgos.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-10 text-center text-gray-300 font-bold italic">
                                                    No hay hallazgos registrados
                                                </td>
                                            </tr>
                                        ) : (
                                            hallazgos.map(h => {
                                                // 💡 Definimos si es parte del kit (precio 0)
                                                const esKit = Number(h.precioVenta) === 0;

                                                return (
                                                    <tr key={h.id} className={esKit ? "bg-blue-50/20" : ""}>
                                                        {/* 1. DETALLE DEL HALLAZGO */}
                                                        <td className="py-4 flex items-center gap-3">
                                                            {/* Icono dinámico: Caja para Kit, Llave para Adicional */}
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                                esKit ? 'bg-blue-50 text-blue-400' : 'bg-red-50 text-red-400'
                                                            }`}>
                                                                {esKit ? '📦' : '🔧'}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-800 uppercase leading-none">{h.puntoFalla}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-[9px] text-gray-400 uppercase">
                                                                        {h.costoMaestro?.nombre || 'Repuesto'}
                                                                    </p>
                                                                    {/* ✨ Badge de "INCLUIDO" solo para el Kit */}
                                                                    {esKit && (
                                                                        <span className="bg-emerald-500 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                                                            INCLUIDO
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="py-4 text-center font-black">{h.cantidad}</td>

                                                        <td className="py-4 text-right">
                                                            <p className={`font-black leading-none ${esKit ? 'text-gray-400' : 'text-red-500'}`}>
                                                                S/ {h.total.toFixed(2)}
                                                            </p>
                                                            <p className="text-[8px] text-gray-300 italic">
                                                                {esKit ? 'Costo cubierto por el servicio' : 'Inc. Instalación y Gastos'}
                                                            </p>
                                                        </td>

                                                        <td className="py-4 text-center">
                                                            {h.estado === 'POR ENVIAR' ? (
                                                                <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                                                                    🕒 POR ENVIAR
                                                                </span>
                                                            ) : h.estado === 'ENVIADO' ? (
                                                                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                                                                    📩 ENVIADO
                                                                </span>
                                                            ) : h.estado === 'RECHAZADO' ? (
                                                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                                                                    ❌ RECHAZADO
                                                                </span>
                                                            ) : h.estado === 'EN CAMINO' ? (
                                                                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                                                                    🚚 EN CAMINO
                                                                </span>
                                                            ) : h.estado === 'RECIBIDO' ? (
                                                                <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                                                                    📦 RECIBIDO
                                                                </span>
                                                            ) : (
                                                                <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                                                                    ✅ SOLICITADO
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 📸 SECCIÓN: EVIDENCIA DE INSTALACIÓN */}
                    <div className="col-span-12 mt-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            
                            {/* Header de la Sección */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                                        <span className="text-xl">🛠️</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-[#1a3a5c]">Captura de Instalación</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Documenta los repuestos colocados en el vehículo</p>
                                    </div>
                                </div>
                                {/* Contador de progreso */}
                                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Completados</p>
                                    <p className="text-sm font-black text-[#1a3a5c] text-center">
                                        {hallazgos.filter(h => h.fotoInstalacion).length} / {hallazgos.filter(h => h.estado === 'RECIBIDO' || h.fotoInstalacion).length}
                                    </p>
                                </div>
                            </div>

                            {/* 1. ZONA DE CARGA (Selector y Cámara) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-slate-50/50 p-6 rounded-[2rem] border border-dashed border-slate-200 mb-10">
                                
                                {/* Combo de Selección */}
                                <div className="lg:col-span-5 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Repuesto Recibido</label>
                                    <select 
                                        value={hallazgoAEvidenciar}
                                        className="w-full bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold text-[#1a3a5c] shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        onChange={(e) => setHallazgoAEvidenciar(e.target.value)}
                                    >
                                        <option value="">-- SELECCIONAR --</option>
                                        {hallazgos.filter(h => h.estado === 'RECIBIDO' && !h.fotoInstalacion).map(h => (
                                            <option key={h.id} value={h.id}>
                                                {h.puntoFalla}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Botón de Cámara */}
                                <div className="lg:col-span-4">
                                    <label className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm cursor-pointer border-2 border-dashed ${
                                        fotoEvidencia 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                        : 'bg-white text-slate-400 border-slate-100 hover:bg-blue-50 hover:text-blue-600'
                                    }`}>
                                        <span>{fotoEvidencia ? '✅ FOTO LISTA' : '📷 CAPTURAR FOTO'}</span>
                                        <input type="file" accept="image/*" capture="environment" className="hidden" 
                                            onChange={(e) => setFotoEvidencia(e.target.files[0])} />
                                    </label>
                                </div>

                                {/* Botón Guardar */}
                                <div className="lg:col-span-3">
                                    <button 
                                        onClick={handleGuardarEvidencia}
                                        disabled={!hallazgoAEvidenciar || !fotoEvidencia || subiendoEvidencia}
                                        className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all ${
                                            !hallazgoAEvidenciar || !fotoEvidencia || subiendoEvidencia
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:scale-[1.02] active:scale-95 shadow-blue-200'
                                        }`}
                                    >
                                        {subiendoEvidencia ? 'Subiendo...' : 'Guardar Evidencia'}
                                    </button>
                                </div>
                            </div>

                            {/* 2. GALERÍA DE REVIEWS (Cards Estilo Dashboard) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {hallazgos.filter(h => h.fotoInstalacion).map((h) => (
                                    <div key={h.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                                        
                                        {/* Imagen de la Card */}
                                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                                            <img 
                                                // 🚀 CAMBIO: Usamos la ruta directa o el formato de Vite
                                                src={`http://localhost:4000/uploads/evidencias/${h.fotoInstalacion}`} 
                                                alt="Evidencia"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest">
                                                Nuevo
                                            </span>
                                        </div>

                                        {/* Información y Acción */}
                                        <div className="p-4">
                                            <p className="text-[10px] font-black text-[#1a3a5c] uppercase line-clamp-1 border-b border-slate-50 pb-2 mb-3">
                                                {h.puntoFalla}
                                            </p>
                                            
                                            <button 
                                                onClick={() => handleEliminarEvidencia(h.id)}
                                                className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all group/btn"
                                            >
                                                <span className="text-sm">🗑️</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest group-hover/btn:translate-x-1 transition-transform">
                                                    Borrar
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Vista vacía si no hay fotos */}
                                {hallazgos.filter(h => h.fotoInstalacion).length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                        <p className="text-3xl mb-2 opacity-30">📸</p>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Esperando capturas de instalación</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>{/* FIN GRID */}
            </div>

            {/* ✨ MODAL DE REGISTRO DE HALLAZGO */}
            {showModal && (
                <div className="fixed inset-0 bg-[#1a3a5c]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-black text-blue-600 mb-6 flex items-center gap-2">🔍 Registrar Hallazgo</h2>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[11px] font-black text-gray-400 ml-2 uppercase">Punto de Falla / Componente</label>
                                <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold mt-1" value={puntoFallaH} onChange={(e) => setPuntoFallaH(e.target.value)} />
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-gray-400 ml-2 uppercase">Descripción del Hallazgo</label>
                                <textarea 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-bold mt-1 h-20" 
                                placeholder="Describa el problema..." 
                                value={descripcionH} 
                                onChange={(e) => setDescripcionH(e.target.value)} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-black text-gray-400 ml-2 uppercase">Cant.</label>
                                    <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-none text-center font-black mt-1" value={cantH} onChange={(e) => setCantH(e.target.value)} />
                                </div>
                                <div className="relative">
                                    <label className="text-[11px] font-black text-gray-400 ml-2 uppercase">Producto / Repuesto</label>
                                    <input type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-none text-xs font-black mt-1" placeholder="-- Seleccionar --" value={busqueda} onChange={(e) => buscarMaestro(e.target.value)} />
                                    {resultados.length > 0 && (
                                        <div className="absolute w-full bg-white shadow-2xl rounded-2xl mt-1 border z-10 max-h-40 overflow-auto border-gray-100">
                                            {resultados.map(r => (
                                                <div key={r.id} onClick={() => { setItemSel(r); setBusqueda(`${r.nombre} - ${r.marca}`); setResultados([]); }} className="p-3 hover:bg-blue-50 cursor-pointer text-[10px] font-bold border-b border-gray-50">{r.nombre} ({r.marca})</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-[2rem] p-6 flex flex-col justify-center items-center border border-blue-100 shadow-inner">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Presupuesto Estimado (Inc. Matriz)</span>
                                <span className="text-4xl font-black text-blue-600">S/ {(cantH * (itemSel?.precioVenta || 0)).toFixed(2)}</span>
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-gray-400 ml-2 uppercase">Evidencia Fotográfica de la Falla</label>
                                <label className={`w-full mt-1 h-14 rounded-2xl border-2 border-dashed flex items-center px-4 gap-3 cursor-pointer transition-all ${fotoHPrev ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400'}`}>
                                    <span className="text-xl">📷</span>
                                    <span className="text-xs font-bold truncate flex-1">{fotoH ? fotoH.name : 'Subir evidencia...'}</span>
                                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={async (e) => {
                                        const file = e.target.files[0]; if (!file) return;
                                        setFotoHPrev(URL.createObjectURL(file));
                                        setFotoH(await comprimirImagen(file));
                                    }} />
                                </label>
                            </div>

                            <button onClick={confirmarHallazgo} disabled={procesando} className="w-full bg-blue-600 py-5 rounded-[1.5rem] font-black text-white text-sm shadow-xl flex items-center justify-center gap-3">
                                {procesando ? <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span>💾</span> CONFIRMAR HALLAZGO</>}
                            </button>
                            <button onClick={() => setShowModal(false)} className="w-full py-2 text-gray-400 font-bold text-xs">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default GestionTaller;