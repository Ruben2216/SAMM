import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Vibration,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { styles } from './styles';
import { SuccessModal } from '../../../../components/ui/success-modal';
import { limpiarAlarmaActivaMedicamento } from '../../../../services/notificationService';

export const RecordatorioMedicamento: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params as {
    idMedicamento: number | string;
    idHorario?: number | string;
    nombreMedicamento: string;
    dosis: string;
    notas: string;
    horaToma: string;
  }) || {};

  const {
    idMedicamento: idMedicamentoRaw,
    idHorario: idHorarioRaw,
    nombreMedicamento,
    dosis,
    notas,
    horaToma,
  } = params;

  const idMedicamento = typeof idMedicamentoRaw === 'string' ? Number(idMedicamentoRaw) : idMedicamentoRaw;
  const idHorario = typeof idHorarioRaw === 'string' ? Number(idHorarioRaw) : idHorarioRaw;
  const [cargando, setCargando] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const accionEnCursoRef = useRef(false);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

  const pulso = useRef(new Animated.Value(1)).current;
  const sonidoRef = useRef<Audio.Sound | null>(null);
  const idNotificacionReintentoRef = useRef<string | null>(null);

  useEffect(() => {
    // Animación pulsante
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1.15,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animacion.start();

    // Vibración continua tipo alarma: 600ms encendido, 400ms apagado
    Vibration.vibrate([0, 600, 400, 600, 400, 600, 400, 600, 400, 600], true);

    // Audio en loop
    iniciarSonido();

    // Si el usuario no actúa, re-notificar en 5 minutos
    programarReintento();

    return () => {
      animacion.stop();
      detenerAlarma();
    };
  }, []);

  const iniciarSonido = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        require('../../../../../assets/SonidoAlarma.mp3'),
        { isLooping: true, volume: 1.0 },
      );
      sonidoRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.warn('[Alarma] No se pudo cargar el sonido:', e);
    }
  };

  const programarReintento = async () => {
    try {
      const idNotificacionReintento = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Aun no tomaste tu medicamento',
          body: `${nombreMedicamento || 'Tu medicamento'}${dosis ? ` - ${dosis}` : ''} sigue pendiente`,
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
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 300,
          channelId: 'medicamentos_alarma_v3',
        },
      });
      idNotificacionReintentoRef.current = idNotificacionReintento;
    } catch {}
  };

  const detenerAlarma = async () => {
    Vibration.cancel();

    if (
      typeof idMedicamento === 'number' &&
      Number.isFinite(idMedicamento) &&
      typeof idHorario === 'number' &&
      Number.isFinite(idHorario)
    ) {
      await limpiarAlarmaActivaMedicamento(idMedicamento, idHorario);
    }

    if (sonidoRef.current) {
      try {
        await sonidoRef.current.stopAsync();
        await sonidoRef.current.unloadAsync();
      } catch {}
      sonidoRef.current = null;
    }

    if (idNotificacionReintentoRef.current) {
      try {
        await Notifications.cancelScheduledNotificationAsync(idNotificacionReintentoRef.current);
      } catch {}
      idNotificacionReintentoRef.current = null;
    }
  };

  const iniciarAccionUnaSolaVez = (): boolean => {
    if (accionEnCursoRef.current) return false;
    accionEnCursoRef.current = true;
    setCargando(true);
    return true;
  };

  const finalizarAccion = () => {
    accionEnCursoRef.current = false;
    setCargando(false);
  };

  const formatearHora = (hora: string) => {
    if (!hora) return '--:--';
    const [hStr, mStr] = hora.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };

  const manejarMarcarTomado = async () => {
    if (!iniciarAccionUnaSolaVez()) return;

    await detenerAlarma();
    try {
      const respuesta = await fetch(`${apiUrl}/medicamentos/${idMedicamento}/tomar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hora_asignada: horaToma }),
      });

      if (respuesta.ok) {
        setModalExito(true);
        setTimeout(() => {
          navigation.goBack();
        }, 250);
      } else {
        Alert.alert('Error', 'No se pudo registrar la toma.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      finalizarAccion();
    }
  };

  const manejarRecordar = async () => {
    if (!iniciarAccionUnaSolaVez()) return;

    await detenerAlarma();
    // Reemplaza el reintento por uno en 10 minutos
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de tu medicamento',
        body: `${nombreMedicamento || 'Medicamento'}${dosis ? ` - ${dosis}` : ''}`,
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
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 600,
        channelId: 'medicamentos_alarma_v3',
      },
    });
    navigation.goBack();
    finalizarAccion();
  };

  const manejarOmitir = async () => {
    if (!iniciarAccionUnaSolaVez()) return;

    await detenerAlarma();
    navigation.goBack();
    finalizarAccion();
  };

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F5F9" />

      <TouchableOpacity style={styles.botonCerrar} onPress={manejarOmitir}>
        <Ionicons name="close" size={28} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.badgeHora}>
        <Ionicons name="alarm" size={16} color="#475569" />
        <Text style={styles.badgeHoraTexto}>
          {'  '}RECORDATORIO {formatearHora(horaToma || '')}
        </Text>
      </View>

      <Text style={styles.titulo}>
        Es hora de tomar{'\n'}tus medicamentos
      </Text>

      <Animated.View style={[styles.circuloPulsante, { transform: [{ scale: pulso }] }]}>
        <Ionicons name="medical" size={64} color="#00C853" />
      </Animated.View>

      <View style={styles.tarjetaMedicamento}>
        <Text style={styles.tarjetaNombre}>{nombreMedicamento || 'Medicamento'}</Text>
        {dosis ? <Text style={styles.tarjetaDosis}>{dosis}</Text> : null}
        {notas ? <Text style={styles.tarjetaNotas}>{notas}</Text> : null}
      </View>

      <View style={styles.contenedorBotones}>
        <TouchableOpacity
          style={styles.botonTomado}
          onPress={manejarMarcarTomado}
          activeOpacity={0.8}
          disabled={cargando}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.botonTomadoTexto}>Marcar como tomado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonRecordar}
          onPress={manejarRecordar}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={24} color="#0F172A" />
          <Text style={styles.botonRecordarTexto}>Recordar en 10 minutos</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={manejarOmitir} activeOpacity={0.7}>
          <Text style={styles.textoOmitir}>Omitir esta dosis</Text>
        </TouchableOpacity>
      </View>

      <SuccessModal
        esVisible={modalExito}
        mensaje="Medicamento registrado como tomado"
        alTerminar={() => {
          setModalExito(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};
