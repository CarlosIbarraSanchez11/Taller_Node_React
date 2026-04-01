import { Router } from 'express';
import { getGestionOrden, updateInspeccionTecnica } from '../controllers/gestionController';

const router = Router();

// Obtener info completa para el panel de gestión
router.get('/:citaId', getGestionOrden);

// Actualizar progreso de la orden
router.put('/actualizar/:ordenId', updateInspeccionTecnica);

export default router;