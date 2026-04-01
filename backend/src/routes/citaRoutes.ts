import { Router } from 'express';
import { crearCita, getCitas, getCitaById } from '../controllers/citaController';

const router = Router();

router.post('/', crearCita);
router.get('/', getCitas);
router.get('/:id', getCitaById);

export default router;