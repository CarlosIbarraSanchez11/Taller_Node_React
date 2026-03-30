import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. CREAR INGRESO (Carga inicial, Compra o Solicitud Interna)
export const crearIngreso = async (req: Request, res: Response) => {
  const { 
    tallerId, 
    usuarioId, 
    items, 
    tipo, 
    motivo, 
    proveedorId, 
    tallerOrigenId, 
    estado 
  } = req.body;

  // Si es transferencia interna, empieza como SOLICITADO. Si es compra/carga, APROBADO.
  const estadoFinal = estado || (tipo === "INTERNO" ? "SOLICITADO" : "APROBADO");
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
            estado: estadoFinal,
            
            // 1. Relaciones Obligatorias (Siempre usar connect)
            costoMaestro: { connect: { id: Number(item.costoMaestroId) } },
            taller:       { connect: { id: Number(tallerId) } },
            usuario:      { connect: { id: idParaPrisma } },

            // 2. Relaciones Opcionales (Solo si el ID existe)
            // 🚀 IMPORTANTE: Usamos el nombre de la relación 'tallerOrigen', NO el ID 'tallerOrigenId'
            ...(tallerOrigenId ? { 
              tallerOrigen: { connect: { id: Number(tallerOrigenId) } } 
            } : {}),

            ...(proveedorId ? { 
              proveedor: { connect: { id: Number(proveedorId) } } 
            } : {})
          }
        });

        // B. ACTUALIZAR STOCK REAL (Solo si entra como APROBADO)
        // Nota: Si es "SOLICITADO", el stock no se toca hasta que se reciba.
        if (estadoFinal === "APROBADO") {
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
      message: estadoFinal === "SOLICITADO" ? "Solicitud enviada al otro taller" : "Stock registrado", 
      data: resultado 
    });

  } catch (error) {
    console.error("❌ ERROR EN CREAR INGRESO:", error);
    res.status(500).json({ error: "Fallo al registrar el ingreso" });
  }
};

// 2. OBTENER HISTORIAL (Con sedes de origen para transferencias)
export const obtenerIngresos = async (req: Request, res: Response) => {
  const { tallerId } = req.query;

  try {
    const ingresos = await prisma.ingresoStock.findMany({
      where: {
        ...(tallerId ? { tallerId: Number(tallerId) } : {})
      },
      include: {
        taller: true,        // Sede que recibe
        tallerOrigen: true,  // 🚀 Sede que envía (Clave para transferencias)
        costoMaestro: true,  // Datos del producto
        proveedor: true,     
        usuario: { select: { nombre: true } }
      },
      orderBy: [
        { createdAt: 'desc' },
        { cantidad: 'desc' }
      ]
    });

    res.json(ingresos);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar el historial" });
  }
};

// 3. 🚀 NUEVO: RECIBIR TRANSFERENCIA (Confirmar llegada)
// Esta es la función que llama el botón de "Confirmar Recepción" en el frontend
export const actualizarEstadoIngreso = async (req: Request, res: Response) => {
  const { id } = req.params; // ID del IngresoStock
  const { nuevoEstado } = req.body; // Debería ser 'APROBADO'

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Buscamos el ingreso actual
      const ingreso = await tx.ingresoStock.findUnique({ 
        where: { id: Number(id) } 
      });

      if (!ingreso) throw new Error("Movimiento no encontrado");

      // 2. Si confirmamos recepción (Pasamos de EN CAMINO a APROBADO)
      if (nuevoEstado === "APROBADO") {
        // A. Sumamos stock al taller destino
        await tx.producto.upsert({
          where: {
            costoMaestroId_tallerId: {
              tallerId: ingreso.tallerId,
              costoMaestroId: ingreso.costoMaestroId
            }
          },
          update: { stockActual: { increment: ingreso.cantidad } },
          create: {
            tallerId: ingreso.tallerId,
            costoMaestroId: ingreso.costoMaestroId,
            stockActual: ingreso.cantidad
          }
        });

        // B. 🔄 SINCRONIZACIÓN CON PEDIDOS
        // Buscamos el pedido relacionado que está "DESPACHADO" y lo cerramos
        await tx.pedido.updateMany({
          where: {
            costoMaestroId: ingreso.costoMaestroId,
            tallerId: ingreso.tallerId,
            tallerOrigenId: ingreso.tallerOrigenId,
            estado: "DESPACHADO"
          },
          data: { estado: "ENTREGADO" }
        });
      }

      // 3. Actualizamos el registro de ingreso
      return await tx.ingresoStock.update({
        where: { id: Number(id) },
        data: { estado: nuevoEstado }
      });
    });

    res.json({ message: "Recepción confirmada y stock actualizado", data: resultado });
  } catch (error) {
    console.error("❌ ERROR AL RECIBIR:", error);
    res.status(500).json({ error: "No se pudo procesar la recepción" });
  }
};