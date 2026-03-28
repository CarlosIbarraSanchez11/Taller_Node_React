-- CreateTable
CREATE TABLE `CostoMaestro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `medida` VARCHAR(191) NOT NULL,
    `precioCompra` DOUBLE NOT NULL DEFAULT 0,
    `tiempoHH` DOUBLE NOT NULL DEFAULT 0,
    `costoHH` DOUBLE NOT NULL DEFAULT 0,
    `cantTecnicos` INTEGER NOT NULL DEFAULT 1,
    `precioVenta` DOUBLE NOT NULL DEFAULT 0,

    UNIQUE INDEX `CostoMaestro_nombre_marca_medida_key`(`nombre`, `marca`, `medida`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
