import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "clave_secreta_provisional";

// Función para REGISTRAR (Úsala primero para crear tu usuario)
export const register = async (req: Request, res: Response) => {
  // 1. Agregamos 'rol' a la lista para capturarlo de Postman
  const { nombre, email, password, rol } = req.body; 
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: { 
        nombre, 
        email, 
        password: hashedPassword, 
        // 2. Cambiamos 'ADMIN' por la variable 'rol'
        // Si no envías nada en el JSON, se pondrá 'MECANICO' por defecto
        rol: rol || 'MECANICO' 
      }
    });
    res.status(201).json({ mensaje: "Usuario creado con éxito", id: usuario.id });
  } catch (error) {
    res.status(400).json({ error: "Error al registrar. ¿Email duplicado?" });
  }
};

// Función para el LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValido) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Si todo está bien, creamos el "pase VIP" (Token)
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET, { expiresIn: '8h' });

    res.json({ 
      mensaje: "Login exitoso", 
      token,
      usuario: { nombre: usuario.nombre, rol: usuario.rol }
    });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};