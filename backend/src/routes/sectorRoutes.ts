import { Router } from 'express';
import { getSectores, createSector } from '../controllers/sectorController';

const router = Router();

router.get('/', getSectores);

router.post('/', createSector);

export default router;