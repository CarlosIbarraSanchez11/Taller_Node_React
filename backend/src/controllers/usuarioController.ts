import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Sinceramente, para guardar contraseñas seguras

const prisma = new PrismaClient();

// OBTENER TODOS LOS USUARIOS (Para tu tabla de React)
export const getUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { 
        taller: true 
      }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      include: { taller: true }
    });

    if (!usuario) return res.status(404).json({ error: "No existe" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error de servidor" });
  }
};

// CREAR UN NUEVO USUARIO (Desde tu formulario de React)
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol, tallerId, estado } = req.body;

    // Encriptamos la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        estado,
        tallerId: Number(tallerId)
      },
      include: { taller: true }
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ error: "No se pudo crear el usuario. ¿Email duplicado?" });
  }
};

// Actualizar usuario
export const updateUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, email, rol, estado, tallerId } = req.body;

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nombre,
        email,
        rol,
        estado,
        // 🛠️ IMPORTANTE: Convertimos a Int o null para que Prisma no se queje
        tallerId: tallerId ? Number(tallerId) : null 
      }
    });
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: "No se pudo actualizar el usuario" });
  }
};

// ELIMINAR USUARIO
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.usuario.delete({
      where: { id: Number(id) }
    });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ error: "No se puede eliminar el usuario" });
  }
};