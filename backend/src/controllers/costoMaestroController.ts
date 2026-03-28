import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Reutilizamos tu lógica de errores si quieres, o definimos una local
const handlePrismaError = (error: unknown, res: Response) => {
  console.error(error);
  return res.status(500).json({ error: "Error procesando costos maestros" });
};

export const getCostosMaestros = async (_req: Request, res: Response) => {
  try {
    // 1. Agrupamos los productos por su "Identidad" para tener el stock total
    const agrupados = await prisma.producto.groupBy({
      by: ['nombre', 'marca', 'medida'],
      _sum: {
        stockActual: true,
      },
    });

    // 2. Traemos todas las configuraciones financieras existentes
    const configs = await prisma.costoMaestro.findMany();

    // 3. Cruzamos la info (Match)
    const resultado = agrupados.map((p, index) => {
      // Buscamos si ya tiene configuración de precio en la DB
      const c = configs.find(conf => 
        conf.nombre === p.nombre && 
        conf.marca === p.marca && 
        conf.medida === p.medida
      );

      return {
        // Generamos un ID único para el frontend (ID real o temporal)
        id: c?.id || `temp-${index}`, 
        nombre: p.nombre,
        marca: p.marca || "",
        medida: p.medida,
        stockTotal: p._sum.stockActual || 0,
        // Si no hay config, devolvemos valores en 0
        costoInsumo: c?.precioCompra || 0,
        hh: c?.tiempoHH || 0,
        costoHH: c?.costoHH || 0,
        tecnicos: c?.cantTecnicos || 1,
        precioVentaGuardado: c?.precioVenta || 0
      };
    });

    res.json(resultado);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

export const upsertCostoMaestro = async (req: Request, res: Response) => {
  const { nombre, marca, medida, costoInsumo, hh, costoHH, tecnicos, precioVenta } = req.body;

  try {
    const registro = await prisma.costoMaestro.upsert({
      where: {
        // Gracias al @@unique([nombre, marca, medida]) que pusimos en Prisma
        nombre_marca_medida: {
          nombre,
          marca: marca || "",
          medida
        }
      },
      update: {
        precioCompra: Number(costoInsumo),
        tiempoHH: Number(hh),
        costoHH: Number(costoHH),
        cantTecnicos: Number(tecnicos),
        precioVenta: Number(precioVenta)
      },
      create: {
        nombre,
        marca: marca || "",
        medida,
        precioCompra: Number(costoInsumo),
        tiempoHH: Number(hh),
        costoHH: Number(costoHH),
        cantTecnicos: Number(tecnicos),
        precioVenta: Number(precioVenta)
      }
    });

    res.json(registro);
  } catch (error) {
    handlePrismaError(error, res);
  }
};