import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. CREAR UN NUEVO PEDIDO (Mantenemos la creación inicial)
export const crearPedido = async (req: Request, res: Response) => {
  const { 
    costoMaestroId, 
    cantidad, 
    tallerId, 
    tallerOrigenId, 
    usuarioId, 
    tipo, // 🚀 'CLIENTE' o 'TRANSFERENCIA'
    placa, 
    solicitante 
  } = req.body;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Obtenemos el nombre del taller para el campo solicitante si no viene uno
      const tallerDestino = await tx.taller.findUnique({
        where: { id: Number(tallerId) }
      });

      const nombreSolicitante = solicitante || (tallerDestino 
        ? `Taller: ${tallerDestino.nombre}` 
        : "Solicitante General");

      const codigo = `PED-${Date.now().toString().slice(-7)}`;

      // 2. CREAR EL PEDIDO
      const nuevoPedido = await tx.pedido.create({
        data: {
          codigo,
          cantidad: Number(cantidad),
          estado: "PENDIENTE",
          
          // 🚀 CORRECCIÓN AQUÍ: Aseguramos que solo mande valores válidos del Enum
          tipo: tipo === "CLIENTE" ? "CLIENTE" : "TRANSFERENCIA", 
          
          placa: placa || null,
          solicitante: nombreSolicitante,
          costoMaestroId: Number(costoMaestroId),
          tallerId: Number(tallerId),
          usuarioId: Number(usuarioId) || 4,
          tallerOrigenId: tallerOrigenId ? Number(tallerOrigenId) : null
        }
      });

      // 3. REGISTRAR EN EL HISTORIAL (IngresoStock)
      // Nota: Si es pedido, se crea como "SOLICITADO" (cantidad positiva porque es lo que esperamos que llegue)
      await tx.ingresoStock.create({
        data: {
          tipo: tipo === "CLIENTE" ? "VENTA" : "INTERNO", 
          motivo: tipo === "CLIENTE" ? "VENTA_CLIENTE" : "TRANSFERENCIA",
          
          // 🚀 DINÁMICO: Aquí usamos la cantidad que viene del req.body
          cantidad: Number(cantidad), 
          
          estado: "SOLICITADO", 
          costoMaestroId: Number(costoMaestroId),
          tallerId: Number(tallerId),
          tallerOrigenId: tallerOrigenId ? Number(tallerOrigenId) : null,
          usuarioId: Number(usuarioId) || 4
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
      where: { /* tus filtros */ },
      include: {
        costoMaestro: true,
        taller: true,
        tallerOrigen: true,
        usuario: { select: { nombre: true } },
        hallazgo: true // 🚀 ESTE ES EL QUE TRAE "ACEITE DE MOTOR"
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: "Fallo al obtener la lista de pedidos" });
  }
};

// 3. ACTUALIZAR ESTADO (Sincronización Total)
export const actualizarEstadoPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nuevoEstado, motivoRechazo, usuarioId, costoMaestroIdReal } = req.body; 

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({ 
        where: { id: Number(id) },
        include: { hallazgo: true } 
      });
      if (!pedido) throw new Error("Pedido no encontrado");

      const idFinalProducto = costoMaestroIdReal ? Number(costoMaestroIdReal) : pedido.costoMaestroId;

      // --- 🚛 1. LÓGICA DE DESPACHO ---
      if (nuevoEstado === "DESPACHADO") {
        // A. Restamos stock en el taller origen (Taller 1)
        await tx.producto.update({
          where: { costoMaestroId_tallerId: { 
            tallerId: pedido.tallerOrigenId || pedido.tallerId, 
            costoMaestroId: pedido.costoMaestroId 
          } },
          data: { stockActual: { decrement: pedido.cantidad } }
        });

        // B. Registramos la SALIDA en el historial
        await tx.ingresoStock.create({
          data: {
            tipo: "SALIDA",
            motivo: "TRANSFERENCIA_SALIDA",
            cantidad: -Math.abs(pedido.cantidad),
            estado: "DESPACHADO",
            costoMaestroId: pedido.costoMaestroId,
            tallerId: pedido.tallerOrigenId || pedido.tallerId,
            usuarioId: usuarioId || 4
          }
        });

        // 🚀 FIX: Actualizamos el registro de SOLICITUD original a DESPACHADO
        // Esto quita el "SOLICITADO" naranja y lo pone en "EN CAMINO" azul
        await tx.ingresoStock.updateMany({
          where: {
            tallerId: pedido.tallerId,         // Taller 2 (Destino)
            costoMaestroId: pedido.costoMaestroId,
            motivo: "TRANSFERENCIA",           // El registro de entrada
            estado: "SOLICITADO"
          },
          data: { estado: "EN CAMINO" }        // 👈 Aquí se hace la magia
        });
      }
      
      // --- ✅ LÓGICA DE ENTREGA EN EL BACKEND ---
      if (nuevoEstado === "ENTREGADO") {
        if (String(pedido.tipo) === 'KIT' || String(pedido.tipo) === 'CLIENTE') {
          
          // 1. Restamos stock (como ya lo haces)
          await tx.producto.update({
            where: { costoMaestroId_tallerId: { tallerId: pedido.tallerId, costoMaestroId: idFinalProducto } },
            data: { stockActual: { decrement: pedido.cantidad } }
          });

          // 🚀 EL FIX PARA LA VISTA DE GESTIÓN:
          // Si el pedido tiene un hallazgoId, tenemos que marcarlo como ENTREGADO
          if (pedido.hallazgoId) {
            await tx.hallazgo.update({
              where: { id: pedido.hallazgoId },
              data: { estado: 'ENTREGADO' } // 👈 Esto es lo que cambia el badge en Gestión
            });
          }

          // 3. Creamos el registro en el historial de movimientos
          await tx.ingresoStock.create({
            data: {
              tipo: "SALIDA",
              motivo: String(pedido.tipo) === 'KIT' ? "KIT_SERVICIO" : "VENTA_CLIENTE",
              cantidad: -Math.abs(pedido.cantidad),
              estado: "ENTREGADO",
              costoMaestroId: idFinalProducto,
              tallerId: pedido.tallerId,
              usuarioId: usuarioId || 4
            }
          });
        }
        // ... (tu lógica de transferencia sigue igual abajo)
      }

      // 🎯 ACTUALIZACIÓN FINAL DEL PEDIDO
      return await tx.pedido.update({
        where: { id: Number(id) },
        data: {
          estado: nuevoEstado,
          costoMaestroId: idFinalProducto, 
          observaciones: motivoRechazo || null
        }
      });
    });

    res.json({ data: resultado });
  } catch (error: any) {
    console.error("❌ ERROR LOGÍSTICO:", error.message);
    res.status(500).json({ error: error.message });
  }
};