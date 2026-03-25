-- CreateTable
CREATE TABLE `Rentabilidad` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `alquiler` DOUBLE NOT NULL DEFAULT 0,
    `gestion` DOUBLE NOT NULL DEFAULT 0,
    `marketing` DOUBLE NOT NULL DEFAULT 0,
    `herramientas` DOUBLE NOT NULL DEFAULT 0,
    `transporte` DOUBLE NOT NULL DEFAULT 0,
    `utilidad` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
