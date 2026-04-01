-- CreateTable
CREATE TABLE `OrdenTrabajo` (
    `id` VARCHAR(191) NOT NULL,
    `citaId` VARCHAR(191) NOT NULL,
    `mecanicoId` INTEGER NOT NULL,
    `kilometraje` INTEGER NOT NULL,
    `nivelCombustible` VARCHAR(191) NOT NULL,
    `gradoAceite` VARCHAR(191) NULL,
    `marcaAceiteSugerida` VARCHAR(191) NULL,
    `inventario` JSON NOT NULL,
    `observaciones` TEXT NULL,
    `fotos` JSON NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'RECIBIDO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrdenTrabajo_citaId_key`(`citaId`),
    INDEX `OrdenTrabajo_citaId_idx`(`citaId`),
    INDEX `OrdenTrabajo_mecanicoId_idx`(`mecanicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenTrabajo` ADD CONSTRAINT `OrdenTrabajo_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenTrabajo` ADD CONSTRAINT `OrdenTrabajo_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
