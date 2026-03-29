import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearIngreso = async (req: Request, res: Response) => {
  // 1. Extraemos los nuevos campos: estado y tallerOrigenId
  const { 
    tallerId, 
    usuarioId, 
    items, 
    tipo, 
    motivo, 
    proveedorId, 
    tallerOrigenId, 
    estado // Este vendrá como 'SOLICITADO' o 'APROBADO'
  } = req.body;

  console.log("📥 PROCESANDO OPERACIÓN:", { tipo, motivo, estado, tallerOrigenId });

  const idParaPrisma = Number(usuarioId) || 4;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const movimientosProcesados = [];

      for (const item of items) {
        // A. CREAR EL REGISTRO DE MOVIMIENTO
        const nuevoMovimiento = await tx.ingresoStock.create({
          data: {
            tipo: tipo || "CON_RUC",
            motivo: motivo || "CARGA_INICIAL",
            cantidad: Number(item.cantidad),
            estado: estado || "APROBADO",
            
            // 🔗 ESTAS RELACIONES SÍ USAN CONNECT (porque están bien definidas en tu schema)
            costoMaestro: { connect: { id: Number(item.costoMaestroId) } },
            taller:       { connect: { id: Number(tallerId) } },
            usuario:      { connect: { id: idParaPrisma } },

            // 🚀 AQUÍ EL CAMBIO: Usamos el ID directamente como sugiere el error
            tallerOrigenId: tallerOrigenId ? Number(tallerOrigenId) : null,

            ...(proveedorId && { 
              proveedor: { connect: { id: Number(proveedorId) } } 
            })
          }
        });

        // B. ACTUALIZAR STOCK CONDICIONAL
        // 🚀 Solo sumamos stock inmediatamente si la operación ya está APROBADA
        // Si está 'SOLICITADO', el stock no se mueve hasta que el taller origen despache.
        if (estado === "APROBADO") {
          await tx.producto.upsert({
            where: {
              costoMaestroId_tallerId: {
                tallerId: Number(tallerId),
                costoMaestroId: Number(item.costoMaestroId)
              }
            },
            update: { stockActual: { increment: Number(item.cantidad) } },
            create: {
              tallerId: Number(tallerId),
              costoMaestroId: Number(item.costoMaestroId),
              stockActual: Number(item.cantidad),
              stockMin: 5
            }
          });
        }

        movimientosProcesados.push(nuevoMovimiento);
      }
      return movimientosProcesados;
    });

    res.status(201).json({ 
      message: estado === "SOLICITADO" ? "Pedido registrado correctamente" : "Stock actualizado con éxito", 
      data: resultado 
    });

  } catch (error) {
    console.error("❌ ERROR EN OPERACIÓN LOGÍSTICA:", error);
    res.status(500).json({ error: "Fallo en la transacción", details: error });
  }
};

export const obtenerIngresos = async (req: Request, res: Response) => {
  try {
    const ingresos = await prisma.ingresoStock.findMany({
      include: {
        taller: true,        // 🚀 Traemos el nombre de la sede
        costoMaestro: true,  // 🚀 Traemos el nombre y marca del repuesto
        proveedor: true,     // 🚀 Traemos la razón social si existe
        usuario: true        // 🚀 Quién hizo el movimiento
      },
      orderBy: {
        createdAt: 'desc'    // 🚀 Los más recientes primero
      }
    });

    res.json(ingresos);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ error: "No se pudo cargar el historial de ingresos" });
  }
};