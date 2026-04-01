import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { createStyles } from './Ayudastyles';

type ParametrosNecesitaAyuda = {
  nombreAdultoMayor?: string;
  nombreContacto?: string;
  telefono?: string;
};

export const NecesitaAyuda: React.FC = () => {
  const route = useRoute<any>();
  const { width, height } = useWindowDimensions();
  const styles = React.useMemo(() => createStyles(width, height), [width, height]);
  const {
    nombreAdultoMayor = 'Papá',
    nombreContacto = 'Roberto',
    telefono = '3000000000',
  } = (route.params || {}) as ParametrosNecesitaAyuda;

  const handleCall = () => {
    Alert.alert(
      'Llamada',
      `Llamando a ${nombreContacto}...`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: async () => {
            const enlace = `tel:${telefono}`;
            try {
              const puedeAbrir = await Linking.canOpenURL(enlace);
              if (puedeAbrir) {
                await Linking.openURL(enlace);
              }
            } catch (error) {
              console.error('No se pudo iniciar la llamada del cuidador', error);
            }
          },
        }
      ]
    );
  };

  const handleMessage = () => {
    Alert.alert(
      'Mensaje',
      `Abrir conversación con ${nombreContacto}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir', onPress: () => console.log('Abriendo mensajes') }
      ]
    );
  };

  const handleOnMyWay = () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que vas en camino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'VOY EN CAMINO',
          onPress: () => {
            Alert.alert('Enviado', 'Se ha notificado que vas en camino');
          }
        }
      ]
    );
  };

  const handleMarkAsResolved = () => {
    Alert.alert(
      'Marcar como resuelto',
      '¿Esta solicitud de ayuda ha sido resuelta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Marcar como resuelto', 
          style: 'destructive',
          onPress: () => console.log('Solicitud marcada como resuelta')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECECEC" />

      <View style={styles.screen}>
        <View style={styles.encabezado}>
          <View style={styles.etiquetaAlerta}>
            <Text style={styles.etiquetaAlertaTexto}>Necesita Ayuda</Text>
          </View>

          <Text style={styles.mainTitle}>
            {nombreAdultoMayor} ({nombreContacto})
          </Text>
          <Text style={styles.timeText}>Hace 2 min · 8:14 AM</Text>
        </View>

        <View style={styles.mapaContenedor}>
          <MapView
            style={styles.mapa}
            initialRegion={{
              latitude: 4.6482,
              longitude: -74.0628,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            rotateEnabled={false}
            pitchEnabled={false}
            accessibilityLabel="Mapa de ubicación de emergencia"
        >
            <Marker coordinate={{ latitude: 4.6406, longitude: -74.0738 }} title="Tu ubicación" />
            <Marker coordinate={{ latitude: 4.6622, longitude: -74.0588 }} title="Ubicación de ayuda" />
            <Polyline
              coordinates={[
                { latitude: 4.6406, longitude: -74.0738 },
                { latitude: 4.6478, longitude: -74.067 },
                { latitude: 4.6518, longitude: -74.0624 },
                { latitude: 4.6577, longitude: -74.0607 },
                { latitude: 4.6622, longitude: -74.0588 },
              ]}
              strokeColor="#EF4444"
              strokeWidth={4}
            />
          </MapView>
        </View>

        <View style={styles.panelInferior}>
          <View style={styles.indicadorPanel} />

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              accessibilityLabel="Llamar al contacto"
              accessibilityRole="button"
              style={styles.actionButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={17} color="#1E293B" />
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Enviar mensaje"
              accessibilityRole="button"
              style={styles.actionButton}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbox-ellipses-outline" size={17} color="#1E293B" />
              <Text style={styles.actionButtonText}>Mensaje</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            accessibilityLabel="Confirmar que vas en camino"
            accessibilityRole="button"
            style={styles.mainActionButton}
            onPress={handleOnMyWay}
            activeOpacity={0.8}
          >
            <Ionicons name="location-sharp" size={19} color="#0F172A" />
            <Text style={styles.mainActionButtonText}>VOY EN CAMINO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Marcar alerta como resuelta"
            accessibilityRole="button"
            style={styles.resolveButton}
            onPress={handleMarkAsResolved}
            activeOpacity={0.7}
          >
            <Text style={styles.resolveButtonText}>Marcar alerta como resuelta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NecesitaAyuda;