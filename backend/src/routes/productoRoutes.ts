import { Router } from 'express';
import { 
  getProductos, 
  getProductoById,
  createProducto, 
  updateProducto, 
  deleteProducto,
  buscarParaEntregaKit
} from '../controllers/productoController';

const router = Router();

router.get('/buscar-kit', buscarParaEntregaKit);

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;