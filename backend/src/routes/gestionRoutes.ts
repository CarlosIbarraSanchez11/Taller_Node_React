import { Router } from 'express';
import multer from 'multer';
import { getGestionOrden, updateInspeccionTecnica, buscarProductosMaestro } from '../controllers/gestionController';

const router = Router();

// 1. Configuramos el almacenamiento en memoria (RAM)
// Esto es vital para que Sharp pueda procesar las fotos antes de guardarlas en el disco
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { 
        fileSize: 100 * 1024 * 1024, // 🚀 Aumentamos a 100MB por si el video es pesado
        fieldSize: 10 * 1024 * 1024  // Para campos de texto grandes
    } 
});

// 2. Ruta para obtener la información inicial
router.get('/:citaId', getGestionOrden);

// 3. 🚀 RUTA CLAVE: Agregamos 'upload.any()'
// Usamos .any() porque los nombres de las fotos son dinámicos (ej: foto_frenos_1, foto_motor_5)
router.put('/actualizar/:ordenId', upload.any(), updateInspeccionTecnica);
router.get('/productos/buscar', buscarProductosMaestro);

export default router;