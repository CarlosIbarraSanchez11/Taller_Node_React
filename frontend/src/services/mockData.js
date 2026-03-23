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

// Productos
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

export const proveedoresMock = [
  { id: 1, ruc: '20600000001', razonSocial: 'JAMBO2 S.A.C',          telefono: '921872052', email: 'carlosmanuelibarra11@gmail.com', direccion: 'Av. Los Olivos 123, Lima',         estado: 'Activo' },
  { id: 2, ruc: '20600000002', razonSocial: 'JAMBO3 S.A.C',          telefono: '921872052', email: 'carlosmanuelibarra11@gmail.com', direccion: 'Jr. Comercio 456, Lima',           estado: 'Activo' },
  { id: 3, ruc: '00007231709', razonSocial: 'ZEROX S.A.C',           telefono: '921872052', email: '72317009@istsanpablo.edu.pe',    direccion: 'Av. Industrial 789, Callao',       estado: 'Activo' },
  { id: 4, ruc: '20512345678', razonSocial: 'Repuestos El Chamo SAC', telefono: '999888777', email: 'ventas@elchamo.com',            direccion: 'Av. Las Malvinas 321, Lima',       estado: 'Activo' },
  { id: 5, ruc: '20498765432', razonSocial: 'Autopartes Perú S.R.L', telefono: '955443322', email: 'info@autopartesperu.com',       direccion: 'Calle Los Mecánicos 55, Surco',    estado: 'Inactivo' },
  { id: 6, ruc: '20356789012', razonSocial: 'Distribuidora Bosch Lima', telefono: '912345001', email: 'bosch@distribuidora.pe',    direccion: 'Av. Argentina 1200, Lima',         estado: 'Activo' },
  { id: 7, ruc: '20412398700', razonSocial: 'Filtros & Aceites SAC', telefono: '934001122', email: 'ventas@filtrosaceites.pe',       direccion: 'Jr. Industriales 88, Ate',         estado: 'Activo' },
  { id: 8, ruc: '20301234500', razonSocial: 'TRW Distribuciones E.I.R.L', telefono: '976001234', email: 'trw@dist.pe',             direccion: 'Av. Naciones Unidas 450, SJL',     estado: 'Inactivo' },
];

export const configuracionRentabilidadMock = {
  alquiler: 7,
  gestion: 10,
  marketing: 10,
  herramientas: 2,
  transporte: 5,
  utilidad: 30,
};

// Nota de QA: Esta variable "usuarioLogueado" ya no la usaremos para la lógica real 
// porque ahora tenemos el AuthContext, pero la dejamos por si algún componente viejo aún la llama.
export const usuarioLogueado = {
  nombre: 'Carlos Pérez',
  rol: 'Admin',
  tallerId: null, 
}