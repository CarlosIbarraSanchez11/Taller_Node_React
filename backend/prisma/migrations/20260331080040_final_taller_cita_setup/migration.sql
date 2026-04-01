/*
  Warnings:

  - Added the required column `tallerId` to the `Cita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Cita` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cita` ADD COLUMN `tallerId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `taller` ADD COLUMN `direccion` VARCHAR(191) NULL,
    ADD COLUMN `telefono` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Cita_tallerId_idx` ON `Cita`(`tallerId`);

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_tallerId_fkey` FOREIGN KEY (`tallerId`) REFERENCES `Taller`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
