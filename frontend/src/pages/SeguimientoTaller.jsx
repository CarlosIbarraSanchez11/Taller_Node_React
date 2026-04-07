import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ChevronDown, Car, ShieldCheck, Folder, 
    Camera, PlayCircle, Clock, CheckCircle2 
} from 'lucide-react';

const SeguimientoTaller = () => {
    const { ordenId } = useParams();
    const [datos, setDatos] = useState(null);
    const [seccionAbierta, setSeccionAbierta] = useState(null);

    const GESTION_URL = 'http://localhost:4000/uploads/gestion';

    useEffect(() => {
        const fetchSeguimiento = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/gestion/publico/seguimiento/${ordenId}`);
                setDatos(res.data);
            } catch (error) {
                console.error("Error cargando seguimiento");
            }
        };
        fetchSeguimiento();
        const interval = setInterval(fetchSeguimiento, 20000); // Sync cada 20s
        return () => clearInterval(interval);
    }, [ordenId]);

    if (!datos) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full mb-4"></div>
                <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Sincronizando Dr. Motors...</p>
            </div>
        </div>
    );

    const { cita, progreso, estado, inspeccionTecnica } = datos;

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* --- HEADER LOGO --- */}
            <div className="flex justify-center py-8 bg-white border-b">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-black italic tracking-tighter text-[#1e293b]">
                        Dr.<span className="text-red-600 ml-1">MOTORS</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-6">
                
                {/* --- CARD CLIENTE --- */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                {cita.vehiculo.cliente.nombres} {cita.vehiculo.cliente.apellidos}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100">
                                    {cita.vehiculo.marca} {cita.vehiculo.modelo}
                                </span>
                                <span className="bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded-md">
                                    {cita.vehiculoPlaca}
                                </span>
                            </div>
                        </div>
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black border border-emerald-100 uppercase">
                            {estado}
                        </div>
                    </div>

                    {/* BARRA DE PROGRESO GLOBAL */}
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[11px] font-black text-slate-500 uppercase">Estado del Vehículo</span>
                            <span className="text-2xl font-black text-blue-600">{progreso}%</span>
                        </div>
                        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div 
                                className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ease-out"
                                style={{ 
                                    width: `${progreso}%`,
                                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
                                    backgroundSize: '1rem 1rem'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN ACORDEONES REVISIÓN --- */}
                <div className="flex items-center gap-2 mb-4 px-2">
                    <CheckCircle2 size={18} className="text-blue-600" />
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Revisión Técnica</h3>
                </div>

                <div className="space-y-3">
                    {Object.entries(inspeccionTecnica).map(([sector, data], idx) => {
                        const isOpen = seccionAbierta === sector;
                        
                        // Calculamos progreso del sector
                        const total = data.tareas.length;
                        const ok = data.tareas.filter(t => t.estado !== 'PENDIENTE').length;
                        const pSector = Math.round((ok / total) * 100);

                        return (
                            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <button 
                                    onClick={() => setSeccionAbierta(isOpen ? null : sector)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Folder size={18} className="text-blue-500 fill-blue-50" />
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{sector}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-blue-600">{pSector}%</span>
                                        <ChevronDown size={18} className={`text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>

                                {/* LINEA DE PROGRESO DEL SECTOR (Visible siempre) */}
                                <div className="h-1 w-full bg-slate-50">
                                    <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${pSector}%` }}></div>
                                </div>

                                {isOpen && (
                                    <div className="p-5 bg-slate-50/30 space-y-6">
                                        {/* Lista de tareas del sector */}
                                        <div className="grid grid-cols-1 gap-2">
                                            {data.tareas.map((t, tIdx) => (
                                                <div key={tIdx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{t.tarea}</span>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                                        t.estado === 'OK' ? 'bg-emerald-100 text-emerald-600' :
                                                        t.estado === 'MAL' ? 'bg-red-100 text-red-600' :
                                                        t.estado === 'REG.' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        {t.estado}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Evidencias Multimedia del Sector */}
                                        <div className="space-y-4">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Camera size={12} /> Evidencias en vivo
                                            </p>

                                            {/* Grilla de Fotos */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {data.tareas.filter(t => t.foto).map((t, fIdx) => (
                                                    <div key={fIdx} className="group relative aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white">
                                                        <img 
                                                            src={`${GESTION_URL}/${t.foto}`} 
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                            alt="inspeccion" 
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2">
                                                            <p className="text-[7px] text-white font-bold truncate uppercase">{t.tarea}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Video del Sector */}
                                            {data.video && (
                                                <div className="mt-4">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                                        <PlayCircle size={12} /> Evidencia en Video
                                                    </p>
                                                    <div className="rounded-3xl overflow-hidden shadow-lg bg-black aspect-video border-4 border-white">
                                                        <video 
                                                            src={`${GESTION_URL}/${data.video}`} 
                                                            className="w-full h-full" 
                                                            controls 
                                                            preload="metadata"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- FOOTER SEGURO --- */}
                <div className="mt-12 flex flex-col items-center gap-4 text-center">
                    <div className="bg-slate-200/50 px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-200">
                        <ShieldCheck size={14} className="text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tight uppercase">
                            ID ORDEN: {ordenId.slice(-8).toUpperCase()} | Seguimiento Seguro
                        </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400">
                        © {new Date().getFullYear()} DR. MOTORS Taller - Calidad Certificada
                    </p>
                </div>

            </div>
        </div>
    );
};

export default SeguimientoTaller;