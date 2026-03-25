import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const handlePrismaError = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "¡Error! Ya existe un proveedor registrado con este RUC." });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "El proveedor no existe." });
    }
  }
  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor" });
};

export const getProveedores = async (_req: Request, res: Response) => {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { razonSocial: 'asc' }
    });
    res.json(proveedores);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

export const createProveedor = async (req: Request, res: Response) => {
  // 1. EXTRAEMOS solo los campos legales. Ignoramos el 'id' si viene.
  const { ruc, razonSocial, telefono, email, direccion, estado } = req.body;

  try {
    const nuevo = await prisma.proveedor.create({
      data: {
        ruc,
        razonSocial,
        telefono,
        email,
        direccion,
        estado: estado || 'Activo'
      }
    });
    res.status(201).json(nuevo);
  } catch (error) {
    // Si el RUC ya existe, esto enviará un 400 (Error del cliente)
    // en lugar de un 500 (Error del servidor)
    handlePrismaError(error, res);
  }
};

export const updateProveedor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const actualizado = await prisma.proveedor.update({
      where: { id: Number(id) },
      data: req.body
    });
    res.json(actualizado);
  } catch (error) {
    handlePrismaError(error, res);
  }
};

export const deleteProveedor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.proveedor.delete({ where: { id: Number(id) } });
    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (error) {
    handlePrismaError(error, res);
  }
};