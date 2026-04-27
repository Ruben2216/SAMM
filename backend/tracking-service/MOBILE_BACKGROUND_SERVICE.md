# Servicio en Segundo Plano — Guía de Implementación Móvil

Este documento explica cómo el teléfono del adulto mayor debe implementar
el envío periódico de ubicación, **incluso cuando la app está cerrada**.

---

## ¿Por qué es necesario un servicio en segundo plano?

El endpoint `POST /rastreo/ubicacion` espera recibir coordenadas periódicamente.
Esas coordenadas tienen que venir del teléfono del adulto mayor.
Para que esto funcione aunque la app esté cerrada, el teléfono necesita un
**servicio nativo en segundo plano** que se mantenga vivo y haga la llamada HTTP.

---

## Android — WorkManager (Recomendado)

WorkManager es la API oficial de Android para tareas en segundo plano.
Sobrevive a reinicios del teléfono y a que el usuario cierre la app.

### Flujo completo

```
Adulto mayor activa switch "Activar mi rastreo"
        │
        ▼
App llama a: POST /rastreo/toggle  { Id_Adulto_Mayor: X, Activo: true }
        │
        ▼
App consulta: GET /rastreo/adulto/{X}/frecuencia  → { frecuencia_minutos: 10 }
        │
        ▼
App registra WorkManager con PeriodicWorkRequest(repeatInterval = 10 min)
        │
        ▼
Cada 10 minutos WorkManager ejecuta LocationWorker:
    1. Obtiene GPS actual
    2. Llama: POST /rastreo/ubicacion { Id_Adulto_Mayor, Latitud, Longitud }
        │
        ▼
Adulto mayor desactiva switch
        │
        ▼
App cancela WorkManager y llama: POST /rastreo/toggle { Activo: false }
```

### Código de referencia (Kotlin)

```kotlin
// 1. Definir el Worker
class LocationWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val idAdultoMayor = inputData.getInt("id_adulto_mayor", -1)
        val location = obtenerUbicacionActual() // usar FusedLocationProviderClient

        val response = trackingApi.enviarUbicacion(
            UbicacionRequest(
                Id_Adulto_Mayor  = idAdultoMayor,
                Latitud          = location.latitude,
                Longitud         = location.longitude,
                Precision_Metros = location.accuracy
            )
        )
        return if (response.isSuccessful) Result.success() else Result.retry()
    }
}

// 2. Registrar el Worker cuando el switch se activa
fun activarRastreo(idAdultoMayor: Int, frecuenciaMinutos: Long) {
    val data = workDataOf("id_adulto_mayor" to idAdultoMayor)

    val request = PeriodicWorkRequestBuilder<LocationWorker>(
        repeatInterval = frecuenciaMinutos,
        repeatIntervalTimeUnit = TimeUnit.MINUTES
    )
    .setInputData(data)
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .build()

    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "rastreo_${idAdultoMayor}",
        ExistingPeriodicWorkPolicy.UPDATE,
        request
    )
}

// 3. Cancelar cuando el switch se desactiva
fun desactivarRastreo(idAdultoMayor: Int) {
    WorkManager.getInstance(context).cancelUniqueWork("rastreo_${idAdultoMayor}")
}
```

### Permisos requeridos en AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## iOS — BGTaskScheduler

En iOS, Apple restringe más los procesos en segundo plano.
Se usa `BGProcessingTaskRequest` o `BGAppRefreshTaskRequest`.

### Flujo iOS

```swift
// 1. Registrar la tarea en AppDelegate
BGTaskScheduler.shared.register(
    forTaskWithIdentifier: "com.samm.rastreo",
    using: nil
) { task in
    self.manejarRastreo(task: task as! BGProcessingTask)
}

// 2. Programar la tarea
func programarRastreo(frecuenciaMinutos: Double) {
    let request = BGProcessingTaskRequest(identifier: "com.samm.rastreo")
    request.earliestBeginDate = Date(timeIntervalSinceNow: frecuenciaMinutos * 60)
    request.requiresNetworkConnectivity = true
    try? BGTaskScheduler.shared.submit(request)
}

// 3. Ejecutar y reprogramar
func manejarRastreo(task: BGProcessingTask) {
    task.expirationHandler = { task.setTaskCompleted(success: false) }

    Task {
        let location = await obtenerUbicacion()
        await enviarUbicacion(location)
        programarRastreo(frecuenciaMinutos: frecuenciaActual) // reprogramar para la próxima vez
        task.setTaskCompleted(success: true)
    }
}
```

---

## Resumen de endpoints que usa el móvil

| Acción | Método | Endpoint |
|--------|--------|----------|
| Activar/desactivar rastreo | POST | `/rastreo/toggle` |
| Consultar frecuencia actual | GET  | `/rastreo/adulto/{id}/frecuencia` |
| Enviar ubicación | POST | `/rastreo/ubicacion` |