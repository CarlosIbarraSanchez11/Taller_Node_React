import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearCita = async (req: Request, res: Response) => {
  try {
    const { fecha, hora_inicio, vehiculoPlaca, tecnicoId, servicioId, tallerId } = req.body;

    // 1. 🛡️ VALIDACIÓN DE ENTRADA (Evita el Error NaN)
    const idServicio = parseInt(servicioId, 10);
    const idTecnico  = parseInt(tecnicoId, 10);
    const idTaller   = parseInt(tallerId, 10);

    if (isNaN(idServicio) || isNaN(idTecnico) || isNaN(idTaller)) {
      return res.status(400).json({ 
        error: "IDs inválidos. Verifique que Servicio, Técnico y Taller estén seleccionados.",
        detalles: { servicioId, tecnicoId, tallerId } 
      });
    }

    if (!vehiculoPlaca || !hora_inicio) {
      return res.status(400).json({ error: "Faltan datos obligatorios (Placa o Hora)." });
    }

    // 2. Buscamos el servicio para saber cuánto dura
    const servicio = await prisma.servicio.findUnique({
      where: { id: idServicio }
    });

    if (!servicio) return res.status(404).json({ error: "El servicio seleccionado no existe." });

    // 3. Calculamos hora_fin (hora_inicio + duracion)
    const duracionHoras = parseInt(servicio.duracion, 10);
    const [horas, minutos] = hora_inicio.split(':').map(Number);
    
    // Formateamos la hora fin para que siempre tenga dos dígitos (ej: 09:00)
    const horaFinCalculada = `${(horas + duracionHoras).toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

    // 4. 🚀 Creamos la cita en la DB
    const nuevaCita = await prisma.cita.create({
      data: {
        fecha: new Date(fecha),
        hora_inicio,
        hora_fin: horaFinCalculada,
        vehiculoPlaca: vehiculoPlaca.toUpperCase(),
        tecnicoId: idTecnico,
        servicioId: idServicio,
        tallerId: idTaller, // 👈 Aquí ya no será NaN
        estado: 'PENDIENTE'
      },
      include: {
        servicio: true,
        tecnico: true,
        taller: true, // 👈 Aprovechamos para incluir el taller en la respuesta
        vehiculo: { 
          include: { 
            cliente: true 
          } 
        }
      }
    });

    res.status(201).json(nuevaCita);

  } catch (error) {
    // 🔍 Log detallado para desarrollo
    console.error("ERROR EN CREAR_CITA:", error);
    res.status(500).json({ 
      error: "Error interno al procesar la cita",
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};

// Obtener todas las citas (para el calendario o lista global)
export const getCitas = async (req: Request, res: Response) => {
  try {
    // 1. Extraemos los filtros de la URL (Query Params)
    const { tallerId, rol, fecha } = req.query;

    let whereClause: any = {};

    // 2. Filtro por Fecha (Opcional, pero muy útil para la Agenda)
    if (fecha) {
      whereClause.fecha = new Date(fecha as string);
    }

    // 3. Lógica de Seguridad por Rol 🛡️
    const userRol = String(rol);
    const idTallerReq = parseInt(tallerId as string);

    if (userRol === 'Mecánico' || userRol === 'Jefe Mecánico' || userRol === 'Call Center') {
      // 🔒 RESTRICCIÓN: Estos roles SOLO pueden ver su taller
      if (!isNaN(idTallerReq)) {
        whereClause.tallerId = idTallerReq;
      }
    } else if ((userRol === 'Admin' || userRol === 'Gerente') && !isNaN(idTallerReq)) {
      // 🔓 OPCIONAL: El Admin solo filtra si él quiere elegir uno
      whereClause.tallerId = idTallerReq;
    }
    // Si es Admin y no manda tallerId, el whereClause.tallerId se queda vacío (trae todo)

    const citas = await prisma.cita.findMany({
      where: whereClause,
      include: {
        servicio: true,
        tecnico: true,
        taller: true, // 👈 Importante incluirlo para saber de qué taller es cada una
        vehiculo: { 
          include: { 
            cliente: true 
          } 
        }
      },
      // Ordenamos por fecha y luego por hora para que la agenda sea legible
      orderBy: [
        { fecha: 'asc' },
        { hora_inicio: 'asc' }
      ]
    });

    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
};

export const getCitaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // El ID viene como string: "cmnecgy..."

    const cita = await prisma.cita.findUnique({
      where: { 
        id: id // 👈 ¡OJO! No pongas Number(id) si tu ID es un string largo
      },
      include: {
        servicio: true,
        tecnico: true,
        taller: true,
        vehiculo: {
          include: {
            cliente: true
          }
        }
      }
    });

    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada en la base de datos" });
    }

    res.json(cita);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el detalle de la cita" });
  }
};