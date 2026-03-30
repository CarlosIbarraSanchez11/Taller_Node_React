import { Router } from 'express';
import { 
  crearIngreso, 
  obtenerIngresos, 
  actualizarEstadoIngreso // 👈 1. Importa la nueva función
} from '../controllers/ingresosController';

const router = Router();

// RUTA PARA GUARDAR (Cargas iniciales / Compras)
router.post('/', crearIngreso);

// RUTA PARA LEER (Historial)
router.get('/', obtenerIngresos);

// 🚀 2. RUTA PARA ACTUALIZAR (La que soluciona el error del botón verde)
// El ":id" es obligatorio para saber qué ingreso estamos aprobando
router.patch('/:id', actualizarEstadoIngreso);

export default router;