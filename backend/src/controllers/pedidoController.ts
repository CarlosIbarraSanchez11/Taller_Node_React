import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. CREAR UN NUEVO PEDIDO (Mantenemos la creación inicial)
export const crearPedido = async (req: Request, res: Response) => {
  const { costoMaestroId, cantidad, tallerId, tallerOrigenId, usuarioId } = req.body;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const tallerDestino = await tx.taller.findUnique({
        where: { id: Number(tallerId) }
      });

      const nombreSolicitante = tallerDestino 
        ? `Solicitante: ${tallerDestino.nombre}` 
        : "Taller Solicitante";

      const codigo = `PED-${Date.now().toString().slice(-7)}`;

      const nuevoPedido = await tx.pedido.create({
        data: {
          codigo,
          cantidad: Number(cantidad),
          estado: "PENDIENTE",
          solicitante: nombreSolicitante,
          costoMaestroId: Number(costoMaestroId),
          tallerId: Number(tallerId),
          usuarioId: Number(usuarioId) || 4,
          tallerOrigenId: Number(tallerOrigenId)
        }
      });

      await tx.ingresoStock.create({
        data: {
          tipo: "INTERNO",
          motivo: "TRANSFERENCIA",
          cantidad: Number(cantidad),
          estado: "SOLICITADO", 
          costoMaestroId: Number(costoMaestroId),
          tallerId: Number(tallerId),
          tallerOrigenId: Number(tallerOrigenId),
          usuarioId: Number(usuarioId) || 4,
          // 💡 Sugerencia: Si puedes, añade pedidoId a tu modelo de IngresoStock
          // pedidoId: nuevoPedido.id 
        }
      });

      return nuevoPedido;
    });

    res.status(201).json({ data: resultado });
  } catch (error) {
    console.error("❌ ERROR EN TRANSACCIÓN:", error);
    res.status(500).json({ error: "Fallo al crear pedido" });
  }
};

// 2. OBTENER PEDIDOS (Mantenemos tu lógica de filtros)
export const obtenerPedidos = async (req: Request, res: Response) => {
  const { tallerId, rol } = req.query;

  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        ...( (rol === 'ADMIN' || rol === 'GERENTE') 
          ? {} 
          : { tallerOrigenId: Number(tallerId) } 
        )
      },
      include: {
        costoMaestro: true,
        taller: true,       // Taller que solicita (Destino)
        tallerOrigen: true, // 🚀 ¡ESTA ES LA CLAVE! Agrégalo para que no falle el include
        usuario: { select: { nombre: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pedidos);
  } catch (error) {
    console.error("Error al refrescar pedidos:", error);
    res.status(500).json({ error: "Fallo al obtener la lista de pedidos" });
  }
};

// 3. ACTUALIZAR ESTADO (Aquí es donde ocurre la magia de la sincronización)
export const actualizarEstadoPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nuevoEstado, motivoRechazo, usuarioId } = req.body; 

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({ where: { id: Number(id) } });
      if (!pedido) throw new Error("Pedido no encontrado");

      // --- 🚛 LÓGICA DE DESPACHO ---
      if (nuevoEstado === "DESPACHADO") {
        await tx.producto.update({
          where: {
            costoMaestroId_tallerId: {
              tallerId: pedido.tallerOrigenId!,
              costoMaestroId: pedido.costoMaestroId
            }
          },
          data: { stockActual: { decrement: pedido.cantidad } }
        });

        await tx.ingresoStock.updateMany({
          where: {
            costoMaestroId: pedido.costoMaestroId,
            tallerId: pedido.tallerId,
            tallerOrigenId: pedido.tallerOrigenId,
            estado: "SOLICITADO"
          },
          data: { estado: "EN CAMINO" }
        });

        await tx.ingresoStock.create({
          data: {
            tipo: "INTERNO",
            motivo: "SALIDA_TRANSFERENCIA",
            cantidad: Number(pedido.cantidad) * -1,
            estado: "TRANSFERIDO",
            costoMaestroId: pedido.costoMaestroId,
            tallerId: pedido.tallerOrigenId!,
            tallerOrigenId: pedido.tallerId,
            usuarioId: Number(usuarioId) || 4 
          }
        });
      }

      // --- ✅ LÓGICA DE ENTREGA ---
      if (nuevoEstado === "ENTREGADO") {
        await tx.producto.upsert({
          where: { costoMaestroId_tallerId: { tallerId: pedido.tallerId, costoMaestroId: pedido.costoMaestroId } },
          update: { stockActual: { increment: pedido.cantidad } },
          create: { tallerId: pedido.tallerId, costoMaestroId: pedido.costoMaestroId, stockActual: pedido.cantidad }
        });

        await tx.ingresoStock.updateMany({
          where: { costoMaestroId: pedido.costoMaestroId, tallerId: pedido.tallerId, tallerOrigenId: pedido.tallerOrigenId, estado: "EN CAMINO" },
          data: { estado: "APROBADO" }
        });
      }

      // --- ❌ LÓGICA DE RECHAZO ---
      if (nuevoEstado === "RECHAZADO") {
        // 🚀 Sincronizamos el historial para que pase a gris/tachado
        await tx.ingresoStock.updateMany({
          where: {
            costoMaestroId: pedido.costoMaestroId,
            tallerId: pedido.tallerId,
            estado: "SOLICITADO",
            tipo: "INTERNO"
          },
          data: { estado: "RECHAZADO" }
        });
      }

      // 🎯 UPDATE ÚNICO DEL PEDIDO (Consolidado al final)
      return await tx.pedido.update({
        where: { id: Number(id) },
        data: {
          estado: nuevoEstado,
          // Guardamos el motivo si existe, si no, un texto por defecto
          observaciones: motivoRechazo || (nuevoEstado === "RECHAZADO" ? "Pedido rechazado" : null)
        }
      });
    });

    res.json({ data: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el flujo logístico" });
  }
};