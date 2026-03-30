import { Router } from 'express';
// 💡 Usamos importación por nombre para evitar errores de "undefined"
import { 
  crearPedido, 
  obtenerPedidos, 
  actualizarEstadoPedido 
} from '../controllers/pedidoController';

const router = Router();

// 🚀 Línea 7 (donde probablemente te marcaba el error)
router.post('/', crearPedido);

router.get('/', obtenerPedidos);

router.patch('/:id/estado', actualizarEstadoPedido);

export default router;