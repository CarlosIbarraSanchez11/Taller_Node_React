import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import { generarReportePDF } from '../utils/GenerarReportePDF';
import { generarCotizacionPDF } from '../utils/GenerarCotizacionPDF';
import { 
  ArrowLeft, Printer, FileText, Download, CheckCircle, 
  ChevronDown, Camera, ClipboardList 
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idCita = searchParams.get('id_cita'); 
  
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [seccionAbierta, setSeccionAbierta] = useState(null);

  useEffect(() => {
    const fetchOrden = async () => {
      if (!idCita) return;
      try {
        setLoading(true);
        const res = await api.get(`/checkout/por-cita/${idCita}`); 
        const dataLimpia = Array.isArray(res.data) ? res.data[0] : res.data;
        setOrden(dataLimpia);
      } catch (err) {
        console.error("Error cargando checkout:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrden();
  }, [idCita]);

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Cargando datos de DR. MOTORS...</div>;
  if (!orden) return <div className="p-10 text-center text-red-500 font-bold">No se encontró la orden para esta cita.</div>;

  // --- CONFIGURACIÓN DE URLS ---
  const BASE_URL = 'http://localhost:4000';
  const UPLOADS_URL = `${BASE_URL}/uploads/lavado`;
  const EVIDENCIAS_URL = `${BASE_URL}/uploads/evidencias`;
  const ORDENES_URL = `${BASE_URL}/uploads/ordenes`;
  const GESTION_URL = `${BASE_URL}/uploads/gestion`;

  // --- FILTRADO TÉCNICO ---
  const archivosGestion = (orden.gestion || []).filter(archivo => 
    archivo.startsWith('INS-') || archivo.startsWith('VID-')
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER DE ACCIONES */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black transition-colors font-semibold">
          <ArrowLeft size={20} className="mr-2" /> Volver
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => generarCotizacionPDF(orden)} // ✅ Llama a la nueva función
            className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-100 text-sm font-bold"
          >
            <Printer size={18} className="mr-2" /> Cotización
          </button>
          <button 
              onClick={() => generarReportePDF(orden)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-bold"
          >
              <FileText size={18} className="mr-2" /> Reporte
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 text-sm font-bold">
            <CheckCircle size={18} className="mr-2" /> Entregar Vehículo
          </button>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-[#1e293b] text-white p-6 rounded-t-2xl flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-black tracking-tight">DR. MOTORS</h1>
          <p className="text-blue-400 text-[10px] font-mono mt-1 uppercase">
            ORDEN: {orden.id?.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Estado: {orden.estado}
          </span>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold">
            Técnico: <span className="text-white">{orden.mecanico?.nombre || 'No asignado'}</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-8 shadow-xl rounded-b-2xl mb-8 border-x border-b">
        {/* INFO SUPERIOR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 border-b pb-8">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Cliente</p>
            <p className="font-bold text-gray-800 text-sm">{orden.cita?.vehiculo?.cliente?.nombres} {orden.cita?.vehiculo?.cliente?.apellidos}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Vehículo</p>
            <p className="font-bold text-gray-800 uppercase text-sm">
              {orden.cita?.vehiculo?.marca} {orden.cita?.vehiculo?.modelo} 
              <span className="bg-gray-100 border px-2 py-0.5 rounded ml-2 text-blue-600 font-mono text-xs">{orden.cita?.vehiculo?.placa}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Kilometraje / Comb.</p>
            <p className="font-bold text-gray-800 text-sm">{orden.kilometraje?.toLocaleString()} KM | {orden.nivelCombustible}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Servicio Realizado</p>
            <p className="font-bold text-blue-600 uppercase text-xs">{orden.cita?.servicio?.especialidad}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* IZQUIERDA: INVENTARIO + INSPECCIÓN */}
          <div className="col-span-12 lg:col-span-7">
            <h3 className="flex items-center font-bold text-gray-700 mb-4 uppercase text-[10px] tracking-widest">
              <ClipboardList className="mr-2 text-blue-500" size={16} /> Inventario de Recepción
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
              {Array.isArray(orden.inventario) ? (
                orden.inventario.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${item.estado ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <ClipboardList size={16} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-600 uppercase">{item.nombre}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${item.estado ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                      {item.estado ? "OK" : "NO"}
                    </span>
                  </div>
                ))
              ) : <p className="text-xs text-gray-400 italic">No hay inventario registrado.</p>}
            </div>

            {/* ✅ SECCIÓN INSPECCIÓN TÉCNICA DINÁMICA */}
            {/* ✅ SECCIÓN INSPECCIÓN TÉCNICA (DISEÑO DE TARJETAS SEGÚN JSON) */}
<h3 className="flex items-center font-bold text-gray-700 mb-6 uppercase text-[10px] tracking-widest">
  <CheckCircle className="mr-2 text-green-600" size={16} /> Inspección Técnica Detallada
</h3>

<div className="space-y-6">
  {(() => {
    // 1. Parseamos el JSON si viene como string, o usamos el objeto
    const inspeccionData = typeof orden.inspeccionTecnica === 'string' 
      ? JSON.parse(orden.inspeccionTecnica) 
      : (orden.inspeccionTecnica || {});

    if (Object.keys(inspeccionData).length === 0) {
      return <p className="text-[10px] text-gray-400 italic">No hay datos de inspección técnica cargados.</p>;
    }

    return Object.entries(inspeccionData).map(([sectorNombre, data], idx) => {
      const isOpen = seccionAbierta === sectorNombre;

      return (
        <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
          {/* CABECERA DEL SECTOR */}
          <div 
            onClick={() => setSeccionAbierta(isOpen ? null : sectorNombre)}
            className={`p-4 flex justify-between items-center cursor-pointer transition-all ${isOpen ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isOpen ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                <ClipboardList size={16}/>
              </div>
              <span className="font-black text-[11px] uppercase tracking-wider">SISTEMA: {sectorNombre}</span>
            </div>
            <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'opacity-40'}`} />
          </div>

          {/* CUERPO: GRILLA DE TARJETAS */}
          {isOpen && (
            <div className="p-6 bg-[#f8fafc]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.tareas?.map((t, tIdx) => {
                  // Lógica de colores para los badges
                  const colores = {
                    "OK": "bg-green-500 text-white",
                    "REGULAR": "bg-yellow-500 text-white",
                    "N/A": "bg-red-500 text-white",
                    "NO_TIENE": "bg-red-500 text-white"
                  };

                  return (
                    <div key={tIdx} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col h-full">
                      {/* Header de la tarjeta */}
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <span className="text-[9px] font-bold text-gray-700 leading-tight uppercase">{t.tarea}</span>
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${colores[t.estado] || 'bg-gray-400'}`}>
                          {t.estado}
                        </span>
                      </div>

                      {/* Imagen o Placeholder */}
                      <div className="relative flex-1 aspect-video rounded-lg overflow-hidden bg-gray-50 border border-dashed border-gray-200">
                        {t.foto ? (
                          <img 
                            src={`${GESTION_URL}/${t.foto}`} 
                            className="w-full h-full object-cover" 
                            alt={t.tarea} 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Camera size={16} className="text-gray-300 mb-1" />
                            <span className="text-[7px] text-gray-400 font-bold uppercase">No incluye imagen</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VIDEO DEL SECTOR (SI EXISTE) */}
              {data.video && (
                <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    Video de Evidencia del Sector
                  </p>
                  <div className="max-w-md mx-auto aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                    <video 
                      src={`${GESTION_URL}/${data.video}`} 
                      className="w-full h-full object-cover" 
                      controls 
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  })()}
</div>
          </div>

          {/* DERECHA: REGISTRO Y LAVADO */}
          <div className="col-span-12 lg:col-span-5">
            <h3 className="flex items-center font-bold text-gray-700 mb-4 uppercase text-[10px] tracking-widest">
              <Camera className="mr-2 text-blue-500" size={16} /> Fotos de Registro
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-10">
              {(() => {
                const llaveFotos = Object.keys(orden).find(key => 
                  Array.isArray(orden[key]) && orden[key].length > 0 && typeof orden[key][0] === 'string' && orden[key][0].startsWith('FOTO-')
                );
                const fotos = llaveFotos ? orden[llaveFotos] : [];
                return fotos.length > 0 ? fotos.map((f, i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img src={`${ORDENES_URL}/${f}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Registro" />
                  </div>
                )) : <div className="col-span-3 p-4 bg-gray-50 border border-dashed rounded-xl text-center text-[10px] text-gray-400 italic font-bold">Sin fotos de registro.</div>;
              })()}
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
               <div className="text-blue-700 font-black text-[10px] uppercase mb-4 flex items-center">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                 Control de Entrega y Lavado
               </div>
               <img 
                src={orden.cita?.lavado?.fotoFinal ? `${UPLOADS_URL}/${orden.cita.lavado.fotoFinal}` : 'https://via.placeholder.com/400x200?text=Sin+Foto+de+Lavado'} 
                className="w-full h-44 object-cover rounded-xl shadow-inner border border-white" alt="Lavado" 
               />
            </div>
          </div>
        </div>

        {/* EVIDENCIAS / HALLAZGOS */}
        <div className="mt-16 pt-10 border-t border-dashed">
          <h3 className="flex items-center font-black text-gray-800 mb-8 uppercase text-[11px] tracking-[0.2em]">Evidencias del Trabajo Realizado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orden.hallazgos?.map((item) => (
              <div key={item.id} className="group border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={(item.fotoInstalacion || item.foto) ? `${EVIDENCIAS_URL}/${item.fotoInstalacion || item.foto}` : 'https://via.placeholder.com/400x225?text=Sin+Evidencia'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.puntoFalla} 
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase">Listo</div>
                </div>
                <div className="p-5">
                  <h4 className="font-black text-gray-800 text-[11px] uppercase mb-1 tracking-tight">{item.puntoFalla}</h4>
                  <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2 font-medium">{item.descripcion || "Trabajo completado satisfactoriamente."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;