-- AlterTable
ALTER TABLE `ordentrabajo` ADD COLUMN `inspeccionTecnica` JSON NULL,
    ADD COLUMN `progreso` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Hallazgo` (
    `id` VARCHAR(191) NOT NULL,
    `ordenId` VARCHAR(191) NOT NULL,
    `puntoFalla` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `foto` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemOrden` (
    `id` VARCHAR(191) NOT NULL,
    `ordenId` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `precioVenta` DECIMAL(10, 2) NOT NULL,
    `esAdicional` BOOLEAN NOT NULL DEFAULT false,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'SOLICITADO',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Hallazgo` ADD CONSTRAINT `Hallazgo_ordenId_fkey` FOREIGN KEY (`ordenId`) REFERENCES `OrdenTrabajo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemOrden` ADD CONSTRAINT `ItemOrden_ordenId_fkey` FOREIGN KEY (`ordenId`) REFERENCES `OrdenTrabajo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
