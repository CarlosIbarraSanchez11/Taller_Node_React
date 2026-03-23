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

/* ─── CONFIGURACIÓN DE VEHÍCULOS ─── */
export const TIPOS_VEHICULO = ['Auto', 'SUV', 'Camioneta', 'Moto', 'Camión', 'Furgoneta'];
export const COMBUSTIBLES   = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'GLP', 'GNV'];

/* ─── BASE DE DATOS DE CLIENTES ─── */
export const clientesMock = [
  {
    id: 1,
    nombre: 'Carlos Ibarra Sanchez',
    dni: '72317018',
    telefono: '921872052',
    email: 'carlosmanuelibarra11@gmail.com',
    vehiculo: { placa: 'AAA-111', marca: 'Hyundai', modelo: 'Tucson', anio: 2021, color: 'Gris Plata', combustible: 'Gasolina', tipo: 'SUV' },
    tieneCita: true,
  },
  {
    id: 2,
    nombre: 'Juan Pérez García',
    dni: '45678901',
    telefono: '987654321',
    email: 'juan.perez@gmail.com',
    vehiculo: { placa: 'BBB-222', marca: 'Toyota', modelo: 'Corolla', anio: 2022, color: 'Blanco', combustible: 'Gasolina', tipo: 'Auto' },
    tieneCita: false,
  },
  {
    id: 3,
    nombre: 'María López Quispe',
    dni: '31245678',
    telefono: '912345678',
    email: 'maria.lopez@hotmail.com',
    vehiculo: { placa: 'CCC-333', marca: 'Kia', modelo: 'Sportage', anio: 2020, color: 'Negro', combustible: 'Gasolina', tipo: 'SUV' },
    tieneCita: true,
  },
  {
    id: 4,
    nombre: 'Pedro Mamani Torres',
    dni: '60123456',
    telefono: '943210987',
    email: '',
    vehiculo: { placa: 'DDD-444', marca: 'Nissan', modelo: 'Frontier', anio: 2019, color: 'Plateado', combustible: 'Diésel', tipo: 'Camioneta' },
    tieneCita: false,
  },
  {
    id: 5,
    nombre: 'Rosa Huanca Flores',
    dni: '52349871',
    telefono: '956781234',
    email: 'rosa.huanca@gmail.com',
    vehiculo: { placa: 'EEE-555', marca: 'Honda', modelo: 'Civic', anio: 2023, color: 'Azul', combustible: 'Gasolina', tipo: 'Auto' },
    tieneCita: false,
  },
  {
    id: 6,
    nombre: 'Luis Torres Vargas',
    dni: '41239870',
    telefono: '934567890',
    email: 'luis.torres@empresa.com',
    vehiculo: { placa: 'FFF-666', marca: 'Chevrolet', modelo: 'D-Max', anio: 2018, color: 'Rojo', combustible: 'Diésel', tipo: 'Camioneta' },
    tieneCita: true,
  },
  {
    id: 7,
    nombre: 'Ana Flores Mendoza',
    dni: '70234561',
    telefono: '976543210',
    email: 'ana.flores@gmail.com',
    vehiculo: { placa: 'GGG-777', marca: 'Suzuki', modelo: 'Swift', anio: 2021, color: 'Amarillo', combustible: 'Gasolina', tipo: 'Auto' },
    tieneCita: false,
  },
  {
    id: 8,
    nombre: 'Diego Castro Ramos',
    dni: '63412890',
    telefono: '921098765',
    email: 'diego.castro@outlook.com',
    vehiculo: { placa: 'HHH-888', marca: 'Mazda', modelo: 'CX-5', anio: 2022, color: 'Blanco Perla', combustible: 'Gasolina', tipo: 'SUV' },
    tieneCita: true,
  },
  {
    id: 9,
    nombre: 'Sofia Mendoza Ríos',
    dni: '48901234',
    telefono: '945678901',
    email: 'sofia.mendoza@gmail.com',
    vehiculo: { placa: 'III-999', marca: 'Volkswagen', modelo: 'Golf', anio: 2020, color: 'Gris', combustible: 'Gasolina', tipo: 'Auto' },
    tieneCita: false,
  },
  {
    id: 10,
    nombre: 'Miguel Soto Puma',
    dni: '55678902',
    telefono: '967890123',
    email: '',
    vehiculo: { placa: 'JJJ-000', marca: 'Ford', modelo: 'Ranger', anio: 2017, color: 'Negro', combustible: 'Diésel', tipo: 'Camioneta' },
    tieneCita: false,
  },
];

export const ORIGENES_INTERNOS = ['Carga de stock inicial', 'Ajuste de inventario', 'Transferencia entre talleres'];

