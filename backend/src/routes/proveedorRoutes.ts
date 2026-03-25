import { Router } from 'express';
import * as provCtrl from '../controllers/proveedorController';

const router = Router();

router.get('/', provCtrl.getProveedores);
router.post('/', provCtrl.createProveedor);
router.put('/:id', provCtrl.updateProveedor);
router.delete('/:id', provCtrl.deleteProveedor);

export default router;