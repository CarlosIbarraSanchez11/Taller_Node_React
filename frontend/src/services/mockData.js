export const talleresMock = [
  { id: 1, nombre: 'Taller 1' },
  { id: 2, nombre: 'Taller 2' },
  { id: 3, nombre: 'Taller 3' },
]

export const usuariosMock = [
  // --- ROLES GLOBALES (Ven todos los talleres) ---
  { id: 1,  nombre: 'Carlos Pérez',   email: 'carlos@taller.com',   rol: 'Admin',         estado: 'Activo', tallerId: null },
  { id: 2,  nombre: 'Laura Méndez',   email: 'laura@taller.com',    rol: 'Gerente',       estado: 'Activo', tallerId: null },

  // ==========================================
  // --- TALLER 1 ---
  // ==========================================
  { id: 3,  nombre: 'Juan Quispe',    email: 'juan1@taller.com',    rol: 'Jefe Mecánico', estado: 'Activo',   tallerId: 1 },
  { id: 4,  nombre: 'Luis Torres',    email: 'luis1@taller.com',    rol: 'Mecánico',      estado: 'Inactivo', tallerId: 1 },
  { id: 5,  nombre: 'Valeria Rojas',  email: 'valeria1@taller.com', rol: 'Call',          estado: 'Activo',   tallerId: 1 },
  { id: 6,  nombre: 'Carmen Ruiz',    email: 'carmen1@taller.com',  rol: 'Logística',     estado: 'Activo',   tallerId: 1 },
  { id: 7,  nombre: 'Jorge Blanco',   email: 'jorge1@taller.com',   rol: 'Facturación',   estado: 'Activo',   tallerId: 1 },
  { id: 8,  nombre: 'María Gómez',    email: 'maria1@taller.com',   rol: 'Limpieza',      estado: 'Activo',   tallerId: 1 },

  // ==========================================
  // --- TALLER 2 ---
  // ==========================================
  { id: 9,  nombre: 'Pedro Mamani',   email: 'pedro2@taller.com',   rol: 'Jefe Mecánico', estado: 'Activo',   tallerId: 2 },
  { id: 10, nombre: 'Rosa Huanca',    email: 'rosa2@taller.com',    rol: 'Mecánico',      estado: 'Activo',   tallerId: 2 },
  { id: 11, nombre: 'Marcos Silva',   email: 'marcos2@taller.com',  rol: 'Call',          estado: 'Activo',   tallerId: 2 },
  { id: 12, nombre: 'Ana López',      email: 'ana2@taller.com',     rol: 'Logística',     estado: 'Activo',   tallerId: 2 },
  { id: 13, nombre: 'Raúl Pérez',     email: 'raul2@taller.com',    rol: 'Facturación',   estado: 'Activo',   tallerId: 2 },
  { id: 14, nombre: 'Sonia Dávila',   email: 'sonia2@taller.com',   rol: 'Limpieza',      estado: 'Activo',   tallerId: 2 },

  // ==========================================
  // --- TALLER 3 ---
  // ==========================================
  { id: 15, nombre: 'Elena Vargas',   email: 'elena3@taller.com',   rol: 'Jefe Mecánico', estado: 'Activo',   tallerId: 3 },
  { id: 16, nombre: 'Diego Castro',   email: 'diego3@taller.com',   rol: 'Mecánico',      estado: 'Activo',   tallerId: 3 },
  { id: 17, nombre: 'Lucía Fernández',email: 'lucia3@taller.com',   rol: 'Call',          estado: 'Activo',   tallerId: 3 },
  { id: 18, nombre: 'Hugo Chávez',    email: 'hugo3@taller.com',    rol: 'Logística',     estado: 'Activo',   tallerId: 3 },
  { id: 19, nombre: 'Martín Ríos',    email: 'martin3@taller.com',  rol: 'Facturación',   estado: 'Activo',   tallerId: 3 },
  { id: 20, nombre: 'Teresa Cueva',   email: 'teresa3@taller.com',  rol: 'Limpieza',      estado: 'Activo',   tallerId: 3 },
]


// Nota de QA: Esta variable "usuarioLogueado" ya no la usaremos para la lógica real 
// porque ahora tenemos el AuthContext, pero la dejamos por si algún componente viejo aún la llama.
export const usuarioLogueado = {
  nombre: 'Carlos Pérez',
  rol: 'Admin',
  tallerId: null, 
}