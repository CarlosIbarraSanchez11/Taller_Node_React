import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { 
  FileText, Hammer, Droplets, Banknote, 
  Play, X, Eye, EyeOff 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Citas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [citas, setCitas] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [filtroTaller, setFiltroTaller] = useState(user?.tallerId || '');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [mostrarCancelados, setMostrarCancelados] = useState(false);

  // Estados para el Modal de Asignación
  const [modalAsignar, setModalAsignar] = useState(null); 
  const [tecnicosTaller, setTecnicosTaller] = useState([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);

  // Permisos de Seguridad
  const esAdminOGerente = user?.rol === 'Admin' || user?.rol === 'Gerente';
  const puedeAccionar = ['Admin', 'Gerente', 'Jefe Mecánico'].includes(user?.rol);

  const fetchTalleres = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/talleres');
      setTalleres(res.data);
    } catch (err) { console.error("Error cargando talleres:", err); }
  };

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const tId = esAdminOGerente ? filtroTaller : user?.tallerId;
      const res = await axios.get(`http://localhost:4000/api/citas`, {
        params: { tallerId: tId, fecha: fecha, rol: user?.rol }
      });
      setCitas(res.data);
    } catch (err) { console.error("Error cargando citas:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) {
      fetchCitas();
      if (esAdminOGerente && talleres.length === 0) fetchTalleres();
    }
  }, [user, fecha, filtroTaller]);

  const abrirAsignarEquipo = async (cita) => {
    setModalAsignar(cita);
    setTecnicoSeleccionado(cita.tecnicoId); 
    try {
      const res = await axios.get(`http://localhost:4000/api/usuarios`, {
        params: { tallerId: cita.tallerId, rol: 'Mecánico' }
      });
      setTecnicosTaller(res.data);
    } catch (err) { console.error(err); }
  };

  const handleArchivar = async (id) => {
    if (window.confirm("¿Deseas archivar esta cita? Pasará al historial.")) {
      try {
        await axios.put(`http://localhost:4000/api/citas/${id}`, { estado: 'ARCHIVADO' });
        toast.success("Cita enviada al historial");
        fetchCitas();
      } catch (err) { toast.error("Error al archivar"); }
    }
  };

  const handleCancelar = async (id) => {
    const motivo = window.prompt("¿Por qué motivo desea cancelar la cita?");
    if (motivo === null) return; 

    try {
      await axios.patch(`http://localhost:4000/api/citas/cancelar/${id}`);
      toast.success("Cita y Orden canceladas con éxito");
      fetchCitas();
    } catch (err) {
      toast.error("No se pudo cancelar la cita");
    }
  };

  const confirmarYRecepcionar = () => {
    navigate(`/recepcion?id_cita=${modalAsignar.id}&id_tecnico=${tecnicoSeleccionado}`);
  };

  // Lógica de filtrado para la tabla
  const citasFiltradas = citas.filter(c => 
    mostrarCancelados 
      ? true 
      : (c.estado !== 'CANCELADO' && c.estado !== 'ARCHIVADO' && c.estado !== 'CONCLUIDO')
  );

  return (
    <Layout tituloNavbar="Agenda de Citas">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Agenda de Servicios</h1>
            <p className="text-gray-500 text-sm">Control de ingresos y tiempos de bahía</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Switch para ver cancelados */}
            <button 
              onClick={() => setMostrarCancelados(!mostrarCancelados)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                mostrarCancelados 
                  ? 'bg-red-50 text-red-600 border-red-200' 
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              {mostrarCancelados ? <EyeOff size={14}/> : <Eye size={14}/>}
              {mostrarCancelados ? 'Ocultar Cancelados y Concluidos' : 'Ver Cancelados y Concluidos'}
            </button>

            {esAdminOGerente && (
              <select 
                value={filtroTaller} 
                onChange={(e) => setFiltroTaller(e.target.value)}
                className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Vista Global</option>
                {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            )}
            <input 
              type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* TABLA DE CITAS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Horario</th>
                <th className="px-4 py-3">Vehículo / Cliente</th>
                <th className="px-4 py-3">Servicio Solicitado</th>
                <th className="px-4 py-3">Técnico</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && citasFiltradas.map((cita) => (
                <tr key={cita.id} className={`transition-colors ${
                    cita.estado === 'ARCHIVADO' ? 'opacity-50 grayscale-[0.5]' : 'hover:bg-gray-50'
                  }`}>
                  <td className={`px-4 py-4 font-bold ${cita.estado === 'CONCLUIDO' || cita.estado === 'CANCELADO' ? 'text-gray-400' : 'text-gray-700'}`}>
                    🕒 {cita.hora_inicio} - {cita.hora_fin}
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm font-bold ${cita.estado === 'CONCLUIDO' || cita.estado === 'CANCELADO' ? 'text-gray-400' : 'text-gray-800'}`}>
                      {cita.vehiculoPlaca}
                    </div>
                    <div className="text-[11px] text-gray-400 uppercase">
                      {cita.vehiculo?.modelo} | {cita.vehiculo?.cliente?.apellidos}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className={`text-[12px] font-bold ${cita.estado === 'CONCLUIDO' || cita.estado === 'CANCELADO' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {cita.servicio?.nombre}
                      </span>
                      <span className="text-[10px] text-blue-400 font-medium uppercase">{cita.servicio?.especialidad}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-4 text-sm ${cita.estado === 'CONCLUIDO' || cita.estado === 'CANCELADO' ? 'text-gray-300' : 'text-gray-600'}`}>
                    • {cita.tecnico?.nombre || 'No asignado'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm border ${
                        cita.estado === 'PENDIENTE' 
                          ? 'bg-orange-100 text-orange-600 border-orange-200' : 
                        cita.estado === 'EN LAVADO' 
                          ? 'bg-cyan-100 text-cyan-600 border-cyan-200' :
                        cita.estado === 'POR ENTREGAR' 
                          ? 'bg-sky-500 text-white border-sky-600' :
                        // 🔘 AGRUPAMOS CONCLUIDO Y ARCHIVADO EN GRIS
                        (cita.estado === 'CONCLUIDO' || cita.estado === 'ARCHIVADO') 
                          ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-60' :
                        cita.estado === 'CANCELADO' 
                          ? 'bg-red-100 text-red-600 border-red-200' :
                        'bg-green-100 text-green-600 border-green-200' // Este queda solo para 'EN PROCESO'
                    }`}>
                        {cita.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      
                      {/* ACCIÓN SEGÚN ESTADO */}
                      {cita.estado === 'PENDIENTE' && (
                        <button 
                          onClick={() => abrirAsignarEquipo(cita)}
                          disabled={!puedeAccionar}
                          className="w-8 h-8 rounded-full border text-green-500 border-green-100 hover:bg-green-50 flex items-center justify-center shadow-sm"
                          title="Iniciar Recepción"
                        > <Play size={14} fill="currentColor" /> </button>
                      )}

                      {cita.estado === 'EN PROCESO' && (
                        <button 
                          onClick={() => navigate(`/gestion-taller?id_cita=${cita.id}`)}
                          className="w-8 h-8 rounded-full border border-blue-100 text-blue-500 flex items-center justify-center hover:bg-blue-50"
                          title="Gestionar Orden Técnica"
                        > <Hammer size={14} /> </button>
                      )}

                      {cita.estado === 'EN LAVADO' && (
                        <button 
                          onClick={() => navigate(`/lavado?id_cita=${cita.id}`)}
                          className="w-8 h-8 rounded-full border border-cyan-100 text-cyan-500 flex items-center justify-center hover:bg-cyan-50 animate-pulse"
                          title="Control de Lavado"
                        > <Droplets size={14} /> </button>
                      )}

                      {(cita.estado === 'POR ENTREGAR' || cita.estado === 'CONCLUIDO') && (
                        <button 
                          onClick={() => navigate(`/checkout?id_cita=${cita.id}`)} 
                          className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm transition-colors ${
                            cita.estado === 'POR ENTREGAR' 
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                              : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                          }`}
                          title={cita.estado === 'POR ENTREGAR' ? "Generar Reporte y Cobro" : "Ver Reporte Final"}
                        > 
                          {cita.estado === 'POR ENTREGAR' ? <Banknote size={14} /> : <FileText size={14} />} 
                        </button>
                      )}

                      {/* BOTÓN X (CANCELAR O ARCHIVAR) */}
                      {cita.estado !== 'CONCLUIDO' && cita.estado !== 'CANCELADO' && (
                        <button 
                          onClick={() => {
                            cita.estado === 'PENDIENTE' ? handleCancelar(cita.id) : handleArchivar(cita.id)
                          }}
                          disabled={!puedeAccionar}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                            puedeAccionar 
                              ? 'text-red-400 border-red-100 hover:bg-red-50' 
                              : 'text-gray-200 border-gray-50 cursor-not-allowed'
                          }`}
                          title={cita.estado === 'PENDIENTE' ? "Cancelar Cita" : "Archivar Cita"}
                        > <X size={14} /> </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="py-10 text-center text-gray-400 italic">Sincronizando motores...</div>}
          {!loading && citasFiltradas.length === 0 && (
            <div className="py-10 text-center text-gray-400">No hay citas para mostrar en esta fecha.</div>
          )}
        </div>
      </div>

      {/* MODAL ASIGNACIÓN */}
      {modalAsignar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <span className="text-blue-600 text-2xl">👥</span> Asignar Equipo
                </h3>
                <button onClick={() => setModalAsignar(null)} className="text-gray-400 hover:text-black"><X size={20}/></button>
              </div>
              <p className="text-gray-500 text-sm mb-4">Seleccione al técnico responsable de la recepción:</p>
              <div className="space-y-3 max-h-80 overflow-y-auto mb-6 pr-2">
                {tecnicosTaller.map(tec => (
                  <div 
                    key={tec.id} onClick={() => setTecnicoSeleccionado(tec.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      tecnicoSeleccionado === tec.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tecnicoSeleccionado === tec.id ? 'border-blue-500' : 'border-gray-300'}`}>
                        {tecnicoSeleccionado === tec.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{tec.nombre}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-black">{tec.rol}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={confirmarYRecepcionar} 
                disabled={!tecnicoSeleccionado}
                className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all ${
                  tecnicoSeleccionado 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirmar Equipo y Recepcionar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Citas;