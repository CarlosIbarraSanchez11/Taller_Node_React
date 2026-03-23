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

export const productosMock = [
  { id: 1,  nombre: 'Aceite 10W30 Semisintético',    codigo: null, marca: 'Mobil',      categoria: 'Aceites',     stockActual: 10, stockMin: 5, medida: 'LITROS', tallerId: 1 },
  { id: 2,  nombre: 'Aceite 15W40 Diesel',           codigo: null, marca: 'Shell',      categoria: 'Aceites',     stockActual: 10, stockMin: 5, medida: 'LITROS', tallerId: 1 },
  { id: 3,  nombre: 'Aceite 20W50 Mineral',          codigo: null, marca: 'Vistony',    categoria: 'Aceites',     stockActual: 10, stockMin: 5, medida: 'LITROS', tallerId: 1 },
  { id: 4,  nombre: 'Aceite 5W30 Sintético',         codigo: null, marca: 'Castrol',    categoria: 'Aceites',     stockActual: 10, stockMin: 5, medida: 'LITROS', tallerId: 1 },
  { id: 5,  nombre: 'Bujías Convencionales x4',      codigo: null, marca: 'Bosch',      categoria: 'Motor',       stockActual: 29, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 6,  nombre: 'Bujías Iridium x4',             codigo: null, marca: 'Bosch',      categoria: 'Motor',       stockActual: 45, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 7,  nombre: 'Cremallera',                    codigo: null, marca: 'TRW',        categoria: 'Suspensión',  stockActual: 50, stockMin: 5, medida: 'PAR',    tallerId: 1 },
  { id: 8,  nombre: 'Cremallera de Nylon',           codigo: null, marca: 'TRW',        categoria: 'Fluidos',     stockActual: 60, stockMin: 5, medida: 'PAR',    tallerId: 1 },
  { id: 9,  nombre: 'Filtro de Aceite - Sedán',      codigo: null, marca: 'Bosch',      categoria: 'Filtros',     stockActual: 10, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 10, nombre: 'Filtro de Aceite - SUV',        codigo: null, marca: 'Filgo',      categoria: 'Filtros',     stockActual: 10, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 11, nombre: 'Filtro de Aire Cabina (A/C)',   codigo: null, marca: 'Generic',    categoria: 'Filtros',     stockActual: 10, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 12, nombre: 'Filtro de Aire Motor',          codigo: null, marca: 'Mann',       categoria: 'Filtros',     stockActual: 10, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 13, nombre: 'Filtro de Combustible Diesel',  codigo: null, marca: 'Bosch',      categoria: 'Filtros',     stockActual: 10, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 14, nombre: 'Limpiaparabrisas Concentrado',  codigo: null, marca: 'Dr. Motors', categoria: 'Fluidos',     stockActual: 10, stockMin: 5, medida: 'UNID',   tallerId: 1 },
  { id: 15, nombre: 'Pastillas de Freno Delanteras', codigo: null, marca: 'Brembo',     categoria: 'Frenos',      stockActual: 8,  stockMin: 3, medida: 'PAR',    tallerId: 2 },
  { id: 16, nombre: 'Disco de Freno',                codigo: null, marca: 'Brembo',     categoria: 'Frenos',      stockActual: 6,  stockMin: 2, medida: 'UNID',   tallerId: 2 },
  { id: 17, nombre: 'Aceite ATF Transmisión',        codigo: null, marca: 'Mobil',      categoria: 'Transmisión', stockActual: 15, stockMin: 5, medida: 'LITROS', tallerId: 2 },
  { id: 18, nombre: 'Batería 12V 60Ah',              codigo: null, marca: 'Bosch',      categoria: 'Eléctrico',   stockActual: 4,  stockMin: 2, medida: 'UNID',   tallerId: 3 },
  { id: 19, nombre: 'Correa de Distribución',        codigo: null, marca: 'Gates',      categoria: 'Motor',       stockActual: 7,  stockMin: 3, medida: 'UNID',   tallerId: 3 },
]

// Nota de QA: Esta variable "usuarioLogueado" ya no la usaremos para la lógica real 
// porque ahora tenemos el AuthContext, pero la dejamos por si algún componente viejo aún la llama.
export const usuarioLogueado = {
  nombre: 'Carlos Pérez',
  rol: 'Admin',
  tallerId: null, 
}