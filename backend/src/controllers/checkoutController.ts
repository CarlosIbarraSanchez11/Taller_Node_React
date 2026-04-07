import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCheckoutByCita = async (req: Request, res: Response) => {
    try {
        const { idCita } = req.params;
        console.log("Buscando orden para la cita ID:", idCita);

        const orden = await prisma.ordenTrabajo.findUnique({
          where: { citaId: idCita }, 
          include: {
            mecanico: true,
            cita: {
              include: {
                vehiculo: {
                  include: { cliente: true }
                },
                servicio: {
                  include: {
                    pasos: {
                      include: { sector: true }
                    }
                  }
                },
                lavado: true
              }
            },
            hallazgos: true
          }
        });

        console.log("Resultado de Prisma:", orden);

        if (!orden) {
            return res.status(404).json({ message: "No se encontró la orden en la DB" });
        }

        return res.json(orden);
    } catch (error) {
        console.error("Error en el controlador:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};

export const entregarVehiculo = async (req: Request, res: Response) => {
    const { idCita } = req.params;

    try {
        // ⛓️ Transacción: Si falla uno, no se hace ninguno
        await prisma.$transaction([
            // 1. La Cita pasa a CONCLUIDO (Fin del ciclo de vida)
            prisma.cita.update({
                where: { id: idCita },
                data: { estado: 'CONCLUIDO' }
            }),
            // 2. La Orden de Trabajo pasa a FINALIZADO
            prisma.ordenTrabajo.update({
                where: { citaId: idCita },
                data: { estado: 'FINALIZADO' }
            })
        ]);

        console.log(`✅ Vehículo entregado. Cita: ${idCita}`);
        return res.json({ message: "¡Vehículo entregado con éxito! 🏁" });

    } catch (error: any) {
        console.error("❌ Error al entregar vehículo:", error.message);
        return res.status(500).json({ message: "No se pudo procesar la entrega" });
    }
};