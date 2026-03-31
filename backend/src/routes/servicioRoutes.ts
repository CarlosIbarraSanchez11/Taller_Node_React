import { Router } from 'express';
import { 
  createServicio, 
  getServicios, 
  getServicioById, 
  updateServicio, 
  deleteServicio 
} from '../controllers/servicioController';

const router = Router();

router.get('/', getServicios);
router.get('/:id', getServicioById);
router.post('/', createServicio);
router.put('/:id', updateServicio);
router.delete('/:id', deleteServicio);

export default router;