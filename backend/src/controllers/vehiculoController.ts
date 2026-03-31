import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Buscar vehículo por placa (Muy útil para el buscador de tu tabla)
export const getVehiculoByPlaca = async (req: Request, res: Response) => {
  const { placa } = req.params;
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { placa: placa.toUpperCase() },
      include: { 
        cliente: true, // Traemos al dueño
        citas: true    // Traemos su historial
      }
    });

    if (!vehiculo) return res.status(404).json({ error: "Vehículo no encontrado" });
    
    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el vehículo" });
  }
};

// Listar todos los vehículos con sus dueños
export const getVehiculosFull = async (req: Request, res: Response) => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      include: { cliente: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar vehículos" });
  }
};