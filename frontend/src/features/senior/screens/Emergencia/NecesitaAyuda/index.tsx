import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAuthStore } from '../../../../auth/authStore';
import { getReports } from '../../../../../services/reportService';
import { styles } from './styles';

const INTERVALO_REFRESCO_MS = 15_000;

export const NecesitaAyuda = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const {
    idAdulto: idAdultoRaw,
    nombreAdultoMayor = 'Papá',
    nombreContacto = 'Roberto',
    telefono = '3000000000',
  } = route.params || {};

  const idAdulto = typeof idAdultoRaw === 'string' ? Number(idAdultoRaw) : idAdultoRaw;
  const idFamiliar = useAuthStore((s) => s.usuario?.Id_Usuario ?? null);

  const [ubicacionFamiliar, setUbicacionFamiliar] = useState<{ latitude: number; longitude: number } | null>(null);
  const [ubicacionAdulto, setUbicacionAdulto] = useState<{ latitude: number; longitude: number } | null>(null);

  const cargarUbicaciones = useCallback(async () => {
    if (!idFamiliar) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const posicion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUbicacionFamiliar({
          latitude: posicion.coords.latitude,
          longitude: posicion.coords.longitude,
        });
      }
    } catch (error) {
      console.warn('[NecesitaAyuda] No se pudo obtener ubicación del familiar:', error);
    }

    try {
      const reportes = await getReports(idFamiliar);
      if (!Array.isArray(reportes) || reportes.length === 0) return;

      const adultoObjetivo = Number.isFinite(idAdulto)
        ? reportes.find((r) => Number(r.id) === Number(idAdulto))
        : reportes[0];

      if (adultoObjetivo && Number.isFinite(adultoObjetivo.lat) && Number.isFinite(adultoObjetivo.lng)) {
        setUbicacionAdulto({
          latitude: adultoObjetivo.lat,
          longitude: adultoObjetivo.lng,
        });
      }
    } catch (error) {
      console.warn('[NecesitaAyuda] No se pudo obtener ubicación del adulto mayor:', error);
    }
  }, [idAdulto, idFamiliar]);

  useEffect(() => {
    cargarUbicaciones();
    const intervalo = setInterval(cargarUbicaciones, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
  }, [cargarUbicaciones]);

  const handleCall = () => {
    Alert.alert('Llamada', `Llamando a ${nombreContacto}...`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Llamar', onPress: async () => {
            try { if (await Linking.canOpenURL(`tel:${telefono}`)) await Linking.openURL(`tel:${telefono}`); } 
            catch (error) { console.error('Error llamada', error); }
          }
        }
      ]);
  };

  const handleOnMyWay = () => { Alert.alert('Confirmado', 'Se ha notificado que vas en camino'); };
  const handleMarkAsResolved = () => { navigation.goBack(); };

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Alerta Activa</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.encabezado}>
        <View style={styles.etiquetaAlerta}>
          <Text style={styles.etiquetaAlertaTexto}>NECESITA AYUDA</Text>
        </View>
        <Text style={styles.mainTitle}>{nombreAdultoMayor} ({nombreContacto})</Text>
        <Text style={styles.timeText}>Hace 2 min · 8:14 AM</Text>
      </View>

      <View style={styles.mapaContenedor}>
        <MapView
          style={styles.mapa}
          region={{
            latitude: ubicacionAdulto?.latitude ?? ubicacionFamiliar?.latitude ?? 4.6482,
            longitude: ubicacionAdulto?.longitude ?? ubicacionFamiliar?.longitude ?? -74.0628,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          rotateEnabled={false} pitchEnabled={false}
        >
          {ubicacionFamiliar ? (
            <Marker coordinate={ubicacionFamiliar} title="Tu ubicación" pinColor="#3B82F6" />
          ) : null}
          {ubicacionAdulto ? (
            <Marker coordinate={ubicacionAdulto} title={nombreAdultoMayor} pinColor="#EF4444" />
          ) : null}
          {ubicacionFamiliar && ubicacionAdulto ? (
            <Polyline
              coordinates={[ubicacionFamiliar, ubicacionAdulto]}
              strokeColor="#EF4444"
              strokeWidth={5}
              lineDashPattern={[0]}
            />
          ) : null}
        </MapView>
      </View>

      <View style={styles.panelInferior}>
        <View style={styles.indicadorPanel} />
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall} activeOpacity={0.8}>
            <Ionicons name="call" size={20} color="#0F172A" />
            <Text style={styles.actionButtonText}>Llamar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mainActionButton} onPress={handleOnMyWay} activeOpacity={0.9}>
          <Ionicons name="location" size={24} color="#0F172A" />
          <Text style={styles.mainActionButtonText}>VOY EN CAMINO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resolveButton} onPress={handleMarkAsResolved} activeOpacity={0.7}>
          <Text style={styles.resolveButtonText}>Marcar alerta como resuelta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};