import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, register } from './controllers/authController';
import usuarioRoutes from './routes/usuarioRoutes'; 
// 1. IMPORTA LAS RUTAS DE TALLERES (Asegúrate de haber creado este archivo)
import tallerRoutes from './routes/tallerRoutes'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Servidor de Dr. Motors activo y listo');
});

// Rutas de Usuarios
app.use('/api/usuarios', usuarioRoutes);

// 2. ACTIVA LA RUTA DE TALLERES 🏎️
// Esto hará que http://localhost:4000/api/talleres funcione
app.use('/api/talleres', tallerRoutes); 

// Rutas de Autenticación
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});