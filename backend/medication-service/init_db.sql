-- ============================================================
-- SAMM — Script de inicialización: Microservicio de Medicamentos
-- ============================================================

-- Nota: Asegúrense de crear una base de datos 
-- llamada 'samm_medicamentos_db' antes de correr este script.

-- 1. Tabla principal de Medicamentos (RF-06)
CREATE TABLE IF NOT EXISTS "Medicamentos" (
    "Id_Medicamento" SERIAL PRIMARY KEY,
    "Id_Usuario" INTEGER NOT NULL, -- Enlace lógico con identity-service
    "Nombre" VARCHAR(150) NOT NULL,
    "Dosis" VARCHAR(100) NOT NULL,
    "Frecuencia" VARCHAR(100) NOT NULL,
    "Activo" BOOLEAN DEFAULT TRUE,
    "Fecha_Creacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Horarios (RF-07 y RF-08)
CREATE TABLE IF NOT EXISTS "Horarios" (
    "Id_Horario" SERIAL PRIMARY KEY,
    "Id_Medicamento" INTEGER REFERENCES "Medicamentos"("Id_Medicamento") ON DELETE CASCADE,
    "Hora_Toma" TIME NOT NULL
);

-- 3. Tabla de Historial y Cumplimiento (RF-09, RF-10 y RF-11)
CREATE TABLE IF NOT EXISTS "Historial_Tomas" (
    "Id_Historial" SERIAL PRIMARY KEY,
    "Id_Medicamento" INTEGER REFERENCES "Medicamentos"("Id_Medicamento") ON DELETE CASCADE,
    "Fecha_Asignada" DATE NOT NULL,
    "Hora_Asignada" TIME NOT NULL,
    "Estado" VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'tomado', 'omitido'
    "Fecha_Hora_Real_Toma" TIMESTAMP,
    "Alerta_Enviada_Familiar" BOOLEAN DEFAULT FALSE
);

-- 4. Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_med_usuario ON "Medicamentos" ("Id_Usuario");
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON "Historial_Tomas" ("Fecha_Asignada", "Estado");

SELECT 'Tablas de Medicamentos creadas exitosamente' AS resultado;