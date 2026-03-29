import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handlePrismaError = (error: unknown, res: Response) => {
  console.error("❌ Error en CostoMaestro:", error);
  return res.status(500).json({ error: "Error procesando la operación logística" });
};

// 1. OBTENER TODO EL CATÁLOGO (Vista Global con Stock)
export const getCostosMaestros = async (_req: Request, res: Response) => {
  try {
    // Traemos el catálogo e incluimos los registros de stock de TODOS los talleres
    const maestros = await prisma.costoMaestro.findMany({
      include: {
        productos: true, 
      },
      orderBy: { categoria: 'asc' }
    });

    // Formateamos para el frontend (calculando el stock total en red)
    const resultado = maestros.map((m) => {
      const stockTotal = m.productos.reduce((acc, p) => acc + p.stockActual, 0);

      return {
        id: m.id,
        categoria: m.categoria,
        nombre: m.nombre,
        marca: m.marca,
        medida: m.medida,
        stockTotal: stockTotal,
        costoInsumo: m.precioCompra,
        hh: m.tiempoHH,
        costoHH: m.costoHH,
        tecnicos: m.cantTecnicos,
        precioVentaGuardado: m.precioVenta
      };
    });

    res.json(resultado);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 2. GUARDAR O EDITAR (Upsert por Identidad Única)
export const upsertCostoMaestro = async (req: Request, res: Response) => {
  const { 
    categoria, nombre, marca, medida, 
    precioCompra, tiempoHH, costoHH, cantTecnicos, precioVenta 
  } = req.body;

  try {
    const registro = await prisma.costoMaestro.upsert({
      where: {
        nombre_marca_medida: {
          nombre: nombre.toUpperCase(),
          marca: marca.toUpperCase(),
          medida: medida
        }
      },
      update: {
        categoria,
        // 🚀 LIMPIEZA: Si es NaN, guardamos 0
        precioCompra: Number(precioCompra) || 0,
        tiempoHH: Number(tiempoHH) || 0,
        costoHH: Number(costoHH) || 0,
        cantTecnicos: Number(cantTecnicos) || 0,
        precioVenta: Number(precioVenta) || 0
      },
      create: {
        categoria,
        nombre: nombre.toUpperCase(),
        marca: marca.toUpperCase(),
        medida: medida,
        // 🚀 LIMPIEZA: Si es NaN, guardamos 0
        precioCompra: Number(precioCompra) || 0,
        tiempoHH: Number(tiempoHH) || 0,
        costoHH: Number(costoHH) || 0,
        cantTecnicos: Number(cantTecnicos) || 0,
        precioVenta: Number(precioVenta) || 0
      }
    });

    res.json(registro);
  } catch (error) {
    handlePrismaError(error, res);
  }
};