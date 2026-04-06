-- CreateTable
CREATE TABLE `Lavado` (
    `id` VARCHAR(191) NOT NULL,
    `citaId` VARCHAR(191) NOT NULL,
    `fotoFinal` VARCHAR(191) NULL,
    `checklist` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Lavado_citaId_key`(`citaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Lavado` ADD CONSTRAINT `Lavado_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
