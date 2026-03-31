import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearCita = async (req: Request, res: Response) => {
  try {
    const { fecha, hora_inicio, vehiculoPlaca, tecnicoId, servicioId } = req.body;

    // 1. Buscamos el servicio para saber cuánto dura
    const servicio = await prisma.servicio.findUnique({
      where: { id: Number(servicioId) }
    });

    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });

    // 2. Calculamos hora_fin (hora_inicio + duracion)
    const duracionHoras = parseInt(servicio.duracion);
    const [horas, minutos] = hora_inicio.split(':').map(Number);
    const horaFinCalculada = `${(horas + duracionHoras).toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

    // 3. Creamos la cita en la DB
    const nuevaCita = await prisma.cita.create({
      data: {
        fecha: new Date(fecha),
        hora_inicio,
        hora_fin: horaFinCalculada,
        vehiculoPlaca,
        tecnicoId: Number(tecnicoId),
        servicioId: Number(servicioId),
        estado: 'PENDIENTE'
      },
      include: {
        servicio: true,
        tecnico: true,
        vehiculo: { include: { cliente: true } }
      }
    });

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la cita en el servidor" });
  }
};

// Obtener todas las citas (para el calendario o lista global)
export const getCitas = async (req: Request, res: Response) => {
  try {
    const citas = await prisma.cita.findMany({
      include: {
        servicio: true,
        tecnico: true,
        vehiculo: { include: { cliente: true } }
      },
      orderBy: { fecha: 'asc' }
    });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las citas" });
  }
};