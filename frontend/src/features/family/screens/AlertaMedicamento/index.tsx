import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Vibration, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { styles } from './styles';

export const AlertaMedicamento: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params as {
    idAdulto?: number;
    nombreAdulto: string;
    rolAdulto: string;
    horaToma: string;
    tipo: 'tomado' | 'olvidado';
  }) || {};

  const { idAdulto, nombreAdulto, rolAdulto, horaToma, tipo } = params;
  const esOlvidado = tipo === 'olvidado';

  const apiIdentity = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.17:8000';
  const sonidoRef = useRef<Audio.Sound | null>(null);
  const pulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1.12,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, []);

  useEffect(() => {
    if (!esOlvidado) return;

    Vibration.vibrate([0, 600, 400, 600, 400, 600, 400, 600, 400, 600], true);
    iniciarSonido();

    return () => {
      detenerAlarma();
    };
  }, [esOlvidado]);

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
      console.warn('[AlertaFamiliar] No se pudo cargar el sonido:', e);
    }
  };

  const detenerAlarma = async () => {
    Vibration.cancel();
    if (sonidoRef.current) {
      try {
        await sonidoRef.current.stopAsync();
        await sonidoRef.current.unloadAsync();
      } catch {}
      sonidoRef.current = null;
    }
  };

  const formatearHora = (hora: string) => {
    if (!hora) return '';
    const [hStr, mStr] = hora.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };

  const manejarLlamar = async () => {
    await detenerAlarma();
    if (!idAdulto) {
      Alert.alert('Sin contacto', 'No se encontró el teléfono del adulto mayor.');
      return;
    }
    try {
      const respuesta = await fetch(`${apiIdentity}/users/internal/telefono/${idAdulto}`);
      if (!respuesta.ok) throw new Error('teléfono no encontrado');
      const datos = await respuesta.json();
      const tel = (datos.telefono || '').replace(/\s+/g, '');
      if (!tel) {
        Alert.alert('Sin contacto', 'El adulto mayor no tiene teléfono registrado.');
        return;
      }
      Linking.openURL(`tel:${tel}`);
    } catch {
      Alert.alert('Error', 'No se pudo obtener el teléfono del adulto mayor.');
    }
  };

  const manejarVerDetalles = async () => {
    await detenerAlarma();
    if (!idAdulto) {
      navigation.goBack();
      return;
    }
    navigation.navigate('MedicamentosFamiliar', {
      idAdultoMayor: idAdulto,
      nombreAdulto: nombreAdulto || rolAdulto || 'Adulto mayor',
    });
  };

  const manejarCerrar = async () => {
    await detenerAlarma();
    navigation.goBack();
  };

  const nombreMostrado = nombreAdulto || rolAdulto || 'El adulto mayor';

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View style={{ width: 40 }} />
        <Text style={styles.tituloEncabezado}>Notificación de alerta</Text>
        <TouchableOpacity style={styles.botonCerrarEncabezado} onPress={manejarCerrar}>
          <Ionicons name="close" size={26} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.iconoAlerta,
          {
            backgroundColor: esOlvidado ? '#FEE2E2' : '#D1FAE5',
            transform: [{ scale: pulso }],
          },
        ]}
      >
        <Ionicons
          name={esOlvidado ? 'warning-outline' : 'checkmark-circle-outline'}
          size={36}
          color={esOlvidado ? '#EF4444' : '#10B981'}
        />
      </Animated.View>

      <Text style={styles.titulo}>
        {esOlvidado ? 'Medicación olvidada' : 'Medicamento tomado'}
      </Text>

      <Text style={styles.descripcion}>
        <Text style={{ fontWeight: '800' }}>{nombreMostrado}</Text>
        {esOlvidado
          ? ' no tomó su medicación programada para las '
          : ' ha tomado su medicación programada de las '}
        <Text style={{ fontWeight: '800' }}>{formatearHora(horaToma || '')}</Text>
      </Text>

      {/* TODO (futuro): aquí irá el mapa con la última ubicación conocida del adulto mayor */}
      <View style={styles.tarjetaEstado}>
        <View style={styles.estadoRow}>
          <View style={[styles.estadoPunto, { backgroundColor: esOlvidado ? '#EF4444' : '#10B981' }]} />
          <Text style={styles.estadoTexto}>
            Estado: {esOlvidado ? 'No responde' : 'Tomado'}
          </Text>
        </View>
        <View style={styles.ubicacionRow}>
          <Ionicons name="location-outline" size={14} color="#64748B" />
          <Text style={styles.ubicacionTexto}>Inicio · Última vez activo hace 2 horas</Text>
        </View>
      </View>

      <View style={styles.contenedorBotones}>
        <TouchableOpacity style={styles.botonLlamar} onPress={manejarLlamar} activeOpacity={0.8}>
          <Ionicons name="call-outline" size={22} color="#0F172A" />
          <Text style={styles.botonLlamarTexto}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={manejarVerDetalles} activeOpacity={0.7}>
          <Text style={styles.textoVerDetalles}>Ver detalles del medicamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
