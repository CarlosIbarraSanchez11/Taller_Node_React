import { Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export const getGestionOrden = async (req: Request, res: Response) => {
  const { citaId } = req.params;

  try {
    const gestion = await prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        vehiculo: { include: { cliente: true } },
        tecnico: true,
        ordenTrabajo: true,
        servicio: {
          include: {
            pasos: {
              orderBy: { orden: 'asc' },
              include: { sector: true }
            }
          }
        }
      }
    });

    if (!gestion) return res.status(404).json({ error: "Orden no encontrada" });

    let inspeccionActual = gestion.ordenTrabajo?.inspeccionTecnica;

    // Si es la primera vez, armamos el objeto con soporte para video por sector
    if (!inspeccionActual && gestion.servicio?.pasos) {
      const plantilla: any = {};
      // 🔍 Detectamos si es diagnóstico
      const esDiag = gestion.servicio.especialidad === 'DIAGNOSTICO';

      gestion.servicio.pasos.forEach((p) => {
          // 🚀 Si es diagnóstico, ignoramos p.sector.nombre y usamos "GENERAL"
          const nombreSector = esDiag ? "GENERAL" : (p.sector?.nombre || "GENERAL");
          
          if (!plantilla[nombreSector]) {
              plantilla[nombreSector] = {
                  tareas: [],
                  video: null
              };
          }

          plantilla[nombreSector].tareas.push({
              id: p.id,
              tarea: p.descripcion,
              estado: "PENDIENTE",
              foto: null
          });
      });
      inspeccionActual = plantilla;
    }

    res.json({ ...gestion, inspeccionActual });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener gestión" });
  }
};

export const updateInspeccionTecnica = async (req: Request, res: Response) => {
    const { ordenId } = req.params;

    try {
        console.log("--- 🛠️ INICIO DE SINCRONIZACIÓN ---");
        
        if (!req.body.inspeccion) throw new Error("Datos de inspección no recibidos");

        const inspeccion = JSON.parse(req.body.inspeccion);
        const archivos = req.files as Express.Multer.File[] || [];
        const directory = 'uploads/gestion/';

        if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

        for (const file of archivos) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            
            // 📸 PROCESAR FOTOS
            if (file.fieldname.startsWith('foto_')) {
                const [, sectorKey, pointId] = file.fieldname.split('_');
                if (!inspeccion[sectorKey]) continue;

                const nombreArchivo = `INS-${uniqueSuffix}.jpg`;
                await sharp(file.buffer)
                    .rotate()
                    .resize(1200)
                    .jpeg({ quality: 70 })
                    .toFile(path.join(directory, nombreArchivo));

                const punto = inspeccion[sectorKey].tareas.find((t: any) => t.id === Number(pointId));
                if (punto) punto.foto = nombreArchivo;
            }

            // 🎥 PROCESAR VIDEOS
            if (file.fieldname.startsWith('video_')) {
                const sectorKey = file.fieldname.split('_')[1];
                if (!inspeccion[sectorKey]) continue;

                const nombreVideo = `VID-${uniqueSuffix}.mp4`;
                const rutaTemporal = path.join(directory, `temp-${nombreVideo}`);
                const rutaFinal = path.join(directory, nombreVideo);

                fs.writeFileSync(rutaTemporal, file.buffer);

                try {
                    console.log(`⏳ Comprimiendo video: ${sectorKey}`);
                    await new Promise<void>((resolve, reject) => {
                        ffmpeg(rutaTemporal)
                            .outputOptions([
                                '-vcodec libx264',
                                '-crf 28', // Calidad balanceada
                                '-preset superfast',
                                '-movflags +faststart'
                            ])
                            .size('720x?') 
                            .on('end', () => {
                                if (fs.existsSync(rutaTemporal)) fs.unlinkSync(rutaTemporal);
                                resolve();
                            })
                            .on('error', (err) => reject(err))
                            .save(rutaFinal);
                    });
                    inspeccion[sectorKey].video = nombreVideo;
                } catch (error) {
                    console.error("⚠️ Falló compresión, usando original");
                    if (fs.existsSync(rutaTemporal)) fs.renameSync(rutaTemporal, rutaFinal);
                    inspeccion[sectorKey].video = nombreVideo;
                }
            }
        }

        // 📈 RECALCULAR PROGRESO (Regla: N/A o (Estado + Foto))
        let totalPuntos = 0;
        let completados = 0;
        Object.values(inspeccion).forEach((sec: any) => {
            sec.tareas.forEach((t: any) => {
                totalPuntos++;
                if (t.estado === 'N/A' || (['OK', 'REG.', 'MAL'].includes(t.estado) && t.foto)) {
                    completados++;
                }
            });
        });

        const progresoFinal = totalPuntos > 0 ? Math.round((completados / totalPuntos) * 100) : 0;

        // 💾 ACTUALIZAR BASE DE DATOS
        const ordenActualizada = await prisma.ordenTrabajo.update({
            where: { id: ordenId },
            data: {
                inspeccionTecnica: inspeccion,
                progreso: progresoFinal,
                estado: progresoFinal === 100 ? 'PRESUPUESTO' : 'INSPECCION'
            }
        });

        console.log(`✅ Éxito. Progreso final: ${progresoFinal}%`);
        // Devolvemos la orden completa para que el Frontend se sincronice al 100%
        res.json({ message: "Sincronizado", ordenActualizada });

    } catch (error: any) {
        console.error("--- ❌ ERROR ---", error.message);
        res.status(500).json({ error: error.message });
    }
};