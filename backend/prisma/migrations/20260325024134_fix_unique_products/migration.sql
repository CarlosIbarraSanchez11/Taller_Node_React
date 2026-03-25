/*
  Warnings:

  - A unique constraint covering the columns `[nombre,marca,medida,tallerId]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Producto_codigo_tallerId_key` ON `producto`;

-- CreateIndex
CREATE UNIQUE INDEX `Producto_nombre_marca_medida_tallerId_key` ON `Producto`(`nombre`, `marca`, `medida`, `tallerId`);
