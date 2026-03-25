import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, register } from './controllers/authController';
import usuarioRoutes from './routes/usuarioRoutes'; 
import tallerRoutes from './routes/tallerRoutes'; 
import productoRoutes from './routes/productoRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import rentabilidadRoutes from './routes/rentabilidadRoutes';

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

// Ruta de talleres
app.use('/api/talleres', tallerRoutes); 

// Ruta de Productos
app.use('/api/productos', productoRoutes);

// Ruta de Proveedores
app.use('/api/proveedores', proveedorRoutes);

// Ruta de Rentabilidad
app.use('/api/rentabilidad', rentabilidadRoutes);

// Rutas de Autenticación
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});