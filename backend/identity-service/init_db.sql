-- ============================================================
-- SAMM — Script de inicialización de Base de Datos
-- PostgreSQL
-- ============================================================

-- 1. Crear el usuario SAMM

-- 2. Crear la base de datos
CREATE DATABASE samm_db ;

-- 3. Conectarse a la base de datos
\c samm_db

-- 5. Crear la tabla Usuarios
CREATE TABLE IF NOT EXISTS "Usuarios" (
    "Id_Usuario"        SERIAL PRIMARY KEY,
    "Nombre"            VARCHAR(150) NOT NULL,
    "Correo"            VARCHAR(255) UNIQUE NOT NULL,
    "Contrasena_Hash"   VARCHAR(255),
    "Proveedor_Auth"    VARCHAR(20) NOT NULL DEFAULT 'local',
    "Google_Id"         VARCHAR(255) UNIQUE,
    "Rol"               VARCHAR(20),
    "Activo"            BOOLEAN DEFAULT TRUE,
    "Fecha_Registro"    DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 6. Crear índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON "Usuarios" ("Correo");
CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON "Usuarios" ("Google_Id");

-- 7. Verificar
SELECT 'Tabla Usuarios creada exitosamente' AS resultado;
