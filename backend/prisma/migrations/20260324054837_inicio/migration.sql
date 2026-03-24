-- CreateTable
CREATE TABLE `Taller` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Activo',
    `tallerId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_tallerId_idx`(`tallerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehiculo` (
    `placa` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `clienteNom` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`placa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Servicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `precio` DOUBLE NOT NULL,
    `duracion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cita` (
    `id` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hora_inicio` VARCHAR(191) NOT NULL,
    `hora_fin` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `token_confirmacion` VARCHAR(191) NOT NULL,
    `vehiculoPlaca` VARCHAR(191) NOT NULL,
    `tecnicoId` INTEGER NOT NULL,
    `servicioId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cita_token_confirmacion_key`(`token_confirmacion`),
    INDEX `Cita_vehiculoPlaca_idx`(`vehiculoPlaca`),
    INDEX `Cita_tecnicoId_idx`(`tecnicoId`),
    INDEX `Cita_servicioId_idx`(`servicioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_tallerId_fkey` FOREIGN KEY (`tallerId`) REFERENCES `Taller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_vehiculoPlaca_fkey` FOREIGN KEY (`vehiculoPlaca`) REFERENCES `Vehiculo`(`placa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `Servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
