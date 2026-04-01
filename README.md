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
INSERT INTO "Usuarios" ("Nombre", "Correo", "Contrasena_Hash", "Rol", "Proveedor_Auth")
VALUES ('Pedro Familiar', 'familiar@gmail.com', 'TUCODIGOAQUI', 'familiar', 'local');
```
5. Inicia sesion como familiar

### Actualizacion para acceder como adulto (lo mismo que familiar pero al final):
```bash
INSERT INTO "Usuarios" ("Nombre", "Correo", "Contrasena_Hash", "Rol", "Proveedor_Auth")
VALUES ('Abuelo Roberto', 'adulto@gmail.com', 'PEGA_AQUÍ_EL_MISMO_HASH_DE_ANTES', 'adulto_mayor', 'local');
```


### Medicamentos (8001)
1. Crear entorno virtual: python3 -m venv venv
2. Activarlo: source venv/bin/activate
3. Configurar el .env (se los mando)
4. Ejecutarlo: uvicorn main:app --host 0.0.0.0 --port 8001 --reload