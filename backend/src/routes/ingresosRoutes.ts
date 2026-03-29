import { Router } from 'express';
import { crearIngreso, obtenerIngresos } from '../controllers/ingresosController';

const router = Router();

// 🚀 RUTA PARA GUARDAR (La que ya tenías)
router.post('/', crearIngreso);

// 🚀 RUTA PARA LEER (La que te faltaba y causa el error)
router.get('/', obtenerIngresos);

export default router;