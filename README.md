# SAMM - Sistema de Asistencia Médica para Mayores

Plataforma móvil integral para el cuidado de adultos mayores con arquitectura de microservicios.

## Estructura del Proyecto

```
samm-project/
├── frontend/                # Aplicación Móvil (React Native + Expo)
└── backend/                 # Microservicios (Python FastAPI)
    ├── identity-service/    # Usuarios y Autenticación
    ├── care-service/        # Medicinas, Citas e Historial
    ├── tracking-service/    # Geolocalización
    └── notification-service/# Alertas y Notificaciones Push
```

## Tecnologías

- **Frontend:** React Native, Expo, TypeScript
- **Backend:** Python, FastAPI, PostgreSQL, Redis, RabbitMQ
- **Arquitectura:** Hexagonal (Ports & Adapters) + Microservicios



## Frontend
### Instalar dependencias

Antes de ejecutar la aplicacion, entrar a la carpeta del frontend e instalar las dependencias:

```bash
cd frontend
npm install
```
### Se debe de crear un archivo .env dentro de frontend con:
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoiam9zZTIyMSIsImEiOiJjbW1hMWJiOHAwOXNkMndvb2RlNTB6ZjZhIn0.tLiiTYUFfb_FFgEyfE52Nw

### Ejecutar la aplicacion
Iniciar el servidor de desarrollo con:

```bash
npx expo start --tunnel
Escanear el QR en Expo Go
```

### Entrar como familiar
```bash
familiar@gmail.com
123456
```

### Entrar como adulto mayor
```bash
adulto@gmail.com
123456
```

### Iconos de la barra de navegacion
npm install @react-navigation/bottom-tabs@^6


### Crear entorno virtual en identity (8000)
1. Crearlo: 
    cd backend/identity-service
    python3 -m venv venv
2. Activarlo: source venv/bin/activate
3. Correrlo: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

### Actualizacion para acceder como familiar
1. Activar el entorno virtual de identity-service
2. Instalar lo siguiente para la contraseña: pip install "bcrypt<4.0.0"
3. colocar lo siguiente para el hash de la contraseña: python -c "from passlib.hash import bcrypt; print(bcrypt.hash('123456'))"
4. Copiar el codifo que te de y crearlo en la base de datos:
```bash
INSERT INTO "Usuarios" ("Nombre", "Correo", "Contrasena_Hash", "Rol", "Proveedor_Auth") VALUES ('Pedro Familiar', 'familiar@gmail.com', '$2b$12$U1XGXQ.dtUf5CsQoLWCm2uVWY/.T8/VGaBKH5ZJ/WypgHduV6EA8W', 'familiar', 'local');
```
5. Inicia sesion como familiar

### Actualizacion para acceder como adulto (lo mismo que familiar pero al final):
```bash
INSERT INTO "Usuarios" ("Nombre", "Correo", "Contrasena_Hash", "Rol", "Proveedor_Auth") VALUES ('Abuelo Roberto', 'adulto@gmail.com', '$2b$12$U1XGXQ.dtUf5CsQoLWCm2uVWY/.T8/VGaBKH5ZJ/WypgHduV6EA8W', 'adulto_mayor', 'local');
```
                                        


### Medicamentos (8001)
1. Crear entorno virtual: 
    cd backend/medication-service
    python3 -m venv venv
2. Activarlo: source venv/bin/activate
3. Configurar el .env (se los mando)
4. Ejecutarlo: uvicorn main:app --host 0.0.0.0 --port 8001 --reload
5. Instalar esto (validacion de horarios y toma de pastillas)
    pip install apscheduler tzdata


### Cambiar tabla de usuarios y crear otra (codigo de vinculacion)
```bash
ALTER TABLE "Usuarios"
ADD Codigo_Vinculacion VARCHAR(5) UNIQUE;

CREATE TABLE "Vinculaciones" (
    "Id_Vinculacion" SERIAL PRIMARY KEY,
    "Id_Familiar" INT NOT NULL,
    "Id_Adulto_Mayor" INT NOT NULL,
    "Fecha_Vinculacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_familiar
        FOREIGN KEY ("Id_Familiar") REFERENCES "Usuarios"("Id_Usuario"),

    CONSTRAINT fk_adulto
        FOREIGN KEY ("Id_Adulto_Mayor") REFERENCES "Usuarios"("Id_Usuario")
);

ALTER TABLE "Vinculaciones" ADD COLUMN "Nombre_Circulo" VARCHAR(100);
ALTER TABLE "Vinculaciones" ADD COLUMN "Rol_Adulto_Mayor" VARCHAR(50);


 

```
### citas 
1. crear:
 cd backend/appointments-service
2. crear entorno virtual
 python3 -m venv venv
3. activar el entorno virtual
 source venv/bin/activate
4. instalar dependencias (actualizado)
   pip install -r requirements.txt
5. correr el microservicio
 uvicorn main:app --host 0.0.0.0 --port 8004 --reload


 ### Instalar libreria de calendario y reloj (momentaria)
 1. Ingresar a:
  cd frontend
 2. Correr el siguiente comando:
 npx expo install @react-native-community/datetimepicker
---
### Para `.env` de appointments-service

#Conexión a PostgreSQL 
DATABASE_URL=postgresql://SAMM:samm@localhost:5432/samm_citas_db

#Configuración del Microservicio de Citas
SERVICE_PORT=8004

---
### Base de datos samm_citas_db (momentaria)
```bash
CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_usuario_creador INTEGER NOT NULL,
    doctor_nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    fecha_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    ubicacion VARCHAR(255),
    notas TEXT,
    estado VARCHAR(50) DEFAULT 'programada'
);
```

### `.env` del frontend para consumir citas
EXPO_PUBLIC_API_URL_CITAS=http://TU_IP_LAPTOP:8004
---


### Notificaciones
1. cd backend/notification-service
2. python3 -m venv venv
3. source venv/bin/activate
4. pip install -r requirements.txt
5. uvicorn main:app --host 0.0.0.0 --port 8002 --reload

Agregar esto al .env de frontend 
EXPO_PUBLIC_API_URL_NOTIFICACIONES=http://TU_IP_LAPTOP:8002


# env de identity
SMTP_SERVER=smtp.gmail.com
SMTP_USER=rubenclemente221@gmail.com
SMTP_PASSWORD=myxz qarp fbxl qdew

# Se recomienda no cambiar de momento app.json de frontend, porque al eliminar el projectId rompe el login por el sha-1 que se genera cuando se cambia el id de proyecto, hara que ver la forma de compilar sin afectar a los demas, probablemente en gitignore
