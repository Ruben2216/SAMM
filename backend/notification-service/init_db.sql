-- ============================================================
-- SAMM — Base de datos del Notification Service
-- PostgreSQL
-- ============================================================

CREATE DATABASE samm_notifications_db;

\c samm_notifications_db

-- Tabla: Push_Tokens
-- Guarda el token de Expo por cada usuario (1 token por dispositivo/usuario).
CREATE TABLE IF NOT EXISTS "Push_Tokens" (
    "Id_Token"              SERIAL PRIMARY KEY,
    "Id_Usuario"            INT NOT NULL UNIQUE,
    "Push_Token"            VARCHAR(255) NOT NULL,
    "Plataforma"            VARCHAR(20) DEFAULT 'expo',
    "Fecha_Actualizacion"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_usuario
ON "Push_Tokens" ("Id_Usuario");

SELECT 'Tabla Push_Tokens creada exitosamente' AS resultado;
