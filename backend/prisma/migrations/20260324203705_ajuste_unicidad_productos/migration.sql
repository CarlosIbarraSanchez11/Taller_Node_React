/*
  Warnings:

  - A unique constraint covering the columns `[codigo,tallerId]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Producto_codigo_tallerId_key` ON `Producto`(`codigo`, `tallerId`);
