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
  // 1. Recibimos el 'id' también desde el frontend
  const { 
    id, categoria, nombre, marca, medida, 
    costoInsumo, hh, costoHH, tecnicos, precioVenta 
  } = req.body;

  try {
    let registro;

    // 🚀 LÓGICA INTELIGENTE:
    // Si viene un ID, significa que el usuario hizo clic en "Editar",
    // así que actualizamos ESE registro específico sin importar si cambió la medida.
    if (id) {
      registro = await prisma.costoMaestro.update({
        where: { id: Number(id) },
        data: {
          categoria: categoria.toUpperCase(),
          nombre: nombre.toUpperCase().trim(),
          marca: marca.toUpperCase().trim(),
          medida: medida,
          precioCompra: Number(costoInsumo) || 0,
          tiempoHH:     Number(hh) || 0,
          costoHH:      Number(costoHH) || 0,
          cantTecnicos: Number(tecnicos) || 0,
          precioVenta:  Number(precioVenta) || 0
        }
      });
    } 
    // Si NO viene ID, es un producto nuevo o un intento de creación
    else {
      registro = await prisma.costoMaestro.upsert({
        where: {
          nombre_marca_medida: {
            nombre: nombre.toUpperCase().trim(),
            marca: marca.toUpperCase().trim(),
            medida: medida
          }
        },
        update: {
          categoria: categoria.toUpperCase(),
          precioCompra: Number(costoInsumo) || 0,
          tiempoHH:     Number(hh) || 0,
          costoHH:      Number(costoHH) || 0,
          cantTecnicos: Number(tecnicos) || 0,
          precioVenta:  Number(precioVenta) || 0
        },
        create: {
          categoria: categoria.toUpperCase(),
          nombre: nombre.toUpperCase().trim(),
          marca: marca.toUpperCase().trim(),
          medida: medida,
          precioCompra: Number(costoInsumo) || 0,
          tiempoHH:     Number(hh) || 0,
          costoHH:      Number(costoHH) || 0,
          cantTecnicos: Number(tecnicos) || 0,
          precioVenta:  Number(precioVenta) || 0
        }
      });
    }

    res.json(registro);
  } catch (error) {
    console.error("Error en upsert:", error);
    res.status(500).json({ error: "Error al guardar el registro maestro" });
  }
};