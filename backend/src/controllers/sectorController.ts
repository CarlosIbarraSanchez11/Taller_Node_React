import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSectores = async (req: Request, res: Response) => {
  const sectores = await prisma.sector.findMany({ orderBy: { nombre: 'asc' } });
  res.json(sectores);
};

export const createSector = async (req: Request, res: Response) => {
  const { nombre } = req.body;
  try {
    const nuevo = await prisma.sector.create({
      data: { nombre: nombre.toUpperCase() }
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: 'El sector ya existe o es inválido' });
  }
};