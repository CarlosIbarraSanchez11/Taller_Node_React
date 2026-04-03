import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VistaAprobacionCliente = () => {
    const { ordenId } = useParams();
    const [hallazgos, setHallazgos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarHallazgos = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/gestion/publico/hallazgos/${ordenId}`);
                setHallazgos(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        cargarHallazgos();
    }, [ordenId]);

    const responderHallazgo = async (id, nuevoEstado) => {
        try {
            await axios.put(`http://localhost:4000/api/gestion/publico/responder-hallazgo/${id}`, {
                estado: nuevoEstado
            });
            // Actualizamos la vista localmente
            setHallazgos(prev => prev.map(h => h.id === id ? { ...h, estado: nuevoEstado } : h));
        } catch (e) { alert("Error al procesar respuesta"); }
    };

    // Calculamos el total de lo aprobado
    const totalAprobado = hallazgos
        .filter(h => h.estado === 'SOLICITADO')
        .reduce((sum, h) => sum + Number(h.total), 0);

    if (loading) return <div className="p-10 text-center font-black text-blue-500 animate-pulse">⚙️ Preparando su presupuesto...</div>;

    return (
        <div className="max-w-xl mx-auto p-4 bg-[#f8fafc] min-h-screen font-sans">
            {/* HEADER PROFESIONAL */}
            <header className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-6 border border-gray-100 text-center">
                <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📋</span>
                </div>
                <h1 className="text-xl font-black text-[#1a3a5c] uppercase tracking-tight">Reporte de Hallazgos Técnicos</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Orden de Servicio: #{ordenId.slice(-6).toUpperCase()}</p>
            </header>

            <div className="space-y-6">
                {hallazgos.map((h, index) => (
                    <div key={h.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-md border border-gray-100 transition-all">
                        {/* ETIQUETA DE HALLAZGO */}
                        <div className="bg-[#1a3a5c] px-6 py-2 flex justify-between items-center">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Hallazgo Detectado #{index + 1}</span>
                            <span className="text-[9px] font-black text-blue-300 uppercase italic">Sugerencia del Especialista</span>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-5 mb-6">
                                <div className="relative group">
                                    <img 
                                        src={`http://localhost:4000/uploads/gestion/${h.foto}`} 
                                        className="w-28 h-28 rounded-[2rem] object-cover shadow-inner border border-gray-50" 
                                        alt="Evidencia"
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm p-1 rounded-lg">
                                        <span className="text-[8px] text-white font-bold">EVIDENCIA</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-base text-[#1a3a5c] leading-tight mb-1 uppercase">{h.puntoFalla}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-tighter">
                                        Acción Requerida: {h.costoMaestro?.nombre || 'Cambio de componente'}
                                    </p>
                                    <div className="inline-block bg-blue-50 px-3 py-1 rounded-xl">
                                        <p className="text-lg font-black text-blue-600">S/ {Number(h.total).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* LÓGICA DE BOTONES / BLOQUEO */}
                            {h.estado === 'ENVIADO' ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => responderHallazgo(h.id, 'RECHAZADO')}
                                        className="py-4 rounded-2xl font-black text-[10px] bg-gray-50 text-gray-400 uppercase hover:bg-red-50 hover:text-red-400 transition-all"
                                    > ✕ No realizar ahora </button>
                                    <button 
                                        onClick={() => responderHallazgo(h.id, 'SOLICITADO')}
                                        className="py-4 rounded-2xl font-black text-[10px] bg-emerald-500 text-white uppercase shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    > ✓ Autorizar Cambio </button>
                                </div>
                            ) : (
                                <div className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[11px] uppercase shadow-inner ${
                                    h.estado === 'SOLICITADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-400'
                                }`}>
                                    <span>{h.estado === 'SOLICITADO' ? '✅ TRABAJO AUTORIZADO' : '❌ TRABAJO POSTERGADO'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* RESUMEN FINAL PARA EL CLIENTE */}
            {totalAprobado > 0 && (
                <div className="mt-8 bg-[#1a3a5c] p-6 rounded-[2.5rem] shadow-xl animate-in slide-in-from-bottom duration-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-blue-300 uppercase">Total Adicional Autorizado</p>
                            <p className="text-2xl font-black text-white">S/ {totalAprobado.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl">
                            <span className="text-2xl">🏎️</span>
                        </div>
                    </div>
                    <p className="text-[8px] text-blue-200/50 font-bold uppercase mt-4 text-center">Este monto se sumará a su presupuesto inicial</p>
                </div>
            )}

            <footer className="py-10 text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">Dr. Car - Tecnología en el cuidado de su vehículo 🛡️</p>
            </footer>
        </div>
    );
};

export default VistaAprobacionCliente;