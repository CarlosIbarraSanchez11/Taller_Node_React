import { Router } from 'express';
import { getVehiculoByPlaca, getVehiculosFull } from '../controllers/vehiculoController';

const router = Router();

router.get('/', getVehiculosFull);
router.get('/:placa', getVehiculoByPlaca);

export default router;