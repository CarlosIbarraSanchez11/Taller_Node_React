import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Ruta rápida para obtener todos los talleres
router.get('/', async (req, res) => {
  try {
    const talleres = await prisma.taller.findMany();
    res.json(talleres);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener talleres" });
  }
});

export default router;