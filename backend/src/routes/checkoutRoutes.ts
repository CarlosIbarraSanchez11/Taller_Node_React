import { Router } from 'express';
import { 
    getCheckoutByCita, 
    entregarVehiculo
} from '../controllers/checkoutController';

const router = Router();

router.get('/por-cita/:idCita', getCheckoutByCita);

router.patch('/entregar/:idCita', entregarVehiculo);

export default router;