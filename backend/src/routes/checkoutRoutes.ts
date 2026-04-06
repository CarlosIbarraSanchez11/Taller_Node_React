import { Router } from 'express';
import { getCheckoutByCita } from '../controllers/checkoutController';

const router = Router();

// GET /api/checkout/clw123abc (usando cuid)
router.get('/por-cita/:idCita', getCheckoutByCita);

export default router;