import React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export const Asistencia = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { nombreContacto = 'Familiar Principal', telefono = '3000000000' } = route.params || {};
    
  const iniciales = nombreContacto.split(' ').map((p: string) => p.charAt(0)).join('').slice(0, 2).toUpperCase();

  const handleCall = () => {
    Alert.alert('Llamada de asistencia', `Llamando a ${nombreContacto}...`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Llamar', onPress: async () => {
          try {
            if (await Linking.canOpenURL(`tel:${telefono}`)) await Linking.openURL(`tel:${telefono}`);
          } catch (error) { console.error('Error llamada', error); }
        }
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancelar asistencia', '¿Deseas cancelar la solicitud?', [
      { text: 'Seguir avisando', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Asistencia</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.centroContenido}>
        <View style={styles.anillosContainer}>
            <View style={styles.anilloExterior}>
            <View style={styles.anilloInterior}>
                <Ionicons name="notifications" size={36} color="#EF4444" />
            </View>
            </View>
        </View>
        <Text style={styles.alertText}>Avisando a tu familia...</Text>
        <Text style={styles.notificationText}>Hemos enviado una notificación prioritaria.</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="#EF4444" />
          <Text style={styles.locationText}>Compartiendo tu ubicación actual</Text>
        </View>
      </View>

      <View style={styles.pieAcciones}>
        <Text style={styles.seccionTitulo}>Contacto notificado</Text>
        <View style={styles.contactContainer}>
          <View style={styles.avatarContainer}><Text style={styles.avatarText}>{iniciales}</Text></View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{nombreContacto}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <View style={styles.puntoVerde} />
                <Text style={styles.contactStatus}>Recibiendo alerta...</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.85}>
          <Ionicons name="call" size={24} color="#0F172A" />
          <Text style={styles.callButtonText}>Llamar ahora</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Ha sido un error, cancelar alerta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};