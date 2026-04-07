import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// ☁️ DEFINIMOS LA RUTA BASE DE TU BUCKET
const CLOUD_STORAGE_URL = "https://storage.googleapis.com/taller-dr-motors-storage/gestion-taller-node/hallazgos";

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
            setHallazgos(prev => prev.map(h => h.id === id ? { ...h, estado: nuevoEstado } : h));
        } catch (e) { alert("Error al procesar respuesta"); }
    };

    const totalAprobado = hallazgos
        .filter(h => h.estado === 'SOLICITADO' && Number(h.total) > 0) // Solo sumamos lo que cuesta
        .reduce((sum, h) => sum + Number(h.total), 0);

    if (loading) return <div className="p-10 text-center font-black text-blue-500 animate-pulse">⚙️ Preparando su presupuesto...</div>;

    return (
        <div className="max-w-xl mx-auto p-4 bg-[#f8fafc] min-h-screen font-sans">
            <header className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-6 border border-gray-100 text-center">
                <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📋</span>
                </div>
                <h1 className="text-xl font-black text-[#1a3a5c] uppercase tracking-tight">Reporte de Hallazgos Técnicos</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Orden de Servicio: #{ordenId.slice(-6).toUpperCase()}</p>
            </header>

            <div className="space-y-6">
                {hallazgos.map((h, index) => (
                    <div key={h.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-md border border-gray-100">
                        <div className="bg-[#1a3a5c] px-6 py-2 flex justify-between items-center">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Hallazgo #{index + 1}</span>
                            <span className="text-[9px] font-black text-blue-300 uppercase italic">Dr. Car Motors</span>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-5 mb-6">
                                <div className="relative">
                                    {/* ✅ CAMBIO A CLOUD STORAGE */}
                                    <img 
                                        src={`${CLOUD_STORAGE_URL}/${h.foto}`} 
                                        className="w-28 h-28 rounded-[2rem] object-cover shadow-inner border border-gray-50" 
                                        alt="Evidencia"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Sin+Foto"; }}
                                    />
                                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm p-1 rounded-lg">
                                        <span className="text-[8px] text-white font-bold">EVIDENCIA</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-base text-[#1a3a5c] leading-tight mb-1 uppercase">{h.puntoFalla}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-tighter">
                                        Acción: {h.descripcion || 'Revisión técnica'}
                                    </p>
                                    <div className="inline-block bg-blue-50 px-3 py-1 rounded-xl">
                                        <p className="text-lg font-black text-blue-600">
                                            {Number(h.total) > 0 ? `S/ ${Number(h.total).toFixed(2)}` : 'INCLUIDO'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 🛠️ NUEVA LÓGICA DE BOTONES */}
                            {Number(h.total) === 0 ? (
                                // Si cuesta 0, es del KIT. No mostramos botones de autorizar.
                                <div className="bg-blue-50/50 text-blue-600 py-3 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                    ✨ Este item forma parte de su mantenimiento base
                                </div>
                            ) : h.estado === 'ENVIADO' ? (
                                // Si tiene costo y está pendiente
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => responderHallazgo(h.id, 'RECHAZADO')}
                                        className="py-4 rounded-2xl font-black text-[10px] bg-gray-50 text-gray-400 uppercase"
                                    > ✕ Postergar </button>
                                    <button 
                                        onClick={() => responderHallazgo(h.id, 'SOLICITADO')}
                                        className="py-4 rounded-2xl font-black text-[10px] bg-emerald-500 text-white uppercase shadow-lg shadow-emerald-100"
                                    > ✓ Autorizar </button>
                                </div>
                            ) : (
                                // Si ya respondió
                                <div className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[11px] uppercase ${
                                    h.estado === 'SOLICITADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-400'
                                }`}>
                                    <span>{h.estado === 'SOLICITADO' ? '✅ AUTORIZADO' : '❌ POSTERGADO'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* TOTAL */}
            {totalAprobado > 0 && (
                <div className="mt-8 bg-[#1a3a5c] p-6 rounded-[2.5rem] shadow-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-blue-300 uppercase">Total adicional a pagar</p>
                            <p className="text-2xl font-black text-white">S/ {totalAprobado.toFixed(2)}</p>
                        </div>
                        <span className="text-2xl">🏎️</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VistaAprobacionCliente;