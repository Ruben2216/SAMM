import React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { styles } from './styles';

export const NecesitaAyuda = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { nombreAdultoMayor = 'Papá', nombreContacto = 'Roberto', telefono = '3000000000' } = route.params || {};

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

  const handleMessage = () => { Alert.alert('Mensaje', `Abrir conversación con ${nombreContacto}`); };
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
          initialRegion={{ latitude: 4.6482, longitude: -74.0628, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
          rotateEnabled={false} pitchEnabled={false}
        >
          <Marker coordinate={{ latitude: 4.6406, longitude: -74.0738 }} title="Tú" pinColor="#3B82F6" />
          <Marker coordinate={{ latitude: 4.6622, longitude: -74.0588 }} title={nombreAdultoMayor} pinColor="#EF4444" />
          <Polyline coordinates={[{ latitude: 4.6406, longitude: -74.0738 }, { latitude: 4.6622, longitude: -74.0588 }]} strokeColor="#EF4444" strokeWidth={5} lineDashPattern={[0]} />
        </MapView>
      </View>

      <View style={styles.panelInferior}>
        <View style={styles.indicadorPanel} />
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall} activeOpacity={0.8}>
            <Ionicons name="call" size={20} color="#0F172A" />
            <Text style={styles.actionButtonText}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage} activeOpacity={0.8}>
            <Ionicons name="chatbubble" size={20} color="#0F172A" />
            <Text style={styles.actionButtonText}>Mensaje</Text>
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