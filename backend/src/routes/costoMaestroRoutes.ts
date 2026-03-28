import { Router } from 'express';
import { getCostosMaestros, upsertCostoMaestro } from '../controllers/costoMaestroController';

const router = Router();

// 📊 Obtener la lista agrupada de productos con sus costos maestros
router.get('/', getCostosMaestros);

// 💾 Guardar o Actualizar una configuración de costo (Upsert)
// Se usa POST porque el cliente envía los datos para "procesar" el guardado
router.post('/save', upsertCostoMaestro);

export default router;