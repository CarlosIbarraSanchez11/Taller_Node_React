import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const crearOrdenDesdeRecepcion = async (req: Request, res: Response) => {
  try {
    const { 
      citaId, 
      mecanicoId, 
      kilometraje, 
      nivelCombustible, 
      inventario, 
      observaciones,
      gradoAceite,
      marcaAceiteSugerida
    } = req.body;

    // 📸 Procesamiento de Imágenes con Sharp
    const files = req.files as Express.Multer.File[];
    const nombresFotos: string[] = [];
    const directory = 'uploads/ordenes/';

    // 📁 Aseguramos que la carpeta exista
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    if (files && files.length > 0) {
      // Usamos Promise.all para procesar todas las fotos en paralelo (más rápido)
      await Promise.all(
        files.map(async (file) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const nombreArchivo = `FOTO-${uniqueSuffix}.jpg`;
          const rutaFinal = path.join(directory, nombreArchivo);

          await sharp(file.buffer)
            .rotate() 
            .resize(1200, null, { withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 70, progressive: true }) 
            .toFile(rutaFinal);

          nombresFotos.push(nombreArchivo);
        })
      );
    }

    // ⛓️ Transacción de Base de Datos
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Creamos la Orden de Trabajo con los nombres de archivos comprimidos
      const nuevaOrden = await tx.ordenTrabajo.create({
        data: {
          citaId,
          mecanicoId: Number(mecanicoId),
          kilometraje: Number(kilometraje),
          nivelCombustible,
          gradoAceite,
          marcaAceiteSugerida,
          inventario: typeof inventario === 'string' ? JSON.parse(inventario) : inventario,
          observaciones,
          fotos: nombresFotos, // ["FOTO-123.jpg", "FOTO-456.jpg"]
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
      message: "Orden de trabajo abierta y fotos optimizadas",
      orden: resultado
    });

  } catch (error) {
    console.error("Error al abrir orden:", error);
    res.status(500).json({ error: "No se pudo procesar la recepción del vehículo" });
  }
};