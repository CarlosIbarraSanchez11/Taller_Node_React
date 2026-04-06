import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const getCitaParaLavado = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const cita = await prisma.cita.findUnique({
            where: { id: id },
            include: {
                vehiculo: true,
                ordenTrabajo: {
                    select: {
                        fotos: true, // Para mostrar cómo llegó el carro
                        observaciones: true
                    }
                }
            }
        });

        if (!cita) return res.status(404).json({ error: "Cita no encontrada" });
        res.json(cita);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener datos de lavado" });
    }
};

export const finalizarLavado = async (req: Request, res: Response) => {
    const { id } = req.params; // Este es el id de la cita
    const { checklist } = req.body; // Viene como string desde el FormData
    const file = req.file;

    if (!file) return res.status(400).json({ error: "La foto de lavado es obligatoria" });

    // 1. Definimos nombre y ruta de la foto
    const nombreArchivo = `LAVADO-${id}-${Date.now()}.jpg`;
    const rutaCarpeta = path.join(__dirname, '../../uploads/lavado');
    const rutaFinal = path.join(rutaCarpeta, nombreArchivo);

    // Aseguramos que la carpeta existe (por si acaso)
    if (!fs.existsSync(rutaCarpeta)) {
        fs.mkdirSync(rutaCarpeta, { recursive: true });
    }

    try {
        // 2. Procesamos con Sharp (Compresión Pro)
        await sharp(file.buffer)
            .resize(1000) // Máximo 1000px de ancho
            .jpeg({ quality: 70 }) // Calidad para que pese esos ~80kb
            .toFile(rutaFinal);

        // 3. Transacción en la DB: Creamos el registro de Lavado y actualizamos la Cita
        await prisma.$transaction([
            // Creamos el registro en la tabla Lavado
            prisma.lavado.create({
                data: {
                    citaId: id,
                    fotoFinal: nombreArchivo,
                    checklist: JSON.parse(checklist) // Convertimos el string de vuelta a JSON
                }
            }),
            // Cambiamos el estado de la cita
            prisma.cita.update({
                where: { id: id },
                data: { estado: 'POR ENTREGAR' } // <--- Antes decía 'LISTO PARA ENTREGA'
            })
        ]);

        res.json({ message: "¡Vehículo lavado y listo para entrega! ✨" });

    } catch (error) {
        console.error("❌ Error al finalizar lavado:", error);
        res.status(500).json({ error: "No se pudo procesar el final del lavado." });
    }
};