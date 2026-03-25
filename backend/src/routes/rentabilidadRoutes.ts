import { Router } from 'express';
import * as rentCtrl from '../controllers/rentabilidadController';

const router = Router();

// No necesitamos :id porque el controlador siempre usará el ID 1
router.get('/', rentCtrl.getRentabilidad);
router.put('/', rentCtrl.updateRentabilidad);

export default router;