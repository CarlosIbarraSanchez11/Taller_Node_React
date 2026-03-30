-- CreateTable
CREATE TABLE `Pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `tipo` ENUM('TRANSFERENCIA', 'CLIENTE', 'SERVICIO') NOT NULL DEFAULT 'TRANSFERENCIA',
    `estado` ENUM('PENDIENTE', 'DESPACHADO', 'RECHAZADO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `cantidad` INTEGER NOT NULL,
    `placa` VARCHAR(191) NULL,
    `solicitante` VARCHAR(191) NULL,
    `observaciones` VARCHAR(191) NULL,
    `costoMaestroId` INTEGER NOT NULL,
    `tallerId` INTEGER NOT NULL,
    `tallerOrigenId` INTEGER NULL,
    `usuarioId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pedido_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_costoMaestroId_fkey` FOREIGN KEY (`costoMaestroId`) REFERENCES `CostoMaestro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_tallerId_fkey` FOREIGN KEY (`tallerId`) REFERENCES `Taller`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_tallerOrigenId_fkey` FOREIGN KEY (`tallerOrigenId`) REFERENCES `Taller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
