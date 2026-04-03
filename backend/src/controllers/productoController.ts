import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const handlePrismaError = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Fallo de restricción única (Unique constraint)
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: "Conflicto: Este producto ya tiene un registro de stock en este taller." 
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "El registro no existe." });
    }
  }
  console.error(error);
  return res.status(500).json({ error: "Error interno en el módulo de inventario" });
};

// 1. Obtener todos los productos con su identidad maestra
export const getProductos = async (req: Request, res: Response) => {
  // 🚀 1. Capturamos el maestroId que envía el frontend (?maestroId=...)
  const { maestroId } = req.query;

  try {
    const productos = await prisma.producto.findMany({
      // 🚀 2. Filtramos: Si viene maestroId, tráeme solo ese repuesto en todos los talleres
      where: maestroId ? {
        costoMaestroId: Number(maestroId)
      } : {}, 
      include: {
        costoMaestro: true, 
        taller: true        
      },
      orderBy: { 
        taller: { nombre: 'asc' } // Opcional: ordenarlos por nombre de taller
      }
    });

    res.json(productos);
  } catch (error) {
    // Si no tienes handlePrismaError definido aquí, usa console.error + res.status(500)
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener stock en red" });
  }
};

// 2. Obtener un producto específico por su ID de stock
export const getProductoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: Number(id) },
      include: { costoMaestro: true, taller: true }
    });

    if (!producto) return res.status(404).json({ error: "Producto no encontrado en almacén" });
    res.json(producto);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 3. Crear registro de stock (Vincular Maestro con Taller)
export const createProducto = async (req: Request, res: Response) => {
  const { costoMaestroId, tallerId, stockActual, stockMin, codigo } = req.body;

  try {
    const nuevo = await prisma.producto.create({
      data: {
        costoMaestroId: Number(costoMaestroId),
        tallerId: Number(tallerId),
        stockActual: Number(stockActual) || 0,
        stockMin: Number(stockMin) || 5,
        codigo: codigo?.toUpperCase().trim() || "", // 🚀 Mayúsculas también aquí
      },
      include: { costoMaestro: true }
    });

    res.status(201).json(nuevo);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 4. Actualizar stock o código
export const updateProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { stockActual, stockMin, codigo } = req.body;

  try {
    const actualizado = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        stockActual: stockActual !== undefined ? Number(stockActual) : undefined,
        stockMin: stockMin !== undefined ? Number(stockMin) : undefined,
        codigo: codigo?.toUpperCase().trim()
      },
      include: { costoMaestro: true }
    });
    res.json(actualizado);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// 5. Eliminar (Retirar producto del taller)
export const deleteProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.producto.delete({ where: { id: Number(id) } });
    res.json({ message: "Producto retirado del taller correctamente" });
  } catch (error) {
    handlePrismaError(error, res);
  }
};

// En productoController.ts
export const buscarParaEntregaKit = async (req: Request, res: Response) => {
  const { tallerId, filtroKit } = req.query; 

  if (!tallerId || !filtroKit) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const busquedaLimpia = String(filtroKit).toUpperCase();
    const buscaFiltro = busquedaLimpia.includes("FILTRO");

    const productos = await prisma.producto.findMany({
      where: {
        tallerId: parseInt(String(tallerId)), 
        stockActual: { gt: 0 },
        costoMaestro: {
          AND: [
            {
              OR: [
                // 🚀 MySQL ya es case-insensitive, así que quitamos el "mode"
                { nombre: { contains: buscaFiltro ? "FILTRO" : "ACEITE" } },
                { categoria: { contains: String(filtroKit) } },
                { marca: { contains: String(filtroKit) } }
              ]
            },
            // 🛡️ REGLA DE EXCLUSIÓN
            ...(!buscaFiltro 
              ? [{ nombre: { not: { contains: "FILTRO" } } }] 
              : []
            )
          ]
        }
      },
      include: { costoMaestro: true }
    });
    
    res.json(productos);
  } catch (error: any) {
    console.error("❌ Error en Prisma:", error);
    res.status(500).json({ error: error.message });
  }
};