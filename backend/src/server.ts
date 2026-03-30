import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, register } from './controllers/authController';
import usuarioRoutes from './routes/usuarioRoutes'; 
import tallerRoutes from './routes/tallerRoutes'; 
import productoRoutes from './routes/productoRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import rentabilidadRoutes from './routes/rentabilidadRoutes';
import costoMaestroRoutes from './routes/costoMaestroRoutes';
import ingresosRoutes from './routes/ingresosRoutes';
import pedidoRoutes from './routes/pedidoRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 🏠 Ruta base
app.get('/', (req, res) => {
  res.send('🚀 Servidor de Dr. Motors activo y listo');
});


app.use('/api/usuarios', usuarioRoutes);
app.use('/api/talleres', tallerRoutes); 
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/rentabilidad', rentabilidadRoutes);
app.use('/api/costos-maestros', costoMaestroRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/pedidos', pedidoRoutes); 

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`✅ Servidor Dr. Motors: http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});