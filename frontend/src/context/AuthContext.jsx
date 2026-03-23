// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { usuariosMock } from '../services/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si había una sesión guardada en el navegador
  useEffect(() => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  // --- ESTE ES TU "VALIDAR.PHP" SIMULADO ---
  const loginMock = (email, password) => {
    // 1. Buscamos en el array de mockData.js si existe el email
    // (Simulamos que la contraseña siempre es '123456' para todos los mocks)
    const foundUser = usuariosMock.find(u => u.email === email && password === '123456');

    if (foundUser) {
      if (foundUser.estado === 'Inactivo') {
        return { success: false, message: 'Usuario inactivo. Contacte al administrador.' };
      }

      // 2. Si existe y está activo, guardamos la sesión
      const sessionData = {
        id: foundUser.id,
        nombre: foundUser.nombre,
        rol: foundUser.rol,
        tallerId: foundUser.tallerId,
      };

      setUser(sessionData);
      localStorage.setItem('sessionUser', JSON.stringify(sessionData)); // Guardar en navegador
      return { success: true };
    } else {
      return { success: false, message: 'Credenciales incorrectas (Prueba con password: 123456).' };
    }
  };

  const logout = () => {
    localStorage.removeItem('sessionUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginMock, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);