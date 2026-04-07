import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import { generarReportePDF } from '../utils/GenerarReportePDF';
import { generarCotizacionPDF } from '../utils/GenerarCotizacionPDF';
import { 
  ArrowLeft, Printer, FileText, Download, CheckCircle, 
  ChevronDown, Camera, ClipboardList 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idCita = searchParams.get('id_cita'); 
  
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState(null);

  // --- ☁️ CONFIGURACIÓN DE URLS DE GOOGLE CLOUD STORAGE ---
  const CLOUD_BASE = 'https://storage.googleapis.com/taller-dr-motors-storage/gestion-taller-node';
  const URL_LAVADO = `${CLOUD_BASE}/lavado`;
  const URL_EVIDENCIAS = `${CLOUD_BASE}/evidencias`;
  const URL_RECEPCION = `${CLOUD_BASE}/recepcion`; // Antes era /ordenes
  const URL_INSPECCION = `${CLOUD_BASE}/inspeccion`; // Antes era /gestion
  const URL_HALLAZGOS = `${CLOUD_BASE}/hallazgos`; // Carpeta para hallazgos manuales

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

  const handleEntregarVehiculo = async () => {
      // 🛡️ Confirmación de seguridad
      const confirmar = window.confirm("¿Está seguro de marcar el vehículo como ENTREGADO? Esta acción cerrará la orden.");
      
      if (!confirmar) return;

      try {
          // PATCH: Llamamos al nuevo endpoint
          await api.patch(`/checkout/entregar/${idCita}`);
          
          toast.success("¡Vehículo entregado! El ciclo ha concluido. 🏎️✨");
          
          // Redirigimos al dashboard o lista de citas
          navigate('/citas'); 
      } catch (error) {
          console.error("Error al entregar:", error);
          toast.error("Hubo un problema al procesar la entrega.");
      }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Cargando datos de DR. MOTORS...</div>;
  if (!orden) return <div className="p-10 text-center text-red-500 font-bold">No se encontró la orden para esta cita.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER DE ACCIONES */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black font-semibold">
          <ArrowLeft size={20} className="mr-2" /> Volver
        </button>
        <div className="flex gap-3">
          <button onClick={() => generarCotizacionPDF(orden)} className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-100 text-sm font-bold">
            <Printer size={18} className="mr-2" /> Cotización
          </button>
          <button onClick={() => generarReportePDF(orden)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 text-sm font-bold">
            <FileText size={18} className="mr-2" /> Reporte
          </button>
          <button 
              onClick={handleEntregarVehiculo}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 text-sm font-bold transition-transform active:scale-95"
          >
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 border-b pb-8">
          <div><p className="text-[10px] text-gray-400 uppercase font-black mb-1">Cliente</p><p className="font-bold text-gray-800 text-sm">{orden.cita?.vehiculo?.cliente?.nombres} {orden.cita?.vehiculo?.cliente?.apellidos}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase font-black mb-1">Vehículo</p><p className="font-bold text-gray-800 uppercase text-sm">{orden.cita?.vehiculo?.marca} {orden.cita?.vehiculo?.modelo} <span className="bg-gray-100 border px-2 py-0.5 rounded ml-2 text-blue-600 font-mono text-xs">{orden.cita?.vehiculo?.placa}</span></p></div>
          <div><p className="text-[10px] text-gray-400 uppercase font-black mb-1">Kilometraje / Comb.</p><p className="font-bold text-gray-800 text-sm">{orden.kilometraje?.toLocaleString()} KM | {orden.nivelCombustible}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase font-black mb-1">Servicio Realizado</p><p className="font-bold text-blue-600 uppercase text-xs">{orden.cita?.servicio?.especialidad}</p></div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* IZQUIERDA: INVENTARIO + INSPECCIÓN */}
          <div className="col-span-12 lg:col-span-7">
            <h3 className="flex items-center font-bold text-gray-700 mb-4 uppercase text-[10px] tracking-widest"><ClipboardList className="mr-2 text-blue-500" size={16} /> Inventario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
              {Array.isArray(orden.inventario) ? orden.inventario.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3"><span className="text-[11px] font-bold text-gray-600 uppercase">{item.nombre}</span></div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md ${item.estado ? 'text-green-600' : 'text-red-600'}`}>{item.estado ? "OK" : "NO"}</span>
                </div>
              )) : <p className="text-xs text-gray-400 italic">No hay inventario.</p>}
            </div>

            <h3 className="flex items-center font-bold text-gray-700 mb-6 uppercase text-[10px] tracking-widest"><CheckCircle className="mr-2 text-green-600" size={16} /> Inspección Técnica</h3>
            <div className="space-y-6">
              {(() => {
                const inspeccionData = typeof orden.inspeccionTecnica === 'string' ? JSON.parse(orden.inspeccionTecnica) : (orden.inspeccionTecnica || {});
                return Object.entries(inspeccionData).map(([sectorNombre, data], idx) => {
                  const isOpen = seccionAbierta === sectorNombre;
                  return (
                    <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div onClick={() => setSeccionAbierta(isOpen ? null : sectorNombre)} className={`p-4 flex justify-between items-center cursor-pointer transition-all ${isOpen ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}>
                        <span className="font-black text-[11px] uppercase">SISTEMA: {sectorNombre}</span>
                        <ChevronDown size={20} className={isOpen ? 'rotate-180' : 'opacity-40'} />
                      </div>
                      {isOpen && (
                        <div className="p-6 bg-[#f8fafc]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {data.tareas?.map((t, tIdx) => (
                              <div key={tIdx} className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col h-full">
                                <span className="text-[9px] font-bold text-gray-700 mb-2 uppercase">{t.tarea}</span>
                                <div className="relative flex-1 aspect-video rounded-lg overflow-hidden bg-gray-50">
                                  {t.foto ? (
                                    <img src={`${URL_INSPECCION}/${t.foto}`} className="w-full h-full object-cover" alt={t.tarea} onError={(e) => e.target.src='https://via.placeholder.com/150'} />
                                  ) : <Camera size={16} className="text-gray-300 m-auto" />}
                                </div>
                              </div>
                            ))}
                          </div>
                          {data.video && (
                            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
                              <video src={`${URL_INSPECCION}/${data.video}`} className="w-full max-w-md mx-auto rounded-xl shadow-lg" controls />
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
            <h3 className="flex items-center font-bold text-gray-700 mb-4 uppercase text-[10px] tracking-widest"><Camera className="mr-2 text-blue-500" size={16} /> Registro de Recepción</h3>
            <div className="grid grid-cols-3 gap-2 mb-10">
              {(() => {
                const fotos = Array.isArray(orden.fotos) ? orden.fotos : [];
                return fotos.length > 0 ? fotos.map((f, i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                    <img src={`${URL_RECEPCION}/${f}`} className="w-full h-full object-cover" alt="Registro" />
                  </div>
                )) : <p className="text-[10px] text-gray-400">Sin fotos de registro.</p>;
              })()}
            </div>

            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
               <div className="text-blue-700 font-black text-[10px] uppercase mb-4 tracking-widest">Evidencia de Lavado Final</div>
               <img src={orden.cita?.lavado?.fotoFinal ? `${URL_LAVADO}/${orden.cita.lavado.fotoFinal}` : 'https://via.placeholder.com/400x200?text=Sin+Lavado'} className="w-full h-44 object-cover rounded-xl shadow-inner border border-white" alt="Lavado" />
            </div>
          </div>
        </div>

        {/* EVIDENCIAS DE TRABAJO */}
        <div className="mt-16 pt-10 border-t border-dashed">
          <h3 className="flex items-center font-black text-gray-800 mb-8 uppercase text-[11px] tracking-widest">Evidencias del Trabajo Realizado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {orden.hallazgos?.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                <div className="relative h-44">
                  {/* Lógica: Si hay fotoInstalacion va a /evidencias, si es foto manual va a /hallazgos */}
                  <img 
                    src={item.fotoInstalacion 
                      ? `${URL_EVIDENCIAS}/${item.fotoInstalacion}` 
                      : item.foto 
                        ? `${URL_HALLAZGOS}/${item.foto}` 
                        : 'https://via.placeholder.com/400x225?text=Sin+Imagen'} 
                    className="w-full h-full object-cover" 
                    alt={item.puntoFalla} 
                  />
                  <div className={`absolute top-4 right-4 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase ${item.fotoInstalacion ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {item.fotoInstalacion ? 'Instalado' : 'Detectado'}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-black text-gray-800 text-[11px] uppercase mb-1">{item.puntoFalla}</h4>
                  <p className="text-gray-500 text-[10px] line-clamp-2">{item.descripcion || "Trabajo completado."}</p>
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