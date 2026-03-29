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
export const getProductos = async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        costoMaestro: true, // 🚀 Trae Nombre, Marca, Medida, Categoria
        taller: true        // Trae el nombre del taller (Sede)
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(productos);
  } catch (error) {
    handlePrismaError(error, res);
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