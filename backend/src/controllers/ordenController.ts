import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearOrdenDesdeRecepcion = async (req: Request, res: Response) => {
  try {
    const { 
      citaId, 
      mecanicoId, 
      kilometraje, 
      nivelCombustible, 
      inventario, // Esto llega como String desde FormData
      observaciones,
      gradoAceite,
      marcaAceiteSugerida
    } = req.body;

    // 📸 Extraemos los nombres de los archivos que Multer guardó
    const files = req.files as Express.Multer.File[];
    const nombresFotos = files ? files.map(f => f.filename) : [];

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Creamos la Orden de Trabajo
      const nuevaOrden = await tx.ordenTrabajo.create({
        data: {
          citaId,
          mecanicoId: Number(mecanicoId),
          kilometraje: Number(kilometraje),
          nivelCombustible,
          gradoAceite,
          marcaAceiteSugerida,
          // ⚠️ IMPORTANTE: Parseamos el inventario porque FormData lo envía como string
          inventario: typeof inventario === 'string' ? JSON.parse(inventario) : inventario,
          observaciones,
          fotos: nombresFotos, // Guardamos el array de nombres de archivos ["FOTO-1.jpg", ...]
          estado: 'RECIBIDO'
        }
      });

      // 2. Actualizamos la Cita
      await tx.cita.update({
        where: { id: citaId },
        data: {
          tecnicoId: Number(mecanicoId),
          estado: 'EN PROCESO'
        }
      });

      return nuevaOrden;
    });

    res.status(201).json({
      message: "Orden de trabajo abierta correctamente",
      orden: resultado
    });

  } catch (error) {
    console.error("Error al abrir orden:", error);
    res.status(500).json({ error: "No se pudo procesar la recepción del vehículo" });
  }
};