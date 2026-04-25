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

### 22/04/2026 pantalla de mapa. 
para que no te de un error las targetas 
cd frontend -> npm install (ya lo sabes) 
npm install @gorhom/bottom-sheet
npm install react-native-reanimated react-native-gesture-handler
npx expo install react-native-reanimated react-native-gesture-handler
y ya no deberia de dar ningun problema

# Se recomienda no cambiar de momento app.json de frontend, porque al eliminar el projectId rompe el login por el sha-1 que se genera cuando se cambia el id de proyecto, hara que ver la forma de compilar sin afectar a los demas, probablemente en gitignore


PARA ABRIR LOS MICROSERVICIOS DE UNA SOLA DEBEN
1. crear la carpeta .vscode en la raiz del proyecto, debe estar como "...\SAMM\.vscode" fuera de backend y frontend
2. crear un archivo llamado "tasks.json"
3. pegar el siguiente contenido dentro de tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "SAMM: Levantar Backend",
            "dependsOn": [
                "Identity Service",
                "Medication Service",
                "Notification Service",
                "Appointments Service"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "icon": { "id": "rocket", "color": "terminal.ansiYellow" }
        },
        {
            "label": "Identity Service",
            "type": "shell",
            "command": "cd backend/identity-service; ./venv/Scripts/python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000",
            "isBackground": true,
            "icon": { "id": "shield", "color": "terminal.ansiCyan" },
            "presentation": { "reveal": "always", "panel": "dedicated" }
        },
        {
            "label": "Medication Service",
            "type": "shell",
            "command": "cd backend/medication-service; ./venv/Scripts/python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8001",
            "isBackground": true,
            "icon": { "id": "beaker", "color": "terminal.ansiGreen" },
            "presentation": { "reveal": "always", "panel": "dedicated" }
        },
        {
            "label": "Notification Service",
            "type": "shell",
            "command": "cd backend/notification-service; ./venv/Scripts/python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8002",
            "isBackground": true,
            "icon": { "id": "bell", "color": "terminal.ansiRed" },
            "presentation": { "reveal": "always", "panel": "dedicated" }
        },
        {
            "label": "Appointments Service",
            "type": "shell",
            "command": "cd backend/appointments-service; ./venv/Scripts/python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8004",
            "isBackground": true,
            "icon": { "id": "calendar", "color": "terminal.ansiMagenta" },
            "presentation": { "reveal": "always", "panel": "dedicated" }
        }
    ]
}
4. Con el atajo de ctrl + shift + p, buscar "Tasks:Run Task" darle enter y despues a SAMM: Levantar Backend
5. se abriran las 4 terminales y para reiniciar lo mismo pero en la terminal que se quiere reiniciar

# Nuevo en .env de idendity-service 
SAMM_PUBLIC_URL=http://192.168.100.7:8000
---



## Notificaciones push (FCM + Expo) — (le pedia a la IA que me hiciera una guía completa para quienes continuaran con este microservicio)

Las push notifications del familiar (recordatorio a la hora del medicamento y alerta de "medicación olvidada") viajan por **Expo Push Service → Firebase Cloud Messaging (FCM) → dispositivo**. Para que funcionen cada desarrollador del equipo debe vincular su propia cuenta de Expo a un proyecto de Firebase y subir la Service Account Key. El APK no necesita recompilarse tras configurar las credenciales: viven en los servidores de Expo.

> **Importante:** los push SÓLO funcionan en el APK compilado (development build / preview / production). **En Expo Go los push notifications no funcionan en SDK 53+**. Para desarrollo local se usan notificaciones **locales** (el adulto mayor ve su alarma aunque no haya FCM). El familiar SÍ requiere FCM sí o sí.

### 1. Prerrequisitos (una sola vez por desarrollador)

