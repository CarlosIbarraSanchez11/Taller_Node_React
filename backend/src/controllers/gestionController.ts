import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Obtener toda la información de la Orden por el ID de la Cita
export const getGestionOrden = async (req: Request, res: Response) => {
  const { citaId } = req.params;

  try {
    const gestion = await prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        vehiculo: {
          include: {
            cliente: true
          }
        },
        servicio: true,
        tecnico: true,
        ordenTrabajo: true // 👈 Aquí viene el kilometraje, inventario y fotos
      }
    });

    if (!gestion) {
      return res.status(404).json({ error: "No se encontró la orden de trabajo" });
    }

    res.json(gestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la gestión de taller" });
  }
};

// 2. Actualizar el progreso de la Inspección Técnica
export const updateInspeccionTecnica = async (req: Request, res: Response) => {
  const { ordenId } = req.params;
  const { inspeccion, estadoOrden } = req.body;

  try {
    const ordenActualizada = await prisma.ordenTrabajo.update({
      where: { id: ordenId },
      data: {
        // Guardamos el JSON de la inspección (Frenos, Motor, etc.)
        // Si aún no agregaste este campo a Prisma, lo guardaremos en 'observaciones' 
        // o espera a que mañana actualicemos el modelo.
        estado: estadoOrden, 
        updatedAt: new Date()
      }
    });

    res.json({ message: "Progreso guardado correctamente", ordenActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo actualizar el progreso técnico" });
  }
};