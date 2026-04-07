import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { Storage } from '@google-cloud/storage'; // 👈 Cambiamos fs/path por Storage

const prisma = new PrismaClient();
const storage = new Storage(); // Google buscará tus credenciales automáticamente
const BUCKET_NAME = 'taller-dr-motors-storage';

export const crearOrdenDesdeRecepcion = async (req: Request, res: Response) => {
  try {
    const { 
      citaId, mecanicoId, kilometraje, nivelCombustible, 
      inventario, observaciones, gradoAceite, marcaAceiteSugerida 
    } = req.body;

    // 📸 [IMÁGENES PARA CLOUD STORAGE]
    const files = req.files as Express.Multer.File[];
    const nombresFotos: string[] = [];

    if (files && files.length > 0) {
      await Promise.all(
        files.map(async (file) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const nombreArchivo = `FOTO-${uniqueSuffix}.jpg`;
          
          // 1. Procesamos con Sharp para obtener el BUFFER
          const bufferProcesado = await sharp(file.buffer)
            .rotate()
            .resize(1200, null, { withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 70, progressive: true })
            .toBuffer(); 

          // 2. Ruta exacta: gestion-taller-node/recepcion/
          await storage.bucket(BUCKET_NAME)
            .file(`gestion-taller-node/recepcion/${nombreArchivo}`)
            .save(bufferProcesado, {
              contentType: 'image/jpeg',
              resumable: false,
              metadata: { cacheControl: 'public, max-age=31536000' }
            });

          nombresFotos.push(nombreArchivo);
        })
      );
    }

    // ⛓️ [TRANSACCIÓN DE BASE DE DATOS]
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Buscamos la cita y su kit
      const citaConServicio = await tx.cita.findUnique({
        where: { id: citaId },
        include: { servicio: { include: { kit: true } } }
      });

      if (!citaConServicio) throw new Error("Cita no encontrada");

      console.log("-----------------------------------------");
      console.log(`🔎 BUSCANDO KIT PARA SERVICIO ID: ${citaConServicio.servicioId}`);
      console.log(`📦 NOMBRE SERVICIO: ${citaConServicio.servicio.especialidad}`);
      console.log(`📊 ITEMS ENCONTRADOS EN EL KIT: ${citaConServicio.servicio.kit?.length || 0}`);
      console.log("-----------------------------------------");

      // 2. Creamos la Orden de Trabajo
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
          fotos: nombresFotos,
          estado: 'RECIBIDO'
        }
      });

      // 🚀 3. EL PASO QUE FALTABA: Carga Automática de Hallazgos (Kit)
      const kitBase = citaConServicio.servicio.kit;
      if (kitBase && kitBase.length > 0) {
        // Usamos for...of para poder usar el ID del hallazgo en el pedido
        for (const insumo of kitBase) {
          
          // A. Creamos el Hallazgo para el Mecánico
          const nuevoHallazgo = await tx.hallazgo.create({
            data: {
              ordenId: nuevaOrden.id,
              puntoFalla: insumo.descripcion.toUpperCase(),
              descripcion: "MATERIAL DE KIT",
              cantidad: Math.round(insumo.cantidad),
              precioVenta: 0,
              total: 0,
              estado: 'SOLICITADO' // Esto es para la vista del mecánico
            }
          });

          // B. ⚡ CREAMOS EL PEDIDO PARA JHON (Logística)
          await tx.pedido.create({
            data: {
              // Generamos un código único para Jhon
              codigo: `KIT-${nuevaOrden.id.slice(-5)}-${Math.floor(Math.random() * 1000)}`,
              
              // 🚨 IMPORTANTE: Estos valores activan tus filtros de Jhon
              tipo: 'KIT', 
              estado: 'SOLICITADO_POR_KIT', 
              
              cantidad: Math.round(insumo.cantidad),
              tallerId: citaConServicio.tallerId,
              
              // Usamos el ID 1 (Genérico) por ahora. 
              // Jhon elegirá el real (Mobil, Castrol, etc.) en su modal.
              costoMaestroId: 1, 
              
              hallazgoId: nuevoHallazgo.id, // Vinculamos ambos mundos
              usuarioId: Number(mecanicoId),
              solicitante: "SISTEMA (KIT AUTOMÁTICO)",
              observaciones: `Insumo base para la placa: ${citaConServicio.vehiculoPlaca}`
            }
          });
        }
      }

      // 4. Actualizamos la Cita
      await tx.cita.update({
        where: { id: citaId },
        data: { tecnicoId: Number(mecanicoId), estado: 'EN PROCESO' }
      });

      return nuevaOrden;
    });

    res.status(201).json({
      message: "Orden abierta y Kit Base solicitado automáticamente",
      orden: resultado
    });

  } catch (error) {
    console.error("❌ Error al abrir orden:", error);
    res.status(500).json({ error: "Fallo en la recepción" });
  }
};