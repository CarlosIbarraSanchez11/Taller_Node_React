import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.producto.deleteMany({});
  console.log(`Se eliminaron ${count} productos. Tabla limpia.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());