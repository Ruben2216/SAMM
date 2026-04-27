package com.samm.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import androidx.core.app.NotificationManagerCompat

class MedicationAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != MedicationAlarmScheduler.ACTION_DISPARAR) return

    val clave = intent.getStringExtra(MedicationAlarmScheduler.EXTRA_ALARMA_CLAVE) ?: return
    val config = MedicationAlarmScheduler.obtenerConfiguracion(context, clave) ?: return

    // Encender CPU brevemente para asegurar que se postee la notificación.
    val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    val wakeLock = powerManager.newWakeLock(
      PowerManager.PARTIAL_WAKE_LOCK,
      "SAMM:AlarmaMedicamento"
    )

    try {
      wakeLock.acquire(10_000)

      val notificacion = MedicationAlarmScheduler.construirNotificacion(context, config)
      NotificationManagerCompat.from(context).notify(config.requestCode(), notificacion)

      // Reprogramar el siguiente disparo (diario/semanal) tras ejecutar.
      MedicationAlarmScheduler.programarSiguiente(context, config)
    } catch (_: Exception) {
      // Silencioso: el objetivo es no crashear el proceso por una alarma.
    } finally {
      try {
        if (wakeLock.isHeld) wakeLock.release()
      } catch (_: Exception) {}
    }
  }
}
