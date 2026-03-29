/*
  Warnings:

  - You are about to drop the column `categoria` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `marca` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `medida` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[costoMaestroId,tallerId]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoria` to the `CostoMaestro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costoMaestroId` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Producto_nombre_marca_medida_tallerId_key` ON `producto`;

-- AlterTable
ALTER TABLE `costomaestro` ADD COLUMN `categoria` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `producto` DROP COLUMN `categoria`,
    DROP COLUMN `codigo`,
    DROP COLUMN `marca`,
    DROP COLUMN `medida`,
    DROP COLUMN `nombre`,
    ADD COLUMN `costoMaestroId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `IngresoStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `costoMaestroId` INTEGER NOT NULL,
    `tallerId` INTEGER NOT NULL,
    `tallerOrigenId` INTEGER NULL,
    `proveedorId` INTEGER NULL,
    `usuarioId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `IngresoStock_costoMaestroId_idx`(`costoMaestroId`),
    INDEX `IngresoStock_tallerId_idx`(`tallerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Producto_costoMaestroId_tallerId_key` ON `Producto`(`costoMaestroId`, `tallerId`);

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_costoMaestroId_fkey` FOREIGN KEY (`costoMaestroId`) REFERENCES `CostoMaestro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoStock` ADD CONSTRAINT `IngresoStock_costoMaestroId_fkey` FOREIGN KEY (`costoMaestroId`) REFERENCES `CostoMaestro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoStock` ADD CONSTRAINT `IngresoStock_tallerId_fkey` FOREIGN KEY (`tallerId`) REFERENCES `Taller`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoStock` ADD CONSTRAINT `IngresoStock_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoStock` ADD CONSTRAINT `IngresoStock_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
