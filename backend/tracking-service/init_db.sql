-- ============================================================
-- SAMM — Script de inicialización: Microservicio de Rastreo
-- ============================================================

-- Nota: Asegúrense de crear una base de datos
-- llamada 'samm_tracking_db' antes de correr este script.

-- 1. Tabla de Configuración de Rastreo por Familiar
--    Un familiar puede configurar la frecuencia con la que
--    quiere recibir la ubicación de sus adultos mayores.

create database samm_tracking_db;
\c samm_tracking_db;


CREATE TABLE IF NOT EXISTS "Configuracion_Rastreo" ("Id_Config" SERIAL PRIMARY KEY, "Id_Familiar" INTEGER NOT NULL, "Id_Adulto_Mayor" INTEGER NOT NULL,  "Frecuencia_Minutos"  INTEGER NOT NULL DEFAULT 10, "Activo" BOOLEAN DEFAULT FALSE, "Fecha_Actualizacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,UNIQUE ("Id_Familiar", "Id_Adulto_Mayor")  );

-- 2. Tabla de Ubicaciones
--    Guarda las coordenadas enviadas por el adulto mayor.
--    MÁXIMO 4 registros por adulto mayor (se elimina el más antiguo automáticamente via trigger).
CREATE TABLE IF NOT EXISTS "Ubicaciones" (
    "Id_Ubicacion"    SERIAL PRIMARY KEY,
    "Id_Adulto_Mayor" INTEGER NOT NULL,
    "Latitud"         DECIMAL(10, 8) NOT NULL,
    "Longitud"        DECIMAL(11, 8) NOT NULL,
    "Fecha_Hora"      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Precision_Metros" DECIMAL(6, 2)
);

-- 3. Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_ubicacion_adulto ON "Ubicaciones" ("Id_Adulto_Mayor");
CREATE INDEX IF NOT EXISTS idx_ubicacion_fecha  ON "Ubicaciones" ("Id_Adulto_Mayor", "Fecha_Hora" DESC);
CREATE INDEX IF NOT EXISTS idx_config_familiar  ON "Configuracion_Rastreo" ("Id_Familiar");
CREATE INDEX IF NOT EXISTS idx_config_adulto    ON "Configuracion_Rastreo" ("Id_Adulto_Mayor");

-- 4. Función + Trigger para mantener máximo 4 ubicaciones por adulto mayor
--    Se ejecuta automáticamente DESPUÉS de cada INSERT en Ubicaciones.
CREATE OR REPLACE FUNCTION limpiar_ubicaciones_antiguas()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM "Ubicaciones"
    WHERE "Id_Adulto_Mayor" = NEW."Id_Adulto_Mayor"
      AND "Id_Ubicacion" NOT IN (
          SELECT "Id_Ubicacion"
          FROM "Ubicaciones"
          WHERE "Id_Adulto_Mayor" = NEW."Id_Adulto_Mayor"
          ORDER BY "Fecha_Hora" DESC
          LIMIT 4
      );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_limpiar_ubicaciones
AFTER INSERT ON "Ubicaciones"
FOR EACH ROW
EXECUTE FUNCTION limpiar_ubicaciones_antiguas();

SELECT 'Tablas de Rastreo creadas exitosamente' AS resultado;