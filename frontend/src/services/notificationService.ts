import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { type ConfiguracionFamiliar, useFamilyPreferencesStore } from '../store/useFamilyPreferencesStore';

const NOTIFICATION_API_URL =
  process.env.EXPO_PUBLIC_API_URL_NOTIFICACIONES || 'http://192.168.0.17:8002';

// Canal Android para alarmas de medicamentos del adulto mayor.
// Si se cambian las propiedades (sonido, importancia) hay que BUMPEAR este ID,
// porque Android no permite modificar canales ya creados.
const CANAL_ALARMA_ADULTO = 'medicamentos_alarma_v3';
const CANAL_ALERTA_FAMILIAR = 'alertas_familiar';

const resolverClavePreferenciaPorTipoAlerta = (
  tipoAlerta: string | undefined
): keyof ConfiguracionFamiliar | null => {
  if (!tipoAlerta) return null;

  const tipoNormalizado = String(tipoAlerta).trim().toLowerCase();

  if (tipoNormalizado === 'tomado' || tipoNormalizado === 'toma_correcta') {
    return 'alertaTomaCorrecta';
  }

  if (tipoNormalizado === 'olvidado' || tipoNormalizado === 'olvido_critico') {
    return 'alertaOlvidoCritico';
  }

  if (tipoNormalizado === 'salida_zona') {
    return 'alertaSalidaZona';
  }

  if (tipoNormalizado === 'bateria_baja') {
    return 'alertaBateriaBaja';
  }

  return null;
};

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async (notificacion) => {
    const datos = notificacion.request.content.data as any;

    // Edge filtering: sólo aplicamos reglas al flujo de alertas del familiar.
    if (datos?.tipo === 'alerta_familiar') {
      const estado = useFamilyPreferencesStore.getState();

      const idUsuarioDestino =
        datos?.targetUserId ??
        datos?.idUsuario ??
        datos?.id_usuario ??
        datos?.id_usuario_destino ??
        null;

      const preferencias = idUsuarioDestino
        ? estado.obtenerConfiguracion(idUsuarioDestino)
        : estado.obtenerConfiguracionActiva();

      if (!preferencias.notificacionesGenerales) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      }

      const clavePreferencia = resolverClavePreferenciaPorTipoAlerta(datos?.tipoAlerta);
      if (clavePreferencia && !preferencias[clavePreferencia]) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false,
        };
      }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

/**
 * Registrar permisos, obtener el Expo Push Token y guardarlo en notification-service
 */
export async function registrarParaNotificaciones(idUsuario?: number): Promise<string | null> {
  console.log(`[Notificaciones] >>> registrarParaNotificaciones(idUsuario=${idUsuario})`);

  if (!Device.isDevice) {
    console.log('[Notificaciones] Debe usar un dispositivo físico para push notifications');
    return null;
  }

  const { status: permisoExistente } = await Notifications.getPermissionsAsync();
  console.log(`[Notificaciones] Permiso existente: ${permisoExistente}`);
  let permisoFinal = permisoExistente;

  if (permisoExistente !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log(`[Notificaciones] Permiso solicitado, respuesta: ${status}`);
    permisoFinal = status;
  }

  if (permisoFinal !== 'granted') {
    console.log('[Notificaciones] Permiso de notificaciones denegado');
    return null;
  }

  // Canales Android: separamos alarma del adulto vs. push informativo del familiar.
  if (Platform.OS === 'android') {
    // Canal del adulto mayor: tipo alarma — máxima prioridad, vibración larga, bypassDnd.
    // Sonido 'default' (del sistema) porque el sonido de alarma personalizado
    // (SonidoAlarma.mp3) lo reproduce la pantalla RecordatorioMedicamento con expo-av.
    await Notifications.setNotificationChannelAsync(CANAL_ALARMA_ADULTO, {
      name: 'Recordatorio de medicamentos',
      description: 'Alarma para que el adulto mayor tome sus medicinas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 800, 400, 800, 400, 800, 400, 800],
      lightColor: '#00E676',
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });

    // Canal del familiar: push informativo estándar, vibración corta.
    await Notifications.setNotificationChannelAsync(CANAL_ALERTA_FAMILIAR, {
      name: 'Alertas del familiar',
      description: 'Avisos sobre la medicación de tu adulto mayor',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      lightColor: '#2563EB',
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }

  console.log('[Notificaciones] Solicitando Expo Push Token...');
  let tokenData;
  try {
    tokenData = await Notifications.getExpoPushTokenAsync();
  } catch (error: any) {
    console.error('[Notificaciones] ERROR obteniendo Expo Push Token:', error?.message || error);
    return null;
  }

  console.log('[Notificaciones] Push Token obtenido:', tokenData.data);

  if (idUsuario) {
    console.log(`[Notificaciones] Guardando token en backend para usuario ${idUsuario}...`);
    await guardarTokenEnBackend(idUsuario, tokenData.data);
  } else {
    console.log('[Notificaciones] Sin idUsuario — no se guarda token en backend');
  }

  return tokenData.data;
}

/**
 * Guardar el token en el notification-service (persistencia en BD)
 */
export async function guardarTokenEnBackend(idUsuario: number, pushToken: string): Promise<void> {
  const url = `${NOTIFICATION_API_URL}/push-tokens`;
  console.log(`[Notificaciones] PUT ${url}`);
  try {
    const respuesta = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: idUsuario,
        push_token: pushToken,
        plataforma: Platform.OS,
      }),
    });
    const textoRespuesta = await respuesta.text();
    if (respuesta.ok) {
      console.log(`[Notificaciones] Token guardado OK (${respuesta.status}) usuario=${idUsuario}`);
    } else {
      console.warn(`[Notificaciones] Backend respondió ${respuesta.status}: ${textoRespuesta}`);
    }
  } catch (error: any) {
    console.error('[Notificaciones] Fallo de red guardando token:', error?.message || error);
  }
}

/**
 * Programar notificación local para un medicamento (se dispara en el propio dispositivo)
 */
export async function programarRecordatorioMedicamento(params: {
  idMedicamento: number;
  idHorario: number;
  nombreMedicamento: string;
  dosis: string;
  notas: string;
  horaToma: string; // "HH:mm:ss"
}): Promise<string | null> {
  const { idMedicamento, idHorario, nombreMedicamento, dosis, notas, horaToma } = params;

  const [horasStr, minutosStr] = horaToma.split(':');
  const horas = parseInt(horasStr, 10);
  const minutos = parseInt(minutosStr, 10);

  const identificador = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de tu medicamento',
      body: `${nombreMedicamento} - ${dosis}${notas ? `\n${notas}` : ''}`,
      data: {
        tipo: 'recordatorio_medicamento',
        idMedicamento,
        idHorario,
        nombreMedicamento,
        dosis,
        notas,
        horaToma,
      },
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    // En expo-notifications el channelId va en el trigger, no en content.
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: horas,
      minute: minutos,
      channelId: CANAL_ALARMA_ADULTO,
    },
  });

  console.log(`[Notificaciones] Programado: ${nombreMedicamento} a las ${horaToma} — ID: ${identificador}`);
  return identificador;
}

/**
 * Cancela todos los recordatorios LOCALES programados en este dispositivo.
 * No afecta al Expo Push Token ni a las notificaciones push del backend.
 * Se usa antes de reprogramar medicamentos para evitar duplicados con horas viejas.
 */
export async function cancelarTodasLasNotificaciones(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[Notificaciones] Recordatorios locales limpiados (se reprograman a continuación)');
}
