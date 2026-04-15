-- ============================================================
-- SAMM — Script de inicialización de Base de Datos
-- PostgreSQL
-- ============================================================

-- 2. Crear la base de datos
CREATE DATABASE samm_db;

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
    "url_Avatar"        VARCHAR(2048),
    "Rol"               VARCHAR(20),
    "Activo"            BOOLEAN DEFAULT TRUE,
    "Fecha_Registro"    DATE NOT NULL DEFAULT CURRENT_DATE
);

-- === README (líneas 96-119): Código de vinculación + tabla Vinculaciones ===

-- ALTER TABLE "Usuarios" ADD Codigo_Vinculacion VARCHAR(5) UNIQUE;
ALTER TABLE "Usuarios"
ADD COLUMN IF NOT EXISTS "Codigo_Vinculacion" VARCHAR(5);

-- Unicidad (permite múltiples NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_codigo_vinculacion
ON "Usuarios" ("Codigo_Vinculacion")
WHERE "Codigo_Vinculacion" IS NOT NULL;

-- CREATE TABLE "Vinculaciones" (...)
CREATE TABLE IF NOT EXISTS "Vinculaciones" (
    "Id_Vinculacion" SERIAL PRIMARY KEY,
    "Id_Familiar" INT NOT NULL,
    "Id_Adulto_Mayor" INT NOT NULL,
    "Fecha_Vinculacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Nombre_Circulo" VARCHAR(100),
    "Rol_Adulto_Mayor" VARCHAR(50)
);

-- ALTER TABLE "Vinculaciones" ADD COLUMN "Nombre_Circulo" ...;
ALTER TABLE "Vinculaciones" ADD COLUMN IF NOT EXISTS "Nombre_Circulo" VARCHAR(100);

-- ALTER TABLE "Vinculaciones" ADD COLUMN "Rol_Adulto_Mayor" ...;
ALTER TABLE "Vinculaciones" ADD COLUMN IF NOT EXISTS "Rol_Adulto_Mayor" VARCHAR(50);

-- Constraints fk_familiar / fk_adulto (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_familiar') THEN
        ALTER TABLE "Vinculaciones"
        ADD CONSTRAINT fk_familiar
            FOREIGN KEY ("Id_Familiar") REFERENCES "Usuarios"("Id_Usuario");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_adulto') THEN
        ALTER TABLE "Vinculaciones"
        ADD CONSTRAINT fk_adulto
            FOREIGN KEY ("Id_Adulto_Mayor") REFERENCES "Usuarios"("Id_Usuario");
    END IF;
END $$;

-- 6. Crear índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON "Usuarios" ("Correo");
CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON "Usuarios" ("Google_Id");


-- 7. Verificar
SELECT 'Tabla Usuarios creada exitosamente' AS resultado;
