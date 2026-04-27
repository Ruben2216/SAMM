package com.samm.app

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MedicationAlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "SAMMAlarm"
  }

  @ReactMethod
  fun programarAlarmaMedicamento(
    idMedicamento: Int,
    idHorario: Int,
    nombreMedicamento: String,
    dosis: String,
    notas: String,
    horaToma: String,
    diasSemanaCsv: String,
    promise: Promise
  ) {
    try {
      val config = MedicationAlarmScheduler.ConfiguracionAlarma(
        idMedicamento = idMedicamento,
        idHorario = idHorario,
        nombreMedicamento = nombreMedicamento,
        dosis = dosis,
        notas = notas,
        horaToma = horaToma,
        diasSemanaCsv = diasSemanaCsv
      )

      MedicationAlarmScheduler.asegurarCanalAlarma(reactApplicationContext)
      val ok = MedicationAlarmScheduler.programar(reactApplicationContext, config)
      if (ok) {
        promise.resolve(config.clave())
      } else {
        promise.reject("ERR_PROGRAMAR_ALARMA", "No se pudo programar la alarma")
      }
    } catch (e: Exception) {
      promise.reject("ERR_PROGRAMAR_ALARMA", e)
    }
  }

  @ReactMethod
  fun cancelarAlarmaMedicamento(idMedicamento: Int, idHorario: Int, promise: Promise) {
    try {
      MedicationAlarmScheduler.cancelar(reactApplicationContext, idMedicamento, idHorario)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_CANCELAR_ALARMA", e)
    }
  }

  @ReactMethod
  fun descartarNotificacionAlarmaActiva(idMedicamento: Int, idHorario: Int, promise: Promise) {
    try {
      MedicationAlarmScheduler.cancelarNotificacionActiva(reactApplicationContext, idMedicamento, idHorario)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_DESCARTAR_NOTIFICACION_ACTIVA", e)
    }
  }

  @ReactMethod
  fun puedeProgramarAlarmasExactas(promise: Promise) {
    try {
      promise.resolve(MedicationAlarmScheduler.puedeProgramarExactas(reactApplicationContext))
    } catch (e: Exception) {
      promise.reject("ERR_ESTADO_ALARMAS_EXACTAS", e)
    }
  }

  @ReactMethod
  fun cancelarTodasLasAlarmas(promise: Promise) {
    try {
      MedicationAlarmScheduler.cancelarTodas(reactApplicationContext)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_CANCELAR_TODAS", e)
    }
  }
}
