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
        // 🚀 CAMBIA 'true' POR ESTO:
        ordenTrabajo: {
          include: {
            hallazgos: {
              include: { costoMaestro: true } 
            }
          }
        },
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

export const crearHallazgoIndependiente = async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    const { costoMaestroId, cantidad, precioVenta, nombre, descripcion } = req.body;
    const file = req.file;

    try {
        let nombreFoto = null;
        if (file) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            nombreFoto = `HAL-${uniqueSuffix}.jpg`;
            await sharp(file.buffer)
                .rotate().resize(1200).jpeg({ quality: 70 })
                .toFile(path.join('uploads/gestion/', nombreFoto));
        }

        const nuevoHallazgo = await prisma.hallazgo.create({
            data: {
                ordenId,
                costoMaestroId: Number(costoMaestroId),
                puntoFalla: nombre,
                descripcion: descripcion,
                cantidad: Number(cantidad),
                precioVenta: Number(precioVenta),
                total: Number(cantidad) * Number(precioVenta),
                foto: nombreFoto,
                estado: "POR ENVIAR"
            },
            include: { costoMaestro: true }
        });

        res.json(nuevoHallazgo);
    } catch (error) {
        res.status(500).json({ error: "Error al crear hallazgo" });
    }
};

export const buscarProductosMaestro = async (req: Request, res: Response) => {
    const { q } = req.query; // Lo que escribe el mecánico
    try {
        const productos = await prisma.costoMaestro.findMany({
            where: {
                OR: [
                    { nombre: { contains: String(q) } },
                    { categoria: { contains: String(q) } },
                    { marca: { contains: String(q) } }
                ]
            },
            take: 10
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar productos" });
    }
};

export const enviarPresupuestoWhatsApp = async (req: Request, res: Response) => {
    const { ordenId } = req.params;

    try {
        // 1. Actualizamos todos los hallazgos de esta orden que estén "POR ENVIAR"
        await prisma.hallazgo.updateMany({
            where: { ordenId, estado: "POR ENVIAR" },
            data: { estado: "ENVIADO" }
        });

        // 2. Construimos el link (Usamos localhost para tus pruebas)
        // En producción esto sería https://dr-car.com/aprobacion/ORDEN_ID
        const linkAprobacion = `http://localhost:5173/aprobacion/${ordenId}`;

        // 3. Simulación de Whapi (Aquí iría tu axios.post a Whapi)
        console.log(`🚀 Enviando WhatsApp al cliente con el link: ${linkAprobacion}`);

        res.json({ 
            message: "Presupuesto enviado al cliente",
            linkEnviado: linkAprobacion 
        });
    } catch (error) {
        res.status(500).json({ error: "Error al enviar presupuesto" });
    }
};

export const getHallazgosPublicos = async (req: Request, res: Response) => {
    const { ordenId } = req.params;
    try {
        const hallazgos = await prisma.hallazgo.findMany({
            where: { ordenId },
            include: { costoMaestro: true }
        });
        res.json(hallazgos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar presupuesto" });
    }
};

export const responderHallazgo = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { estado } = req.body; // Recibe 'SOLICITADO' o 'RECHAZADO'

    try {
        // 1. Actualizamos el hallazgo e incluimos la orden para sacar el tallerId
        const hallazgoActualizado = await prisma.hallazgo.update({
            where: { id },
            data: { estado },
            include: { 
                orden: {
                    include: {
                        cita: true // 👈 Entramos a la cita para sacar el taller y el mecánico
                    }
                } 
            }
        });

        // 2. 📦 SI EL CLIENTE APROBÓ, DISPARAMOS EL PEDIDO AL ALMACÉN
        if (estado === 'SOLICITADO') {
            const codigoPedido = `PED-${Date.now().toString().slice(-7)}`;

            await prisma.pedido.create({
                data: {
                    codigo: codigoPedido,
                    hallazgoId: hallazgoActualizado.id,
                    costoMaestroId: hallazgoActualizado.costoMaestroId!, 
                    cantidad: hallazgoActualizado.cantidad,
                    
                    // 🏢 TALLER DESTINO (El que necesita el repuesto)
                    tallerId: Number(hallazgoActualizado.orden.cita.tallerId),
                    
                    // 🚀 LA PIEZA QUE FALTA: TALLER ORIGEN (El que debe despachar)
                    // Si tu Almacén Central es el ID 1, pon 1. 
                    // Si quieres que le llegue al de logística del mismo taller, usa el mismo tallerId.
                    tallerOrigenId: Number(hallazgoActualizado.orden.cita.tallerId), 
                    
                    usuarioId: hallazgoActualizado.orden.cita.tecnicoId, 
                    tipo: 'CLIENTE',
                    estado: 'SOLICITADO_POR_CLIENTE'
                }
            });
        }
        res.json(hallazgoActualizado);
    } catch (error) {
        console.error("Error en responderHallazgo:", error);
        res.status(500).json({ error: "No se pudo procesar la respuesta del cliente" });
    }
};

export const subirEvidenciaInstalacion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "No se recibió imagen" });

        // 📂 Carpeta dedicada: backend/uploads/evidencias/
        const directory = 'uploads/evidencias/';
        if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

        const nombreArchivo = `INSTALACION-${Date.now()}-${id}.jpg`;
        const rutaFinal = path.join(directory, nombreArchivo);

        // 📸 Procesamos con Sharp para que no rompa el disco
        await sharp(file.buffer)
            .resize(1000, null, { withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 70 })
            .toFile(rutaFinal);

        // 🎯 Actualizamos en la DB
        const hallazgo = await prisma.hallazgo.update({
            where: { id: id },
            data: { 
                fotoInstalacion: nombreArchivo,
                estado: 'INSTALADO' // 👈 Pasa de RECIBIDO a INSTALADO automáticamente
            }
        });

        res.json(hallazgo);
    } catch (error: any) {
        console.error("❌ Error evidencia:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🗑️ FUNCIÓN 2: ELIMINAR EVIDENCIA
export const eliminarEvidenciaInstalacion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Limpiamos el campo y regresamos el estado a RECIBIDO
        await prisma.hallazgo.update({
            where: { id: id },
            data: { 
                fotoInstalacion: null,
                estado: 'RECIBIDO' 
            }
        });

        res.json({ message: "Evidencia eliminada" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};