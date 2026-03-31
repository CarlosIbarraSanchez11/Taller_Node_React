import { Router } from 'express';
import { crearCita, getCitas } from '../controllers/citaController';

const router = Router();

router.post('/', crearCita);
router.get('/', getCitas);

export default router;