import { Router } from 'express';
import multer from 'multer';
// Importamos las funciones del controlador (asegúrate de crearlas en el siguiente paso)
import { getCitaParaLavado, finalizarLavado } from '../controllers/lavadoController';

const router = Router();

// 1. Configuramos el "Recepcionista" (Multer) aquí mismo
// Usamos memoryStorage para que la foto no ocupe espacio antes de pasar por Sharp
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB por si acaso
});

// 2. RUTA PARA OBTENER DATOS (Placa, modelo y fotos de recepción)
// GET: http://localhost:4000/api/lavado/:id
router.get('/:id', getCitaParaLavado);

router.patch('/:id/finalizar', upload.single('foto_final'), finalizarLavado);

export default router;