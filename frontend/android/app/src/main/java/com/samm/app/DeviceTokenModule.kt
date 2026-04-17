package com.samm.app

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeviceTokenModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "SAMMDeviceToken"
  }

  @ReactMethod
  fun guardarTokenDispositivo(token: String, promise: Promise) {
    try {
      SammSecurePrefs.guardarTokenDispositivo(reactApplicationContext, token)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_GUARDAR_TOKEN", e)
    }
  }

  @ReactMethod
  fun obtenerTokenDispositivo(promise: Promise) {
    try {
      val token = SammSecurePrefs.obtenerTokenDispositivo(reactApplicationContext)
      promise.resolve(token)
    } catch (e: Exception) {
      promise.reject("ERR_OBTENER_TOKEN", e)
    }
  }

  @ReactMethod
  fun limpiarTokenDispositivo(promise: Promise) {
    try {
      SammSecurePrefs.limpiarTokenDispositivo(reactApplicationContext)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_LIMPIAR_TOKEN", e)
    }
  }

  @ReactMethod
  fun guardarApiUrl(apiUrl: String, promise: Promise) {
    try {
      SammSecurePrefs.guardarApiUrl(reactApplicationContext, apiUrl)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_GUARDAR_API_URL", e)
    }
  }

  @ReactMethod
  fun iniciarServicioBateria(promise: Promise) {
    try {
      val intent = Intent(reactApplicationContext, BatteryReportService::class.java)
      ContextCompat.startForegroundService(reactApplicationContext, intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_INICIAR_SERVICIO", e)
    }
  }

  @ReactMethod
  fun detenerServicioBateria(promise: Promise) {
    try {
      val intent = Intent(reactApplicationContext, BatteryReportService::class.java)
      reactApplicationContext.stopService(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_DETENER_SERVICIO", e)
    }
  }
}
