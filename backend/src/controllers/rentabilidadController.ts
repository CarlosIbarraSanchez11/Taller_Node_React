// backend/src/controllers/rentabilidadController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRentabilidad = async (_req: Request, res: Response) => {
  try {
    // Buscamos la configuración única (ID: 1)
    let config = await prisma.rentabilidad.findUnique({ where: { id: 1 } });
    
    // Si no existe (primera vez), devolvemos valores en 0
    if (!config) {
      config = await prisma.rentabilidad.create({ data: { id: 1 } });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener rentabilidad" });
  }
};

export const updateRentabilidad = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // Limpiamos el ID para que no choque
    delete data.id; 

    const actualizado = await prisma.rentabilidad.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data }
    });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar matriz" });
  }
};