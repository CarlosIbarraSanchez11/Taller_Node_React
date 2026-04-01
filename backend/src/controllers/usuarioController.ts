import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Sinceramente, para guardar contraseñas seguras

const prisma = new PrismaClient();

// OBTENER TODOS LOS USUARIOS (Para tu tabla de React)
export const getUsuarios = async (req: Request, res: Response) => {
  try {
    // 1. Extraemos los filtros opcionales de la URL
    const { tallerId, rol } = req.query;

    // 2. Construimos el objeto de filtrado (Where)
    let where: any = {};

    // Si viene un tallerId, lo filtramos (convertimos a número)
    if (tallerId && tallerId !== 'undefined') {
      where.tallerId = Number(tallerId);
    }

    // Si viene un rol (ej: 'Mecánico'), lo filtramos
    if (rol) {
      where.rol = String(rol);
    }

    // 3. Ejecutamos la consulta con el filtro dinámico
    const usuarios = await prisma.usuario.findMany({
      where: where, // 👈 Aquí está la clave
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        tallerId: true,
        taller: {
          select: { nombre: true }
        }
      }
    });

    res.json(usuarios);
  } catch (error) {
    console.error("Error en getUsuarios:", error);
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
  const { nombre, email, rol, estado, tallerId, password } = req.body;

  try {
    // 💡 Preparamos los datos a actualizar
    const dataActualizar: any = {
      nombre,
      email,
      rol,
      estado,
      // Manejo robusto del tallerId: Si es vacío, 0 o undefined, mandamos null
      tallerId: (tallerId && Number(tallerId) !== 0) ? Number(tallerId) : null
    };

    // 🔒 Si el usuario envió una contraseña nueva, la encriptamos y agregamos
    if (password && password.trim() !== "") {
      dataActualizar.password = await bcrypt.hash(password, 10);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: dataActualizar,
      // Incluimos el taller en la respuesta para que React actualice la tabla al instante
      include: {
        taller: { select: { nombre: true } }
      }
    });

    res.json(usuarioActualizado);
  } catch (error) {
    console.error("Error en Update:", error);
    res.status(500).json({ error: "No se pudo actualizar el usuario. Revisa si el email ya existe." });
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