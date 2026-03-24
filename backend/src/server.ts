import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, register } from './controllers/authController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json()); // Esto permite que el servidor entienda los datos que envías

// Ruta de prueba para ver en el navegador
app.get('/', (req, res) => {
  res.send('🚀 Servidor de Dr. Motors activo y listo');
});

// Rutas de Autenticación
app.post('/api/auth/register', register); // ¡Primero regístrate para que haya alguien en la DB!
app.post('/api/auth/login', login);

app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});