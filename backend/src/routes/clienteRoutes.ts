import { Router } from 'express';
import { registrarClienteYVehiculo, getClientes } from '../controllers/clienteController';

const router = Router();

router.post('/', registrarClienteYVehiculo); // El prefijo /clientes se pone en el index
router.get('/', getClientes);

export default router;