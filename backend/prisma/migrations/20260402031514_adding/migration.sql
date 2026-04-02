-- AlterTable
ALTER TABLE `hallazgo` ADD COLUMN `cantidad` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `costoMaestroId` INTEGER NULL,
    ADD COLUMN `precioVenta` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `total` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `descripcion` TEXT NULL,
    MODIFY `estado` VARCHAR(191) NOT NULL DEFAULT 'POR ENVIAR';

-- AddForeignKey
ALTER TABLE `Hallazgo` ADD CONSTRAINT `Hallazgo_costoMaestroId_fkey` FOREIGN KEY (`costoMaestroId`) REFERENCES `CostoMaestro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