export const TIPO_CONFIG = {
  con_ruc: { label: 'Con RUC', sub: 'Proveedor registrado', icon: '📄', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  sin_ruc: { label: 'Sin RUC', sub: 'Compra informal', icon: '🧾', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  interno: { label: 'Ingreso Interno', sub: 'Stock inicial / Ajuste', icon: '👥', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
};

export const movimientosMock = [
  { id: 1, fecha: '2026-02-25T23:37:00', productoId: 1, productoNombre: 'Aceite 5W30 Sintético', marca: 'CASTROL', tipo: 'interno', origen: 'Carga de stock inicial', cantidad: 10, proveedorId: null, proveedorNombre: null, tallerId: 1, estado: 'Aprobado' },
  { id: 2, fecha: '2026-02-25T23:37:00', productoId: 2, productoNombre: 'Aceite 10W30 Semisintético', marca: 'MOBIL', tipo: 'interno', origen: 'Carga de stock inicial', cantidad: 10, proveedorId: null, proveedorNombre: null, tallerId: 1, estado: 'Aprobado' },
  { id: 3, fecha: '2026-02-25T23:37:00', productoId: 9, productoNombre: 'Filtro de Aceite - Sedán', marca: 'BOSCH', tipo: 'interno', origen: 'Carga de stock inicial', cantidad: 10, proveedorId: null, proveedorNombre: null, tallerId: 1, estado: 'Aprobado' },
  { id: 4, fecha: '2026-03-01T10:15:00', productoId: 5, productoNombre: 'Bujías Convencionales x4', marca: 'BOSCH', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 20, proveedorId: 5, proveedorNombre: 'Distribuidora Bosch Lima', tallerId: 1, estado: 'Aprobado' },
  { id: 5, fecha: '2026-03-05T14:30:00', productoId: 6, productoNombre: 'Bujías Iridium x4', marca: 'BOSCH', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 15, proveedorId: 5, proveedorNombre: 'Distribuidora Bosch Lima', tallerId: 1, estado: 'Pendiente' },
  { id: 6, fecha: '2026-03-10T09:00:00', productoId: 15, productoNombre: 'Pastillas de Freno Delanteras', marca: 'BREMBO', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 8, proveedorId: 6, proveedorNombre: 'Filtros & Aceites SAC', tallerId: 2, estado: 'Aprobado' },
  { id: 7, fecha: '2026-03-10T09:00:00', productoId: 16, productoNombre: 'Disco de Freno', marca: 'BREMBO', tipo: 'sin_ruc', origen: 'Compra sin RUC', cantidad: 6, proveedorId: null, proveedorNombre: null, tallerId: 2, estado: 'Pendiente' },
  { id: 8, fecha: '2026-03-12T11:45:00', productoId: 18, productoNombre: 'Batería 12V 60Ah', marca: 'BOSCH', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 4, proveedorId: 3, proveedorNombre: 'ZEROX S.A.C', tallerId: 3, estado: 'Pendiente' },
  { id: 9, fecha: '2026-03-15T08:30:00', productoId: 1, productoNombre: 'Aceite 5W30 Sintético', marca: 'CASTROL', tipo: 'interno', origen: 'Transferencia desde Taller 2', cantidad: 5, proveedorId: null, proveedorNombre: null, tallerId: 1, estado: 'Solicitado' },
  { id: 10, fecha: '2026-03-16T10:00:00', productoId: 12, productoNombre: 'Líquido de Frenos DOT4', marca: 'BOSCH', tipo: 'sin_ruc', origen: 'Compra sin RUC', cantidad: 12, proveedorId: null, proveedorNombre: null, tallerId: 1, estado: 'Aprobado' },
  { id: 11, fecha: '2026-03-17T12:20:00', productoId: 10, productoNombre: 'Filtro de Aire - SUV', marca: 'BOSCH', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 10, proveedorId: 5, proveedorNombre: 'Distribuidora Bosch Lima', tallerId: 2, estado: 'Solicitado' },
  { id: 12, fecha: '2026-03-18T15:45:00', productoId: 18, productoNombre: 'Batería 12V 60Ah', marca: 'BOSCH', tipo: 'interno', origen: 'Carga de stock inicial', cantidad: 3, proveedorId: null, proveedorNombre: null, tallerId: 2, estado: 'Aprobado' },
  { id: 13, fecha: '2026-03-19T09:10:00', productoId: 3, productoNombre: 'Aceite 20W50 Mineral', marca: 'MOBIL', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 24, proveedorId: 6, proveedorNombre: 'Filtros & Aceites SAC', tallerId: 1, estado: 'Pendiente' },
  { id: 14, fecha: '2026-03-20T11:00:00', productoId: 4, productoNombre: 'Refrigerante G12 Red', marca: 'PRESTONE', tipo: 'sin_ruc', origen: 'Compra sin RUC', cantidad: 10, proveedorId: null, proveedorNombre: null, tallerId: 3, estado: 'Aprobado' },
  { id: 15, fecha: '2026-03-20T14:20:00', productoId: 15, productoNombre: 'Pastillas de Freno Delanteras', marca: 'BREMBO', tipo: 'interno', origen: 'Transferencia desde Taller 1', cantidad: 2, proveedorId: null, proveedorNombre: null, tallerId: 2, estado: 'Solicitado' },
  { id: 16, fecha: '2026-03-21T08:00:00', productoId: 8, productoNombre: 'Bujías Platinum x4', marca: 'NGK', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 30, proveedorId: 5, proveedorNombre: 'Distribuidora Bosch Lima', tallerId: 1, estado: 'Aprobado' },
  { id: 17, fecha: '2026-03-21T10:30:00', productoId: 13, productoNombre: 'Limpiaparabrisas 22"', marca: 'BOSCH', tipo: 'sin_ruc', origen: 'Compra sin RUC', cantidad: 8, proveedorId: null, proveedorNombre: null, tallerId: 1, estado: 'Aprobado' },
  { id: 18, fecha: '2026-03-22T13:00:00', productoId: 14, productoNombre: 'Kit de Fajas de Alternador', marca: 'GATES', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 5, proveedorId: 3, proveedorNombre: 'ZEROX S.A.C', tallerId: 2, estado: 'Pendiente' },
  { id: 19, fecha: '2026-03-22T16:15:00', productoId: 2, productoNombre: 'Aceite 10W30 Semisintético', marca: 'MOBIL', tipo: 'interno', origen: 'Transferencia desde Taller 1', cantidad: 6, proveedorId: null, proveedorNombre: null, tallerId: 3, estado: 'Solicitado' },
  { id: 20, fecha: '2026-03-23T08:45:00', productoId: 7, productoNombre: 'Bujías Iridium x1', marca: 'DENSO', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 40, proveedorId: 5, proveedorNombre: 'Distribuidora Bosch Lima', tallerId: 1, estado: 'Aprobado' },
  { id: 21, fecha: '2026-03-23T09:30:00', productoId: 11, productoNombre: 'Filtro de Aire - Sedán', marca: 'BOSCH', tipo: 'sin_ruc', origen: 'Compra sin RUC', cantidad: 15, proveedorId: null, proveedorNombre: null, tallerId: 1, estado: 'Aprobado' },
  { id: 22, fecha: '2026-03-23T10:15:00', productoId: 17, productoNombre: 'Zapatas de Freno Post.', marca: 'BREMBO', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 10, proveedorId: 6, proveedorNombre: 'Filtros & Aceites SAC', tallerId: 2, estado: 'Pendiente' },
  { id: 23, fecha: '2026-03-23T11:00:00', productoId: 5, productoNombre: 'Bujías Convencionales x4', marca: 'BOSCH', tipo: 'interno', origen: 'Ajuste de inventario', cantidad: 4, proveedorId: null, proveedorNombre: null, tallerId: 3, estado: 'Aprobado' },
  { id: 24, fecha: '2026-03-23T12:00:00', productoId: 1, productoNombre: 'Aceite 5W30 Sintético', marca: 'CASTROL', tipo: 'con_ruc', origen: 'Compra con RUC', cantidad: 12, proveedorId: 6, proveedorNombre: 'Filtros & Aceites SAC', tallerId: 1, estado: 'Pendiente' },
  { id: 25, fecha: '2026-03-23T13:30:00', productoId: 9, productoNombre: 'Filtro de Aceite - Sedán', marca: 'BOSCH', tipo: 'interno', origen: 'Transferencia desde Taller 1', cantidad: 10, proveedorId: null, proveedorNombre: null, tallerId: 2, estado: 'Solicitado' },
];

export const pedidosMock = [
  { id: 101, fecha: '2026-03-23T08:30:00', referencia: 'ABC-123', repuesto: 'Aceite 5W30', solicitante: 'Mec. Juan Pérez', cantidad: 4, stockSede: 10, estado: 'SOLICITADO', tallerId: 1 },
  { id: 102, fecha: '2026-03-23T09:15:00', referencia: 'TKT-990', repuesto: 'Filtro de Aire', solicitante: 'Carlos Cliente', cantidad: 1, stockSede: 5, estado: 'SOLICITADO POR CLIENTE', tallerId: 1 },
  { id: 103, fecha: '2026-03-23T10:00:00', referencia: 'TRANS-01', repuesto: 'Pastillas Freno', solicitante: 'Taller Surco', cantidad: 2, stockSede: 0, estado: 'SOLICITADO POR TALLER', tallerId: 1 },
  
];

// Nota de QA: Esta variable "usuarioLogueado" ya no la usaremos para la lógica real 
// porque ahora tenemos el AuthContext, pero la dejamos por si algún componente viejo aún la llama.
export const usuarioLogueado = {
  nombre: 'Carlos Pérez',
  rol: 'Admin',
  tallerId: null, 
}