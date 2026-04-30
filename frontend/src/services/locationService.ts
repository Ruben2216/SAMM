/**
 * locationService.ts — versión corregida
 *
 * Correcciones aplicadas:
 *  1. La tarea en segundo plano (startLocationUpdatesAsync) solo se intenta
 *     si el usuario concedió permiso "Siempre" (background). Si eligió
 *     "mientras la app está en uso", el servicio funciona en foreground
 *     sin crashear ni cerrar sesión.
 *  2. Se envuelve TODO en try/catch para que ningún error interno
 *     llegue al authStore y dispare un logout inesperado.
 *  3. Se detecta si estamos en Expo Go (donde las background tasks no
 *     están disponibles) y se omite esa parte sin error.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../config/api';
// ─── Configuración ──────────────────────────────────────────────────────────

const TRACKING_API_URL = API_URLS.tracking;

const BACKGROUND_LOCATION_TASK  = 'SAMM_BACKGROUND_LOCATION';
const STORAGE_KEY_RASTREO_ACTIVO = 'samm_rastreo_activo';
const STORAGE_KEY_ID_USUARIO     = 'samm_id_usuario_rastreo';

// ─── Detectar si estamos en Expo Go ─────────────────────────────────────────
// En Expo Go las background tasks no están disponibles.
// En un build de desarrollo/producción sí funcionan.
function esExpoGo(): boolean {
  try {
    // Si expo-constants está disponible, revisamos el executionEnvironment
    const Constants = require('expo-constants').default;
    return Constants.executionEnvironment === 'storeClient';
  } catch {
    return false;
  }
}

// ─── Definición de la tarea en segundo plano ────────────────────────────────
// IMPORTANTE: debe estar en el nivel raíz del archivo.
// En Expo Go esta definición existe pero nunca se ejecuta en background.
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[Rastreo] Error en tarea de fondo:', error.message);
    return;
  }
  if (!data) return;

  const { locations } = data as { locations: Location.LocationObject[] };
  const ultima = locations[locations.length - 1];
  if (!ultima) return;

  const { latitude, longitude, accuracy } = ultima.coords;
  const idUsuarioStr = await AsyncStorage.getItem(STORAGE_KEY_ID_USUARIO);
  if (!idUsuarioStr) return;

  try {
    await fetch(`${TRACKING_API_URL}/rastreo/ubicacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Id_Adulto_Mayor:  parseInt(idUsuarioStr, 10),
        Latitud:          latitude,
        Longitud:         longitude,
        Precision_Metros: accuracy ?? null,
      }),
    });
    console.log(`[Rastreo BG] Ubicación enviada: (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
  } catch (err: any) {
    console.error('[Rastreo BG] Error enviando:', err?.message);
  }
});

// ─── Funciones públicas ──────────────────────────────────────────────────────

export async function obtenerEstadoRastreo(idAdultoMayor?: number): Promise<boolean> {
  try {
    const guardado = await AsyncStorage.getItem(STORAGE_KEY_RASTREO_ACTIVO);
    if (guardado !== 'true') return false;

    // Verificar que el rastreo activo pertenece a ESTE usuario, no a otro
    if (idAdultoMayor) {
      const idGuardado = await AsyncStorage.getItem(STORAGE_KEY_ID_USUARIO);
      if (idGuardado !== String(idAdultoMayor)) return false;
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
//-------------------------------------------------------
async function obtenerFrecuenciaMinutos(idAdultoMayor: number): Promise<number> {
  try {
    const res = await fetch(
      `${TRACKING_API_URL}/rastreo/adulto/${idAdultoMayor}/frecuencia`
    );
    if (res.ok) {
      const data = await res.json();
      return data.frecuencia_minutos ?? 5;
    }
  } catch {
    console.warn('[Rastreo] No se pudo obtener frecuencia, usando 5 min por defecto.');
  }
  return 5;
}

export async function activarRastreo(idAdultoMayor: number): Promise<boolean> {
  try {
    console.log('[Rastreo] Activando rastreo para usuario', idAdultoMayor);

    // 1. Pedir permiso foreground (obligatorio)
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos acceso a tu GPS para compartir tu ubicación.',
        [
          { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return false;
    }

    // 2. Intentar permiso background (opcional — no bloqueante)
    let tieneBackground = false;
    try {
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();
      tieneBackground = bg === 'granted';
    } catch {
      // En Expo Go esto puede lanzar error — lo ignoramos
      tieneBackground = false;
    }

    if (!tieneBackground) {
      // Avisamos pero NO cancelamos — el rastreo funcionará mientras la app esté abierta
      Alert.alert(
        'Rastreo limitado',
        'Tu familiar podrá verte mientras tengas la app abierta. ' +
        'Para que funcione con la app cerrada, ve a Ajustes > SAMM> permisos> bateria> Sin restricciones. Tambien: Permisos> Ubicacion> Ubicacion Precisa',
        [
          { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() },
          { text: 'Continuar así', style: 'cancel' },
        ]
      );
    }

    // 3. Obtener frecuencia configurada por el familiar
    const frecuenciaMinutos = await obtenerFrecuenciaMinutos(idAdultoMayor);
    const frecuenciaMs      = frecuenciaMinutos * 60 * 1000;

    // 4. Notificar al backend
    try {
      await fetch(`${TRACKING_API_URL}/rastreo/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Id_Adulto_Mayor: idAdultoMayor, Activo: true }),
      });
    } catch (err) {
      console.warn('[Rastreo] No se pudo notificar al backend el toggle:', err);
      // Continuamos aunque el backend no responda
    }

    // 5. Registrar tarea en segundo plano SOLO si:
    //    - Se tiene permiso background, Y
    //    - NO estamos en Expo Go
    if (tieneBackground && !esExpoGo()) {
      try {
        const yaActiva = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
        if (yaActiva) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        }

        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy:             Location.Accuracy.Balanced,
          timeInterval:         frecuenciaMs,
          distanceInterval:     50,
          foregroundService: {
            notificationTitle: 'SAMM — Compartiendo ubicación',
            notificationBody:  `Actualizando cada ${frecuenciaMinutos} min.`,
            notificationColor: '#1D9E75',
          },
          pausesUpdatesAutomatically:       false,
          showsBackgroundLocationIndicator: true,
        });
        console.log('[Rastreo] Tarea en segundo plano registrada.');
      } catch (bgErr: any) {
        // Si la tarea falla, no crasheamos — el rastreo sigue en foreground
        console.warn('[Rastreo] No se pudo iniciar tarea de fondo:', bgErr?.message);
      }
    } else {
      if (esExpoGo()) {
        console.log('[Rastreo] Expo Go detectado — segundo plano no disponible. Usando foreground.');
      }
    }

    // 6. Enviar ubicación actual inmediatamente (no esperar el primer intervalo)
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const res = await fetch(`${TRACKING_API_URL}/rastreo/ubicacion`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Id_Adulto_Mayor:  idAdultoMayor,
          Latitud:          pos.coords.latitude,
          Longitud:         pos.coords.longitude,
          Precision_Metros: pos.coords.accuracy ?? null,
        }),
      });

      if (res.ok) {
        console.log('[Rastreo] Ubicación inicial enviada correctamente.');
      } else {
        const errorBody = await res.text();
        console.warn('[Rastreo] Backend rechazó la ubicación:', res.status, errorBody);
      }
    } catch (err: any) {
      console.warn('[Rastreo] No se pudo enviar ubicación inicial:', err?.message);
    }

    // 7. Persistir estado
    await AsyncStorage.setItem(STORAGE_KEY_RASTREO_ACTIVO, 'true');
    await AsyncStorage.setItem(STORAGE_KEY_ID_USUARIO, String(idAdultoMayor));

    console.log(`[Rastreo] Activado. Background: ${tieneBackground}. Frecuencia: ${frecuenciaMinutos} min.`);
    return true;

  } catch (errorGeneral: any) {
    // Captura de último recurso — evita que el error llegue al authStore
    console.error('[Rastreo] Error inesperado en activarRastreo:', errorGeneral?.message);
    return false;
  }
}

export async function desactivarRastreo(idAdultoMayor: number): Promise<void> {
  try {
    // Detener tarea en segundo plano si existe
    try {
      const activa = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (activa) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }
    } catch {
      // Ignorar si no hay tarea activa
    }

    // Notificar al backend
    try {
      await fetch(`${TRACKING_API_URL}/rastreo/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Id_Adulto_Mayor: idAdultoMayor, Activo: false }),
      });
    } catch (err) {
      console.warn('[Rastreo] No se pudo notificar desactivación:', err);
    }

    await AsyncStorage.removeItem(STORAGE_KEY_RASTREO_ACTIVO);
    await AsyncStorage.removeItem(STORAGE_KEY_ID_USUARIO);

    console.log('[Rastreo] Desactivado correctamente.');
  } catch (err: any) {
    console.error('[Rastreo] Error desactivando rastreo:', err?.message);
  }
}

export async function manejarToggleRastreo(
  valor: boolean,
  idAdultoMayor?: number
): Promise<boolean> {
  if (!idAdultoMayor) {
    Alert.alert('Error', 'No se encontró tu información de usuario.');
    return false;
  }
  if (valor) {
    return await activarRastreo(idAdultoMayor);
  } else {
    await desactivarRastreo(idAdultoMayor);
    return false;
  }
}