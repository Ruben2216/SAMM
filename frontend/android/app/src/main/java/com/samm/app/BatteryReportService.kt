package com.samm.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

class BatteryReportService : Service() {

  companion object {
    private const val NOTIFICATION_CHANNEL_ID = "samm_bateria_channel"
    private const val NOTIFICATION_ID = 41001

    // En Android, si quieres más frecuencia, tendrás que aceptar mayor consumo.
    private const val INTERVALO_SEGUNDOS: Long = 300 // 5 minutos
  }

  private val scheduler = Executors.newSingleThreadScheduledExecutor()
  private var tarea: ScheduledFuture<*>? = null

  private var ultimoPorcentaje: Int? = null
  private var ultimoCargando: Boolean? = null

  override fun onCreate() {
    super.onCreate()
    crearCanalNotificacionSiHaceFalta()

    val notificacion = construirNotificacion("Monitoreo de batería activo")

    try {
      startForeground(NOTIFICATION_ID, notificacion)
    } catch (e: Exception) {
      // Si el usuario no concedió notificaciones (Android 13+), no podemos sostener un foreground service.
      stopSelf()
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (tarea == null) {
      tarea = scheduler.scheduleAtFixedRate(
        { reportarBateriaSiAplica() },
        0,
        INTERVALO_SEGUNDOS,
        TimeUnit.SECONDS
      )
    }

    return START_STICKY
  }

  override fun onDestroy() {
    tarea?.cancel(true)
    tarea = null
    scheduler.shutdownNow()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? {
    return null
  }

  private fun crearCanalNotificacionSiHaceFalta() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

    val canal = NotificationChannel(
      NOTIFICATION_CHANNEL_ID,
      "SAMM — Monitoreo de batería",
      NotificationManager.IMPORTANCE_LOW
    )

    manager.createNotificationChannel(canal)
  }

  private fun construirNotificacion(texto: String): Notification {
    return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
      .setContentTitle("SAMM")
      .setContentText(texto)
      .setSmallIcon(android.R.drawable.ic_lock_idle_charging)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .build()
  }

  private fun leerEstadoBateria(): Pair<Int, Boolean>? {
    val intent = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED)) ?: return null

    val nivel = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
    val escala = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
    if (nivel < 0 || escala <= 0) return null

    val porcentaje = ((nivel.toFloat() / escala.toFloat()) * 100f).toInt().coerceIn(0, 100)

    val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
    val cargando = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

    return Pair(porcentaje, cargando)
  }

  private fun reportarBateriaSiAplica() {
    try {
      val token = SammSecurePrefs.obtenerTokenDispositivo(applicationContext) ?: return
      val apiUrl = SammSecurePrefs.obtenerApiUrl(applicationContext) ?: return

      val estado = leerEstadoBateria() ?: return
      val porcentaje = estado.first
      val cargando = estado.second

      // Evitar ruido si nada cambió.
      if (ultimoPorcentaje == porcentaje && ultimoCargando == cargando) return

      val endpoint = apiUrl.trimEnd('/') + "/devices/bateria"
      val url = URL(endpoint)

      val conn = (url.openConnection() as HttpURLConnection).apply {
        requestMethod = "PUT"
        connectTimeout = 15000
        readTimeout = 15000
        doOutput = true
        setRequestProperty("Content-Type", "application/json")
        setRequestProperty("X-Device-Token", token)
      }

      val payload = "{\"porcentaje\":$porcentaje,\"esta_cargando\":$cargando}"
      OutputStreamWriter(conn.outputStream, Charsets.UTF_8).use { it.write(payload) }

      val code = conn.responseCode
      conn.disconnect()

      if (code == 401) {
        // Token inválido (p.ej. backend reiniciado). Limpiamos para que la app lo regenere al iniciar sesión.
        SammSecurePrefs.limpiarTokenDispositivo(applicationContext)
        stopSelf()
        return
      }

      if (code in 200..299) {
        ultimoPorcentaje = porcentaje
        ultimoCargando = cargando
      }
    } catch (_: Exception) {
      // Silencioso: en background no queremos spamear logs ni crashear el servicio.
    }
  }
}
