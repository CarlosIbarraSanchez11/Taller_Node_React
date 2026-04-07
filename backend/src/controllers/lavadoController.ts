import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { Storage } from '@google-cloud/storage';

const prisma = new PrismaClient();
const storage = new Storage();
const BUCKET_NAME = 'taller-dr-motors-storage';

export const getCitaParaLavado = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const cita = await prisma.cita.findUnique({
            where: { id: id },
            include: {
                vehiculo: true,
                ordenTrabajo: {
                    select: {
                        fotos: true, // Recuerda que en el Front esto ya apunta a la carpeta /recepcion
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
    const { id } = req.params; // ID de la cita
    const { checklist } = req.body; 
    const file = req.file;

    if (!file) return res.status(400).json({ error: "La foto de lavado es obligatoria" });

    // 1. 🏷️ Generamos el nombre del archivo
    const nombreArchivo = `LAVADO-${id}-${Date.now()}.jpg`;

    try {
        // 2. 📸 Procesamos con Sharp para obtener el BUFFER (RAM)
        const bufferProcesado = await sharp(file.buffer)
            .resize(1000, null, { withoutEnlargement: true })
            .jpeg({ quality: 70 })
            .toBuffer();

        // 3. ☁️ Subida directa a la carpeta 'lavado' en Google Cloud
        await storage.bucket(BUCKET_NAME)
            .file(`gestion-taller-node/lavado/${nombreArchivo}`)
            .save(bufferProcesado, {
                contentType: 'image/jpeg',
                resumable: false,
                metadata: { cacheControl: 'public, max-age=31536000' }
            });

        // 4. ⛓️ Transacción en la DB (Tu lógica se mantiene intacta)
        await prisma.$transaction([
            // Creamos el registro de Lavado
            prisma.lavado.create({
                data: {
                    citaId: id,
                    fotoFinal: nombreArchivo,
                    checklist: typeof checklist === 'string' ? JSON.parse(checklist) : checklist
                }
            }),
            // Actualizamos el estado de la cita
            prisma.cita.update({
                where: { id: id },
                data: { estado: 'POR ENTREGAR' } 
            })
        ]);

        res.json({ message: "¡Vehículo lavado y listo para entrega! ✨" });

    } catch (error: any) {
        console.error("❌ Error al finalizar lavado en la nube:", error.message);
        res.status(500).json({ error: "No se pudo procesar el final del lavado." });
    }
};