- Cuenta en [expo.dev](https://expo.dev) (gratis).
- Tener instalado `eas-cli`:
  ```bash
  npm install -g eas-cli
  ```
- Acceso al proyecto Firebase `samm-app` (pedir al admin que te invite como `Editor`) **o** crear tu propio proyecto Firebase de pruebas.

### 2. Usar un `projectId` propio de Expo (recomendado para cada dev)

El `app.json` del repo tiene `"owner": "fernandovargas15"` y un `projectId` fijo. Si no eres miembro de esa cuenta de Expo, no podrás subir credenciales (verás `Entity not authorized`). Soluciones:

**Opción A (ideal):** pide al owner (`fernandovargas15`) que te invite:
- Owner entra a [expo.dev](https://expo.dev) → **Account settings → Members → Invite** → correo → rol **Admin**.
- Aceptas la invitación y con eso ya tienes permisos sobre el projectId existente. Salta al paso 3.

**Opción B (si no puedes ser invitado):** crea tu propio projectId en tu cuenta de Expo.
1. Haz logout del owner y entra con tu cuenta:
   ```bash
   cd frontend
   npx eas logout
   npx eas login
   ```
2. Edita `frontend/app.json`:
   - Cambia `"owner": "fernandovargas15"` a tu **username de Expo**.
   - Vacía el id del proyecto:
     ```json
     "extra": { "eas": {} }
     ```
3. Inicializa el proyecto en tu cuenta:
   ```bash
   npx eas init
   ```
   Esto rellena `extra.eas.projectId` con uno nuevo a tu nombre.
4. ⚠️ Al cambiar el `projectId` **cambia el SHA-1 y cambian los Expo Push Tokens**. Tienes que **recompilar el APK** (`npx expo run:android`) y cada usuario debe cerrar sesión y volver a entrar para regenerar su token en el `notification-service`.
5. **No subas estos cambios al repo** (`app.json` con tu owner). Mantén los cambios locales o agrégalos a `.gitignore`. (Esto es con la finalidad de no afectar a los demas en el caso de que hagan sus propias pruebas).

### 3. Configurar Firebase (una vez por proyecto Firebase), (En mi caso se me olvido agregarlo en el .gitignore y se subio (no debe ser asi) pero ya que esta pueden utilizar ese, igual es de una cuenta que es unicamente para probar todo esto no hay problema), pero esto fue lo que hice para configurar eso.

1. Entra a [Firebase Console](https://console.firebase.google.com) → selecciona tu proyecto (`samm-app` si eres miembro, o el que creaste).
2. **Project Settings** (⚙️) → pestaña **General**:
   - En **Your apps** debe existir una app Android con el package name **`com.samm.app`** (el que figura en `app.json`).
   - Si no existe: **Add app → Android → Package name `com.samm.app`** → registra → descarga `google-services.json`.
3. Copia ese `google-services.json` a `frontend/google-services.json` (ya referenciado en `app.json` como `"googleServicesFile": "./google-services.json"`).
4. Pestaña **Service accounts**:
   - Asegúrate de estar en **Firebase Admin SDK**.
   - Pulsa **Generate new private key** → descarga el `.json` (lo llamaré `samm-fcm-sa.json`). **No lo subas al repo** — es una credencial secreta.
5. Habilita la **Firebase Cloud Messaging API (V1)**:
   - Entra a [Google Cloud Console](https://console.cloud.google.com) con la misma cuenta.
   - Arriba a la izquierda selecciona **el mismo proyecto** de Firebase.
   - **APIs & Services → Library** → busca **"Firebase Cloud Messaging API"** → **Enable**.

### 4. Subir la Service Account Key a Expo

```bash
cd frontend
npx eas credentials
```

Responde:
1. **Platform:** `Android`
2. **Build profile:** `development` (o el que uses)
3. Elige **Google Service Account**
4. Elige **Manage your Google Service Account Key for Push Notifications (FCM V1)**
5. **Set up a Google Service Account Key for Push Notifications (FCM V1)**
6. **Upload a new service account key** → selecciona el `samm-fcm-sa.json` del paso 3.4.

Para verificar que quedó bien, vuelve a correr `npx eas credentials` y busca en el resumen:
```
Google Service Account Key For FCM V1: Configured
```

### 5. Levantar los servicios y probar

Con los servicios corriendo (identity 8000, medicamentos 8001, notificaciones 8002):

1. **Instala el APK en el teléfono del familiar** y haz login con un familiar vinculado al adulto. En el log de `notification-service` debe aparecer:
   ```
   [API] PUT /push-tokens — Id_Usuario: <id_familiar>
   ```
2. **En la cuenta del adulto** agrega/edita un medicamento con hora **2 minutos en el futuro**. No lo marques como tomado.
3. Al minuto exacto, en `medication-service`:
   ```
   [Recordatorio] Familiares notificados: med <nombre> @ HH:MM
   ```
   Y en `notification-service`:
   ```
   [Push] Enviado a 1 token(s). HTTP 200. Respuesta: {'data': [{'status': 'ok', 'id': '...'}]}
   ```
   → El familiar recibe la push **"Hora del medicamento"** → `"<adulto> debe tomar <medicamento> (HH:MM)"`.
4. **No marques** el medicamento como tomado durante 30 min. Al llegar los 30 min (tolerancia), en `medication-service`:
   ```
   ¡ALERTA! Se olvidó la medicina ID <X> de las HH:MM
   ```
   El familiar recibe push **"Medicación olvidada"**. Al tocar la push se abre `AlertaMedicamento` con alarma sonora + vibración, botón **Llamar** (marca al teléfono del adulto si lo tiene registrado en su Perfil de Salud) y **Cerrar**.

### 6. Troubleshooting (estos son algunos errores que les pueden salir y sus soluciones)

| Error en logs | Causa | Solución |
|---|---|---|
| `'details': {'error': 'InvalidCredentials'}` | No hay FCM Service Account en Expo | Repetir paso 4 |
| `'details': {'error': 'DeviceNotRegistered'}` | El token de Expo ya expiró (reinstalación del APK, cambio de projectId, etc.) | Usuario cierra sesión y vuelve a entrar para regenerar token |
| `[Push] Sin tokens para enviar` | El familiar aún no ha iniciado sesión en este APK, o no está vinculado al adulto | Verifica `Push_Tokens` en `samm_notifications_db` y `Vinculaciones` en `samm_db` |
| `Entity not authorized` al correr `eas credentials` | Logueado con una cuenta Expo que no es dueña del proyecto | Pasos de sección 2 (Opción A o B) |
| La push se ve pero no hace sonido | Canal de Android desactivado | Ajustes → Apps → SAMM → Notificaciones → **Alertas del familiar** → activar |
| Nada aparece en logs del scheduler | Se corrió el service antes de los cambios | Reiniciar `medication-service`; verificar que el arranque diga `Cron Jobs iniciados (recordar_familiares + verificar_incumplimientos)` |

### 7. Archivos sensibles — NO subir al repo (algunas cosas ya se subieron pero simplemente para recalcar que no se deben de subir)

Añadir al `.gitignore` local (si no están ya):
```
frontend/google-services.json
frontend/*.env
*.fcm.json
samm-fcm-sa.json
```

(Ignorar es para mis pruebas):
    "owner": "fernandovargas15"
    "projectId": "4485bdc1-955f-4d0a-b42e-6d52bda26196"
