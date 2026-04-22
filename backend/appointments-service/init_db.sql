-- ============================================================
-- SAMM — Script de inicialización de Base de Datos (Citas)
-- PostgreSQL
-- ============================================================

-- 1. Crear la base de datos (idempotente) y conectarse
SELECT format(
    'CREATE DATABASE samm_citas_db WITH OWNER = %I ENCODING = ''UTF8'' CONNECTION LIMIT = -1;',
    current_user
)
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'samm_citas_db')
\gexec

\c samm_citas_db;

-- Si existe una tabla previa con mayúsculas ("Citas"),  normalizar a minúsculas (citas)
-- para evitar inconsistencia por casing entre SQL y SQLAlchemy.
DO $$
BEGIN
    IF to_regclass('public.citas') IS NULL
       AND to_regclass('public."Citas"') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE "Citas" RENAME TO citas';
    END IF;
END $$;

-- 2. Tabla: pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id_paciente SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla: medicos
CREATE TABLE IF NOT EXISTS medicos (
    id_medico SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    especialidad VARCHAR(80),
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla: recordatorios 
CREATE TABLE IF NOT EXISTS recordatorios (
    id_recordatorio SERIAL PRIMARY KEY,
    -- Tabla huérfana por ahora: se mantiene el campo pero sin FK a una tabla legacy de citas.
    id_cita INT NOT NULL,
    fecha_envio_programada TIMESTAMP NOT NULL,
    tipo VARCHAR(20) DEFAULT 'email', -- email, sms, push
    estado_envio VARCHAR(20) DEFAULT 'pendiente', -- pendiente, enviado, fallido
    fecha_envio_real TIMESTAMP,
    mensaje_enviado TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_recordatorios_programada ON recordatorios(fecha_envio_programada) WHERE estado_envio = 'pendiente';

CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_usuario_creador INTEGER NOT NULL,
    doctor_nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    fecha_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    ubicacion VARCHAR(255),
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'programada', -- programada, confirmada, completada, cancelada
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compatibilidad: si la tabla ya existía sin estas columnas, las agrega sin romper.
ALTER TABLE citas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS id_usuario INTEGER;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS id_usuario_creador INTEGER;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS doctor_nombre VARCHAR(100);
ALTER TABLE citas ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100);
ALTER TABLE citas ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS ubicacion VARCHAR(255);
ALTER TABLE citas ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'programada';

-- Mantener estado consistente: default y tipo (si es seguro por los datos existentes)
DO $$
DECLARE
    max_len_estado INTEGER;
BEGIN
    IF to_regclass('public.citas') IS NOT NULL THEN
        -- Si ya existía con VARCHAR(50) y valores cortos, lo reducimos a 20 para estandarizar.
        SELECT max(length(estado)) INTO max_len_estado FROM citas;
        IF max_len_estado IS NULL OR max_len_estado <= 20 THEN
            ALTER TABLE citas ALTER COLUMN estado TYPE VARCHAR(20);
        END IF;

        ALTER TABLE citas ALTER COLUMN estado SET DEFAULT 'programada';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_citas_id_usuario ON citas (id_usuario);
CREATE INDEX IF NOT EXISTS idx_citas_id_usuario_creador ON citas (id_usuario_creador);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas (fecha_hora);

-- 7. Función/Trigger: actualizar updated_at automáticamente (como en el esquema inicial)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    -- Creamos el trigger solo si no existe en la tabla public.citas
    IF to_regclass('public.citas') IS NOT NULL
       AND NOT EXISTS (
            SELECT 1
            FROM pg_trigger t
            WHERE t.tgname = 'update_citas_updated_at'
              AND t.tgrelid = 'public.citas'::regclass
       ) THEN
        CREATE TRIGGER update_citas_updated_at
            BEFORE UPDATE ON citas
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
