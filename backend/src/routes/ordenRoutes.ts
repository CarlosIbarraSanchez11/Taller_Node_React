import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { crearOrdenDesdeRecepcion } from '../controllers/ordenController';

const router = Router();

// Configuración de Multer para guardar fotos localmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ⚠️ Asegúrate de crear esta carpeta manualmente: backend/uploads/ordenes
    cb(null, 'uploads/ordenes/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `FOTO-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB por foto
});

// Cambiamos la ruta para aceptar hasta 10 fotos con el nombre de campo 'fotos'
router.post('/', upload.array('fotos', 10), crearOrdenDesdeRecepcion);

export default router;