-- CreateTable
CREATE TABLE `inscripciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `horarioId` INTEGER NOT NULL,
    `miembroId` INTEGER NOT NULL,
    `estado` ENUM('confirmada', 'cancelada') NOT NULL DEFAULT 'confirmada',
    `creadaEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inscripciones_horarioId_miembroId_key`(`horarioId`, `miembroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_horarioId_fkey` FOREIGN KEY (`horarioId`) REFERENCES `horarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_miembroId_fkey` FOREIGN KEY (`miembroId`) REFERENCES `miembros`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
