package com.samm.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

    // Reprogramar alarmas locales de medicamentos luego del reinicio.
    // (El sistema limpia AlarmManager al reiniciar.)
    MedicationAlarmScheduler.reprogramarTodas(context)

    val token = SammSecurePrefs.obtenerTokenDispositivo(context) ?: return
    if (token.isBlank()) return

    val serviceIntent = Intent(context, BatteryReportService::class.java)
    ContextCompat.startForegroundService(context, serviceIntent)
  }
}
