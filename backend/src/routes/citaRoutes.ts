import { Router } from 'express';
import { 
    crearCita, 
    getCitas, 
    getCitaById, 
    cancelarCita,
    updateCita
} from '../controllers/citaController';

const router = Router();

router.post('/', crearCita);
router.get('/', getCitas);
router.get('/:id', getCitaById);
router.patch('/cancelar/:id', cancelarCita);

router.put('/:id', updateCita); 

export default router;