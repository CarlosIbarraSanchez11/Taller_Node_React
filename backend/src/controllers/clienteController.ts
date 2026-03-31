import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registrarClienteYVehiculo = async (req: Request, res: Response) => {
  try {
    const { 
      tipoDocumento, numDocumento, nombres, apellidos, telefono, email,
      placa, marca, modelo, anio, combustible, tipo 
    } = req.body;

    // 1. Validar si la placa ya existe (para no chocar con el error P2002 de Prisma)
    const vehiculoExistente = await prisma.vehiculo.findUnique({
      where: { placa: placa.toUpperCase().trim() }
    });

    if (vehiculoExistente) {
      return res.status(400).json({ 
        error: `La placa ${placa} ya está registrada a otro propietario.` 
      });
    }

    // 2. Operación Atómica: Upsert de Cliente + Create de Vehículo
    const resultado = await prisma.cliente.upsert({
      where: { numDocumento: numDocumento },
      update: {
        // Si el cliente existe, actualizamos sus datos por si cambiaron
        nombres: nombres.toUpperCase().trim(),
        apellidos: apellidos.toUpperCase().trim(),
        telefono,
        email,
        vehiculos: {
          create: {
            placa: placa.toUpperCase().trim(),
            marca: marca.toUpperCase(),
            modelo: modelo.toUpperCase(),
            anio: anio ? Number(anio) : null,
            combustible,
            tipo
          }
        }
      },
      create: {
        tipoDocumento,
        numDocumento,
        nombres: nombres.toUpperCase().trim(),
        apellidos: apellidos.toUpperCase().trim(),
        telefono,
        email,
        vehiculos: {
          create: {
            placa: placa.toUpperCase().trim(),
            marca: marca.toUpperCase(),
            modelo: modelo.toUpperCase(),
            anio: anio ? Number(anio) : null,
            combustible,
            tipo
          }
        }
      },
      include: { vehiculos: true } // Para devolver el cliente con sus carros
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al registrar el ingreso." });
  }
};

// Obtener todos los clientes para tu tabla principal
export const getClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { vehiculos: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes." });
  }
};