import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. CREAR INGRESO / SALIDA / TRANSFERENCIA
export const crearIngreso = async (req: Request, res: Response) => {
    const { 
        tallerId,       // El taller que está operando (normalmente el destino en una solicitud)
        usuarioId, 
        items, 
        tipo,           // "SALIDA", "INTERNO", "CON_RUC", etc.
        motivo,         // "TRANSFERENCIA_SALIDA", "CARGA_INICIAL", etc.
        proveedorId, 
        tallerOrigenId, 
        estado 
    } = req.body;

    const idParaPrisma = Number(usuarioId) || 4;
    const esSalidaTransferencia = tipo === "SALIDA" && motivo === "TRANSFERENCIA_SALIDA";

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const movimientosProcesados = [];

            for (const item of items) {
                const cantidadAbsoluta = Math.abs(Number(item.cantidad));
                // Si es salida, la guardamos negativa (-20), si es ingreso, positiva (+20)
                const cantidadReal = tipo === "SALIDA" ? -cantidadAbsoluta : cantidadAbsoluta;

                // 🚀 BUG 1 FIX: ¿Quién es el dueño del movimiento?
                // Si es una salida por transferencia, el movimiento pertenece al Taller Origen (el que entrega)
                const tallerEfectivoId = esSalidaTransferencia ? Number(tallerOrigenId) : Number(tallerId);

                // Determinamos el estado inicial
                // Las salidas y compras entran como APROBADO. Las solicitudes internas como SOLICITADO.
                const estadoFinal = estado || (tipo === "INTERNO" ? "SOLICITADO" : "APROBADO");

                // A. CREAR EL REGISTRO DE MOVIMIENTO
                const nuevoMovimiento = await tx.ingresoStock.create({
                    data: {
                        tipo: tipo || "CON_RUC",
                        motivo: motivo || (tipo === "SALIDA" ? "VENTA_CLIENTE" : "CARGA_INICIAL"),
                        cantidad: cantidadReal,
                        estado: estadoFinal,
                        costoMaestro: { connect: { id: Number(item.costoMaestroId) } },
                        taller:       { connect: { id: tallerEfectivoId } },
                        usuario:      { connect: { id: idParaPrisma } },
                        ...(tallerOrigenId ? { tallerOrigen: { connect: { id: Number(tallerOrigenId) } } } : {}),
                        ...(proveedorId ? { proveedor: { connect: { id: Number(proveedorId) } } } : {})
                    }
                });

                // B. ACTUALIZAR STOCK REAL (Solo si entra como APROBADO)
                // Esto aplica para Compras, Cargas Iniciales y SALIDAS inmediatas
                // 🚀 CAMBIO: Permitimos que el stock se mueva también en DESPACHADO
                if (estadoFinal === "APROBADO" || estadoFinal === "DESPACHADO") {
                    await tx.producto.upsert({
                        where: {
                            costoMaestroId_tallerId: {
                                tallerId: tallerEfectivoId, // 👈 Asegúrate de que sea el ID del taller que ENVÍA
                                costoMaestroId: Number(item.costoMaestroId)
                            }
                        },
                        // Prisma procesará el valor negativo de 'cantidadReal' restándolo del stockActual
                        update: { stockActual: { increment: cantidadReal } }, 
                        create: {
                            tallerId: tallerEfectivoId,
                            costoMaestroId: Number(item.costoMaestroId),
                            stockActual: cantidadReal,
                            stockMin: 5
                        }
                    });
                }

                movimientosProcesados.push(nuevoMovimiento);
            }
            return movimientosProcesados;
        });

        res.status(201).json({ 
            message: tipo === "SALIDA" ? "Salida de stock procesada" : "Ingreso registrado", 
            data: resultado 
        });

    } catch (error: any) {
        console.error("❌ ERROR EN MOVIMIENTO:", error);
        res.status(500).json({ error: error.message || "Fallo al registrar el movimiento" });
    }
};

// 2. OBTENER HISTORIAL
export const obtenerIngresos = async (req: Request, res: Response) => {
    const { tallerId } = req.query;

    try {
        const ingresos = await prisma.ingresoStock.findMany({
            where: {
                ...(tallerId ? { tallerId: Number(tallerId) } : {})
            },
            include: {
                taller: true,
                tallerOrigen: true,
                costoMaestro: true,
                proveedor: true,
                usuario: { select: { nombre: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ingresos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar el historial" });
    }
};

// 3. 🚀 ACTUALIZAR ESTADO (Confirmar Recepción)
export const actualizarEstadoIngreso = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body; // Viene 'RECIBIDO' del front

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const ingreso = await tx.ingresoStock.findUnique({ 
                where: { id: Number(id) } 
            });

            if (!ingreso) throw new Error("Movimiento no encontrado");

            // 1. 🛡️ Si ya está procesado, no hacer nada
            if (ingreso.estado === "APROBADO" || ingreso.estado === "RECIBIDO") {
                return ingreso; 
            }

            // 2. 🚀 LÓGICA DE ACTUALIZACIÓN DE STOCK Y PEDIDO
            // Aceptamos ambos porque a veces el front manda uno u otro
            if (nuevoEstado === "RECIBIDO" || nuevoEstado === "APROBADO") {
                
                // A. Sumar Stock al taller destino (Taller 2 en tu caso)
                await tx.producto.upsert({
                    where: {
                        costoMaestroId_tallerId: {
                            tallerId: ingreso.tallerId,
                            costoMaestroId: ingreso.costoMaestroId
                        }
                    },
                    update: { stockActual: { increment: Math.abs(ingreso.cantidad) } },
                    create: {
                        tallerId: ingreso.tallerId,
                        costoMaestroId: ingreso.costoMaestroId,
                        stockActual: Math.abs(ingreso.cantidad),
                        stockMin: 5
                    }
                });

                // B. Cerrar el Pedido relacionado
                await tx.pedido.updateMany({
                    where: {
                        costoMaestroId: ingreso.costoMaestroId,
                        tallerId: ingreso.tallerId,
                        // 🚀 IMPORTANTE: Solo estados que existan en el Enum de Pedido
                        estado: { in: ["PENDIENTE", "DESPACHADO"] } 
                    },
                    data: { estado: "ENTREGADO" }
                });
            }

            // 3. 🎯 ACTUALIZAR EL REGISTRO DE INGRESOSTOCK
            // Si tu DB no acepta "RECIBIDO", cámbialo aquí a "APROBADO" manualmente
            return await tx.ingresoStock.update({
                where: { id: Number(id) },
                data: { estado: nuevoEstado === "RECIBIDO" ? "APROBADO" : nuevoEstado }
            });
        });

        res.json({ message: "Sincronización completa", data: resultado });
    } catch (error: any) {
        console.error("❌ ERROR CRÍTICO:", error);
        res.status(500).json({ error: error.message });
    }
};