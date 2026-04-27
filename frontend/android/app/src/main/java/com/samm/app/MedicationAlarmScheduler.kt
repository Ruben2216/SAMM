package com.samm.app

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONObject
import java.util.Calendar

object MedicationAlarmScheduler {
  private const val PREFS_NOMBRE = "samm_alarmas_medicamentos"
  private const val PREFS_CLAVE_PREFIJO = "alarma_"

  const val CANAL_ID = "medicamentos_alarma_v3"
  const val ACTION_DISPARAR = "com.samm.app.ACTION_ALARMA_MEDICAMENTO"
  const val EXTRA_ALARMA_CLAVE = "alarmaClave"

  data class ConfiguracionAlarma(
    val idMedicamento: Int,
    val idHorario: Int,
    val nombreMedicamento: String,
    val dosis: String,
    val notas: String,
    val horaToma: String, // "HH:mm" o "HH:mm:ss"
    val diasSemanaCsv: String // "1,2,3,4,5,6,7" (ISO: 1=Lun..7=Dom)
  ) {
    fun clave(): String = "$PREFS_CLAVE_PREFIJO${idMedicamento}_${idHorario}"

    fun requestCode(): Int {
      // Evita truncamiento a 16 bits; reduce riesgo de colisiones para IDs grandes.
      return "${idMedicamento}_${idHorario}".hashCode()
    }

    fun toJson(): String {
      val obj = JSONObject()
      obj.put("idMedicamento", idMedicamento)
      obj.put("idHorario", idHorario)
      obj.put("nombreMedicamento", nombreMedicamento)
      obj.put("dosis", dosis)
      obj.put("notas", notas)
      obj.put("horaToma", horaToma)
      obj.put("diasSemanaCsv", diasSemanaCsv)
      return obj.toString()
    }

    companion object {
      fun fromJson(json: String): ConfiguracionAlarma {
        val obj = JSONObject(json)
        return ConfiguracionAlarma(
          idMedicamento = obj.optInt("idMedicamento"),
          idHorario = obj.optInt("idHorario"),
          nombreMedicamento = obj.optString("nombreMedicamento"),
          dosis = obj.optString("dosis"),
          notas = obj.optString("notas"),
          horaToma = obj.optString("horaToma"),
          diasSemanaCsv = obj.optString("diasSemanaCsv")
        )
      }
    }
  }

  fun programar(context: Context, config: ConfiguracionAlarma): Boolean {
    guardarConfiguracion(context, config)
    return programarSiguiente(context, config)
  }

  fun programarSiguiente(context: Context, config: ConfiguracionAlarma): Boolean {
    val (hora, minuto) = parsearHora(config.horaToma)

    val dias = parsearDiasIso(config.diasSemanaCsv)
    val disparoMillis = calcularProximoDisparoMillis(hora, minuto, dias)

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    val intent = Intent(context, MedicationAlarmReceiver::class.java).apply {
      action = ACTION_DISPARAR
      putExtra(EXTRA_ALARMA_CLAVE, config.clave())
    }

    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }

