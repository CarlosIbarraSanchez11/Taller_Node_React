import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCheckoutByCita = async (req: Request, res: Response) => {
    try {
        const { idCita } = req.params;
        console.log("Buscando orden para la cita ID:", idCita); // <--- LOG 1

        const orden = await prisma.ordenTrabajo.findUnique({
  // Nota: Si usas idCita para buscar, asegúrate de que el campo sea 'citaId'
  where: { citaId: idCita }, 
  include: {
    mecanico: true,
    cita: {
      include: {
        vehiculo: {
          include: { cliente: true }
        },
        servicio: {
          include: {
            // ✅ Nombre correcto según tu prisma: 'pasos'
            pasos: {
              include: { sector: true }
            }
          }
        },
        lavado: true
      }
    },
    hallazgos: true
  }
});

        console.log("Resultado de Prisma:", orden); // <--- LOG 2

        if (!orden) {
            return res.status(404).json({ message: "No se encontró la orden en la DB" });
        }

        return res.json(orden);
    } catch (error) {
        console.error("Error en el controlador:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};