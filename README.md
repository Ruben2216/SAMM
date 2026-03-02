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
npx expo start
```

Opciones disponibles una vez iniciado:

- `a` → abrir Android  
- `w` → abrir Web  

### Si aparece error al usar Web

Si al presionar `w` aparece un error, ejecutar esto:

```bash
npx expo install react-native-web react-dom @expo/webpack-config
```

Luego reinicia el servidor:

```bash
Ctrl + C
npx expo start
```