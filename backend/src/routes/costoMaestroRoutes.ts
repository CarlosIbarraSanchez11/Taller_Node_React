import { Router } from 'express';
import { 
  getCostosMaestros, 
  upsertCostoMaestro, 
} from '../controllers/costoMaestroController';

const router = Router();

router.get('/', getCostosMaestros);
router.post('/save', upsertCostoMaestro);

export default router;