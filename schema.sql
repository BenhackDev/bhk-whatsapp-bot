-- ============================================
-- BHK WhatsApp Bot - Esquema de base de datos
-- Motor: MySQL / MariaDB
-- Crear la base y tablas:
--   mysql -u root -p < schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS bhk_bot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bhk_bot;

-- Usuarios registrados (datos sensibles: IDs y alias de tus contactos)
CREATE TABLE IF NOT EXISTS usuarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario VARCHAR(50)  NOT NULL UNIQUE COMMENT 'ID de WhatsApp del usuario',
  alias      VARCHAR(100) NULL COMMENT 'Alias configurado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Registro de uso de comandos
CREATE TABLE IF NOT EXISTS uso_bot (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario VARCHAR(50) NOT NULL,
  comando    VARCHAR(50) NOT NULL,
  fecha      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uso_usuario (id_usuario),
  INDEX idx_uso_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
