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