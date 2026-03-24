import axios from 'axios';

// Creamos la instancia personalizada
const api = axios.create({
  // 🏁 Aquí va la URL de tu backend que probamos en Postman
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🕵️‍♂️ INTERCEPTOR: Este código se ejecuta ANTES de que cada petición salga al servidor
api.interceptors.request.use(
  (config) => {
    // Buscamos el token que guardamos en el login
    const token = localStorage.getItem('token');

    // Si el token existe, se lo pegamos a la "frente" de la petición
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;