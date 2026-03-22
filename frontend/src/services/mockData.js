export const talleresMock = [
  { id: 1, nombre: 'Taller 1' },
  { id: 2, nombre: 'Taller 2' },
  { id: 3, nombre: 'Taller 3' },
]

export const usuariosMock = [
  // Taller 1
  { id: 1,  nombre: 'Carlos Pérez',   email: 'carlos@taller.com',  rol: 'Admin',          estado: 'Activo',   tallerId: null },
  { id: 2,  nombre: 'Juan Quispe',    email: 'juan@taller.com',    rol: 'Jefe Mecánico',  estado: 'Activo',   tallerId: 1 },
  { id: 3,  nombre: 'Luis Torres',    email: 'luis@taller.com',    rol: 'Mecánico',       estado: 'Inactivo', tallerId: 1 },
  { id: 4,  nombre: 'Ana Flores',     email: 'ana@taller.com',     rol: 'Mecánico',       estado: 'Activo',   tallerId: 1 },
  // Taller 2
  { id: 5,  nombre: 'Pedro Mamani',   email: 'pedro@taller.com',   rol: 'Jefe Mecánico',  estado: 'Activo',   tallerId: 2 },
  { id: 6,  nombre: 'Rosa Huanca',    email: 'rosa@taller.com',    rol: 'Mecánico',       estado: 'Activo',   tallerId: 2 },
  { id: 7,  nombre: 'Miguel Soto',    email: 'miguel@taller.com',  rol: 'Mecánico',       estado: 'Activo',   tallerId: 2 },
  // Taller 3
  { id: 8,  nombre: 'Elena Vargas',   email: 'elena@taller.com',   rol: 'Jefe Mecánico',  estado: 'Activo',   tallerId: 3 },
  { id: 9,  nombre: 'Diego Castro',   email: 'diego@taller.com',   rol: 'Mecánico',       estado: 'Activo',   tallerId: 3 },
  { id: 10, nombre: 'Sofia Mendoza',  email: 'sofia@taller.com',   rol: 'Mecánico',       estado: 'Inactivo', tallerId: 3 },
]

// Usuario logueado mock (Admin ve todo, Jefe solo su taller)
export const usuarioLogueado = {
  nombre: 'Carlos Pérez',
  rol: 'Admin',
  tallerId: null, // null = ve todos
}