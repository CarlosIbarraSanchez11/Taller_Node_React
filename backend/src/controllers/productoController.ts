import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper para centralizar los errores de Prisma
 */
const handlePrismaError = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: "Conflicto: Ya existe este mismo producto (nombre, marca y medida) en este taller." 
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "El producto no existe." });
    }
  }
  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor" });
};

// --- Controladores ---

export const getProductos = async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(productos);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

export const getProductoById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ error: "El ID proporcionado debe ser un número" });
  }

  try {
    const producto = await prisma.producto.findUnique({
      where: { id: idNum }
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

export const createProducto = async (req: Request, res: Response) => {
  const { nombre, marca, medida, tallerId, categoria, stockActual, stockMin, codigo } = req.body;

  try {
    // CAMBIO: Usamos .create en lugar de .upsert
    const nuevo = await prisma.producto.create({
      data: {
        nombre,
        marca: marca || "", 
        medida,
        categoria,
        codigo,
        tallerId: Number(tallerId),
        stockActual: Number(stockActual) || 0,
        stockMin: Number(stockMin) || 5,
      }
    });

    res.status(201).json(nuevo); // 201 = Creado con éxito
  } catch (error) {
    // Este helper enviará el mensaje: "Conflicto: Ya existe este mismo producto..."
    handlePrismaError(error, res); 
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) return res.status(400).json({ error: "ID no válido" });

  const { nombre, marca, medida, tallerId, categoria, stockActual, stockMin, codigo } = req.body;

  try {
    const actualizado = await prisma.producto.update({
      where: { id: idNum },
      data: {
        nombre,
        marca: marca || "", 
        medida,
        categoria,
        codigo,
        tallerId: tallerId ? Number(tallerId) : undefined,
        // No sumamos stock aquí, guardamos el valor directo del input
        stockActual: stockActual ? Number(stockActual) : undefined, 
        stockMin: stockMin ? Number(stockMin) : undefined,
      }
    });
    res.json(actualizado);
  } catch (error) {
    handlePrismaError(error, res); 
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNum = Number(id);

  try {
    await prisma.producto.delete({
      where: { id: idNum }
    });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    handlePrismaError(error, res);
  }
};