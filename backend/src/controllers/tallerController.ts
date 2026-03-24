import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerTalleres = async (_req: Request, res: Response) => {
  try {
    const talleres = await prisma.taller.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(talleres);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de talleres' });
  }
};
