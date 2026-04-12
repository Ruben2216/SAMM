-- 1. Crear la base de datos (si no existe)
CREATE DATABASE samm_citas_db
    WITH 
    OWNER = SAMM
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- Conectar a la nueva base
\c samm_citas_db;

-- 2. Tabla: pacientes
CREATE TABLE pacientes (
    id_paciente SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla: medicos
CREATE TABLE medicos (
    id_medico SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    especialidad VARCHAR(80),
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla: citas 
CREATE TABLE citas (
    id_cita SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES pacientes(id_paciente) ON DELETE RESTRICT,
    id_medico INT NOT NULL REFERENCES medicos(id_medico) ON DELETE RESTRICT,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    lugar VARCHAR(150),
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmada, completada, cancelada
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla: recordatorios 
CREATE TABLE recordatorios (
    id_recordatorio SERIAL PRIMARY KEY,
    id_cita INT NOT NULL REFERENCES citas(id_cita) ON DELETE CASCADE,
    fecha_envio_programada TIMESTAMP NOT NULL,
    tipo VARCHAR(20) DEFAULT 'email', -- email, sms, push
    estado_envio VARCHAR(20) DEFAULT 'pendiente', -- pendiente, enviado, fallido
    fecha_envio_real TIMESTAMP,
    mensaje_enviado TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Índices para rendimiento
CREATE INDEX idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX idx_citas_paciente ON citas(id_paciente);
CREATE INDEX idx_citas_medico ON citas(id_medico);
CREATE INDEX idx_recordatorios_programada ON recordatorios(fecha_envio_programada) WHERE estado_envio = 'pendiente';

-- 7. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_citas_updated_at
    BEFORE UPDATE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
