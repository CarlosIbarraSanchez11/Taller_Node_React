import { PrismaClient } from '@prisma/client'
import process from 'process';
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando datos iniciales...')

  // 1. Sembrar la Matriz de Rentabilidad (ID: 1)
  const rentabilidad = await prisma.rentabilidad.upsert({
    where: { id: 1 },
    update: {}, // Si ya existe, no hace nada
    create: {
      id: 1,
      alquiler: 10.0,
      gestion: 5.0,
      marketing: 2.0,
      herramientas: 3.0,
      transporte: 1.5,
      utilidad: 20.0,
    },
  })

  console.log('✅ Matriz de Rentabilidad creada:', rentabilidad)

  // Opcional: Podrías sembrar un usuario administrador por defecto aquí
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })