import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. CREAR SERVICIO
export const createServicio = async (req: Request, res: Response) => {
  try {
    const { 
      tipo, especialidad, nivel, tecnologia, 
      categoriaVehiculo, duracion, precioBase, 
      kit, pasos 
    } = req.body;

    const nuevoServicio = await prisma.servicio.create({
      data: {
        tipo, especialidad, nivel, tecnologia,
        categoriaVehiculo, duracion, precioBase,
        pasos: {
          create: pasos.map((p: any, index: number) => ({
            descripcion: p.descripcion,
            orden: index,
            // 🚀 Guardamos el sectorId si es Mantenimiento
            sectorId: tipo === 'MANTENIMIENTO' ? (p.sectorId ? Number(p.sectorId) : (p.sector?.id ? Number(p.sector.id) : null)) : null
          }))
        },
        kit: {
          create: kit.map((i: any) => ({
            descripcion: i.descripcion,
            cantidad: Number(i.cantidad)
          }))
        }
      },
      include: { 
        pasos: { include: { sector: true } }, 
        kit: true 
      }
    });

    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error("Error en createServicio:", error);
    res.status(500).json({ error: 'Error al crear' });
  }
};

// 2. OBTENER TODOS LOS SERVICIOS
export const getServicios = async (_req: Request, res: Response) => {
  try {
    const servicios = await prisma.servicio.findMany({
      include: { 
        pasos: { 
          include: { sector: true }, 
          orderBy: { orden: 'asc' } 
        },
        kit: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

// 3. ACTUALIZAR SERVICIO (Corregido para Sectores)
export const updateServicio = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    tipo, especialidad, nivel, tecnologia, 
    categoriaVehiculo, duracion, precioBase, 
    kit, pasos 
  } = req.body;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Limpiamos hijos anteriores
      await tx.pasoServicio.deleteMany({ where: { servicioId: Number(id) } });
      await tx.kitInsumo.deleteMany({ where: { servicioId: Number(id) } });

      // 2. Actualizamos el servicio y re-creamos los hijos con sectorId
      return await tx.servicio.update({
        where: { id: Number(id) },
        data: {
          tipo, especialidad, nivel, tecnologia,
          categoriaVehiculo, duracion, precioBase,
          pasos: {
            create: pasos.map((p: any, index: number) => ({
            descripcion: p.descripcion,
            orden: index,
            // 🚀 Aseguramos capturar el ID del sector correctamente
            sectorId: p.sectorId ? Number(p.sectorId) : (p.sector?.id ? Number(p.sector.id) : null)
            }))
         },
          kit: {
            create: kit.map((i: any) => ({
              descripcion: i.descripcion,
              cantidad: Number(i.cantidad)
            }))
          }
        },
        include: { 
            pasos: { include: { sector: true } }, // 🚀 Incluimos el sector en la respuesta
            kit: true 
        }
      });
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error en updateServicio:", error);
    res.status(500).json({ error: 'Error al actualizar el servicio' });
  }
};

// 4. OBTENER POR ID (Solo una vez y con todos los includes)
export const getServicioById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const servicio = await prisma.servicio.findUnique({
      where: { id: Number(id) },
      include: { 
        pasos: { 
          include: { sector: true }, // 🚀 CRUCIAL para que no desaparezca el nombre
          orderBy: { orden: 'asc' } 
        },
        kit: true 
      }
    });

    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (error) {
    console.error("Error en getServicioById:", error);
    res.status(500).json({ error: 'Error al obtener el detalle' });
  }
};

// 5. ELIMINAR SERVICIO
export const deleteServicio = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.servicio.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el servicio' });
  }
};