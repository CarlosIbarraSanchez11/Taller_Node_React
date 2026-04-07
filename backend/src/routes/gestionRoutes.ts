import { Router } from 'express';
import multer from 'multer';
import { 
    getGestionOrden, 
    updateInspeccionTecnica, 
    buscarProductosMaestro, 
    crearHallazgoIndependiente, 
    enviarPresupuestoWhatsApp, 
    getHallazgosPublicos, 
    getSeguimientoPublico,
    responderHallazgo, 
    subirEvidenciaInstalacion, 
    eliminarEvidenciaInstalacion, 
    terminarTrabajo 
} from '../controllers/gestionController';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { 
        fileSize: 100 * 1024 * 1024, // 🚀 Aumentamos a 100MB por si el video es pesado
        fieldSize: 10 * 1024 * 1024  // Para campos de texto grandes
    } 
});

router.put('/actualizar/:ordenId', upload.any(), updateInspeccionTecnica);
router.post('/hallazgo/:ordenId', upload.single('foto_hallazgo'), crearHallazgoIndependiente);
router.get('/buscar-maestro', buscarProductosMaestro);
router.get('/:citaId', getGestionOrden);
router.post('/enviar-presupuesto/:ordenId', enviarPresupuestoWhatsApp);
router.get('/publico/seguimiento/:ordenId', getSeguimientoPublico);
router.get('/publico/hallazgos/:ordenId', getHallazgosPublicos);
router.put('/publico/responder-hallazgo/:id', responderHallazgo);
router.patch('/hallazgos/:id/evidencia', upload.single('foto'), subirEvidenciaInstalacion);
router.patch('/hallazgos/:id/evidencia-eliminar', eliminarEvidenciaInstalacion);
router.patch('/terminar-trabajo/:id', terminarTrabajo);

export default router;