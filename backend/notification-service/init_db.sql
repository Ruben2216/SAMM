-- ============================================================
-- SAMM — Base de datos del Notification Service
-- PostgreSQL
-- ============================================================

CREATE DATABASE samm_notifications_db;

\c samm_notifications_db

-- Tabla: Push_Tokens
-- Guarda el Expo Push Token por dispositivo.
-- Un usuario puede tener múltiples tokens (uno por dispositivo).
-- El token es único a nivel global: si otro usuario inicia sesión en el mismo
-- dispositivo, el upsert reasigna ese token al nuevo usuario.
CREATE TABLE IF NOT EXISTS "Push_Tokens" (
    "Id_Token"              SERIAL PRIMARY KEY,
    "Id_Usuario"            INT NOT NULL,
    "Push_Token"            VARCHAR(255) NOT NULL UNIQUE,
    "Plataforma"            VARCHAR(20) DEFAULT 'expo',
    "Fecha_Actualizacion"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_usuario
ON "Push_Tokens" ("Id_Usuario");

SELECT 'Tabla Push_Tokens creada exitosamente' AS resultado;
