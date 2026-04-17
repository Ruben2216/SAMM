import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const NOTIFICATION_API_URL =
  process.env.EXPO_PUBLIC_API_URL_NOTIFICACIONES || 'http://192.168.0.17:8002';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registrar permisos, obtener el Expo Push Token y guardarlo en notification-service
 */
export async function registrarParaNotificaciones(idUsuario?: number): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[Notificaciones] Debe usar un dispositivo físico para push notifications');
    return null;
  }

  const { status: permisoExistente } = await Notifications.getPermissionsAsync();
  let permisoFinal = permisoExistente;

  if (permisoExistente !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    permisoFinal = status;
  }

  if (permisoFinal !== 'granted') {
    console.log('[Notificaciones] Permiso de notificaciones denegado');
    return null;
  }

  // Canal de alta prioridad para notificaciones tipo alarma
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medicamentos', {
      name: 'Recordatorio de medicamentos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lightColor: '#00E676',
      sound: 'default',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  console.log('[Notificaciones] Push Token:', tokenData.data);

  if (idUsuario) {
    await guardarTokenEnBackend(idUsuario, tokenData.data);
  }

  return tokenData.data;
}

/**
 * Guardar el token en el notification-service (persistencia en BD)
 */
export async function guardarTokenEnBackend(idUsuario: number, pushToken: string): Promise<void> {
  try {
    const respuesta = await fetch(`${NOTIFICATION_API_URL}/push-tokens`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: idUsuario,
        push_token: pushToken,
        plataforma: Platform.OS,
      }),
    });
    if (respuesta.ok) {
      console.log(`[Notificaciones] Token guardado en backend para usuario ${idUsuario}`);
    } else {
      console.warn('[Notificaciones] No se pudo guardar token:', respuesta.status);
    }
  } catch (error) {
    console.error('[Notificaciones] Error guardando token:', error);
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
      ...(Platform.OS === 'android' && { channelId: 'medicamentos' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: horas,
      minute: minutos,
    },
  });

  console.log(`[Notificaciones] Programado: ${nombreMedicamento} a las ${horaToma} — ID: ${identificador}`);
  return identificador;
}

/**
 * Cancelar todas las notificaciones programadas
 */
export async function cancelarTodasLasNotificaciones(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[Notificaciones] Todas las notificaciones canceladas');
}