    val pending = PendingIntent.getBroadcast(
      context,
      config.requestCode(),
      intent,
      flags
    )

    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
        // Best-effort: si el usuario no habilitó exact alarms, programamos allowWhileIdle sin exactitud.
        alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, disparoMillis, pending)
      } else {
        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, disparoMillis, pending)
      }
      true
    } catch (_: Exception) {
      false
    }
  }

  fun cancelar(context: Context, idMedicamento: Int, idHorario: Int) {
    val config = ConfiguracionAlarma(
      idMedicamento = idMedicamento,
      idHorario = idHorario,
      nombreMedicamento = "",
      dosis = "",
      notas = "",
      horaToma = "00:00",
      diasSemanaCsv = "1,2,3,4,5,6,7"
    )

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val intent = Intent(context, MedicationAlarmReceiver::class.java).apply {
      action = ACTION_DISPARAR
      putExtra(EXTRA_ALARMA_CLAVE, config.clave())
    }

    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }

    val pending = PendingIntent.getBroadcast(context, config.requestCode(), intent, flags)
    alarmManager.cancel(pending)

    cancelarNotificacionActiva(context, idMedicamento, idHorario)

    val prefs = context.getSharedPreferences(PREFS_NOMBRE, Context.MODE_PRIVATE)
    prefs.edit().remove(config.clave()).apply()
  }

  fun cancelarNotificacionActiva(context: Context, idMedicamento: Int, idHorario: Int) {
    val requestCode = "${idMedicamento}_${idHorario}".hashCode()
    NotificationManagerCompat.from(context).cancel(requestCode)
  }

  fun puedeProgramarExactas(context: Context): Boolean {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true
    return alarmManager.canScheduleExactAlarms()
  }

  fun cancelarTodas(context: Context) {
    val prefs = context.getSharedPreferences(PREFS_NOMBRE, Context.MODE_PRIVATE)
    val claves = prefs.all.keys.filter { it.startsWith(PREFS_CLAVE_PREFIJO) }

    for (clave in claves) {
      val json = prefs.getString(clave, null) ?: continue
      val config = try {
        ConfiguracionAlarma.fromJson(json)
      } catch (_: Exception) {
        null
      } ?: continue

      cancelar(context, config.idMedicamento, config.idHorario)
    }

    prefs.edit().clear().apply()
  }

  fun reprogramarTodas(context: Context) {
    val prefs = context.getSharedPreferences(PREFS_NOMBRE, Context.MODE_PRIVATE)
    val claves = prefs.all.keys.filter { it.startsWith(PREFS_CLAVE_PREFIJO) }

    for (clave in claves) {
      val json = prefs.getString(clave, null) ?: continue
      val config = try {
        ConfiguracionAlarma.fromJson(json)
      } catch (_: Exception) {
        null
      } ?: continue

      programarSiguiente(context, config)
    }
  }

  fun obtenerConfiguracion(context: Context, clave: String): ConfiguracionAlarma? {
    val prefs = context.getSharedPreferences(PREFS_NOMBRE, Context.MODE_PRIVATE)
    val json = prefs.getString(clave, null) ?: return null
    return try {
      ConfiguracionAlarma.fromJson(json)
    } catch (_: Exception) {
      null
    }
  }

  private fun guardarConfiguracion(context: Context, config: ConfiguracionAlarma) {
    val prefs = context.getSharedPreferences(PREFS_NOMBRE, Context.MODE_PRIVATE)
    prefs.edit().putString(config.clave(), config.toJson()).apply()
  }

  fun asegurarCanalAlarma(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existente = manager.getNotificationChannel(CANAL_ID)
    if (existente != null) return

    val canal = NotificationChannel(
      CANAL_ID,
      "Recordatorio de medicamentos",
      NotificationManager.IMPORTANCE_MAX
    ).apply {
      description = "Alarma para que el adulto mayor tome sus medicinas"
      enableVibration(true)
      vibrationPattern = longArrayOf(0, 800, 400, 800, 400, 800, 400, 800)
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      setBypassDnd(true)
    }

    manager.createNotificationChannel(canal)
  }

  fun construirNotificacion(context: Context, config: ConfiguracionAlarma): Notification {
    asegurarCanalAlarma(context)

    val uri = Uri.Builder()
      .scheme("samm")
      .authority("recordatorio-medicamento")
      .appendQueryParameter("idMedicamento", config.idMedicamento.toString())
      .appendQueryParameter("idHorario", config.idHorario.toString())
      .appendQueryParameter("nombreMedicamento", config.nombreMedicamento)
      .appendQueryParameter("dosis", config.dosis)
      .appendQueryParameter("notas", config.notas)
      .appendQueryParameter("horaToma", config.horaToma)
      .build()

    val actividadIntent = Intent(Intent.ACTION_VIEW, uri).apply {
      setPackage(context.packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }

    val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }

    val pendingPantallaCompleta = PendingIntent.getActivity(
      context,
      config.requestCode(),
      actividadIntent,
      flags
    )

    val cuerpo = buildString {
      append(if (config.nombreMedicamento.isNotBlank()) config.nombreMedicamento else "Tu medicamento")
      if (config.dosis.isNotBlank()) {
        append(" - ")
        append(config.dosis)
      }
      if (config.notas.isNotBlank()) {
        append("\n")
        append(config.notas)
      }
    }

    return NotificationCompat.Builder(context, CANAL_ID)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentTitle("Hora de tu medicamento")
      .setContentText(cuerpo)
      .setStyle(NotificationCompat.BigTextStyle().bigText(cuerpo))
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setFullScreenIntent(pendingPantallaCompleta, true)
      .setContentIntent(pendingPantallaCompleta)
      .build()
  }

  private fun parsearHora(horaToma: String): Pair<Int, Int> {
    val partes = horaToma.split(":")
    val hora = partes.getOrNull(0)?.toIntOrNull() ?: 0
    val minuto = partes.getOrNull(1)?.toIntOrNull() ?: 0
    return Pair(hora.coerceIn(0, 23), minuto.coerceIn(0, 59))
  }

  private fun parsearDiasIso(csv: String): Set<Int> {
    val lista = csv.split(",")
      .mapNotNull { it.trim().toIntOrNull() }
      .filter { it in 1..7 }
      .toSet()

    return if (lista.isEmpty()) setOf(1, 2, 3, 4, 5, 6, 7) else lista
  }

  private fun calcularProximoDisparoMillis(hora: Int, minuto: Int, diasIso: Set<Int>): Long {
    val ahoraMillis = System.currentTimeMillis()

    for (offset in 0..7) {
      val cal = Calendar.getInstance().apply {
        timeInMillis = ahoraMillis
        add(Calendar.DAY_OF_YEAR, offset)
      }

      val diaCal = cal.get(Calendar.DAY_OF_WEEK)
      val diaIso = if (diaCal == Calendar.SUNDAY) 7 else (diaCal - 1)
      if (!diasIso.contains(diaIso)) continue

      cal.set(Calendar.HOUR_OF_DAY, hora)
      cal.set(Calendar.MINUTE, minuto)
      cal.set(Calendar.SECOND, 0)
      cal.set(Calendar.MILLISECOND, 0)

      val candidato = cal.timeInMillis
      if (candidato > ahoraMillis) return candidato
    }

    // Fallback: mañana a la misma hora.
    val cal = Calendar.getInstance().apply {
      timeInMillis = ahoraMillis
      add(Calendar.DAY_OF_YEAR, 1)
      set(Calendar.HOUR_OF_DAY, hora)
      set(Calendar.MINUTE, minuto)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }
    return cal.timeInMillis
  }
}
