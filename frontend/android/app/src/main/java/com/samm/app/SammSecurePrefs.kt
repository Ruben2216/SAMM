package com.samm.app

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

object SammSecurePrefs {
  private const val ARCHIVO_PREFS = "samm_prefs"
  private const val CLAVE_TOKEN_DISPOSITIVO = "samm_device_token"
  private const val CLAVE_API_URL = "samm_api_url"

  private fun prefs(context: Context): SharedPreferences {
    val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)

    return EncryptedSharedPreferences.create(
      ARCHIVO_PREFS,
      masterKeyAlias,
      context,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
  }

  fun guardarTokenDispositivo(context: Context, token: String) {
    prefs(context).edit().putString(CLAVE_TOKEN_DISPOSITIVO, token).apply()
  }

  fun obtenerTokenDispositivo(context: Context): String? {
    return prefs(context).getString(CLAVE_TOKEN_DISPOSITIVO, null)
  }

  fun limpiarTokenDispositivo(context: Context) {
    prefs(context).edit().remove(CLAVE_TOKEN_DISPOSITIVO).apply()
  }

  fun guardarApiUrl(context: Context, apiUrl: String) {
    prefs(context).edit().putString(CLAVE_API_URL, apiUrl).apply()
  }

  fun obtenerApiUrl(context: Context): String? {
    return prefs(context).getString(CLAVE_API_URL, null)
  }
}
