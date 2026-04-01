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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createStyles } from './asistenciaStyles';

type ParametrosAsistencia = {
  nombreContacto?: string;
  telefono?: string;
};

export const Asistencia: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width, height } = useWindowDimensions();
  const styles = React.useMemo(() => createStyles(width, height), [width, height]);
  const { nombreContacto = 'María Pérez', telefono = '3000000000' } =
    (route.params || {}) as ParametrosAsistencia;
  const iniciales = nombreContacto
    .split(' ')
    .map((palabra) => palabra.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleCall = () => {
    Alert.alert('Llamada de asistencia', `Llamando a ${nombreContacto}...`, [
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
            console.error('No se pudo iniciar la llamada de asistencia', error);
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar asistencia',
      '¿Estás seguro de que deseas cancelar la solicitud?',
      [
        { text: 'Seguir', style: 'cancel' },
        { 
          text: 'Cancelar', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECECEC" />

      <View style={styles.screen}>
        <View style={styles.centroContenido}>
          <View style={styles.anilloExterior}>
            <View style={styles.anilloInterior}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.alertText}>Avisando a tu familia...</Text>
          <Text style={styles.notificationText}>
            Hemos enviado una notificación prioritaria.
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={14} color="#64748B" />
            <Text style={styles.locationText}>Compartiendo ubicación en tiempo real</Text>
          </View>
        </View>

        <View style={styles.pieAcciones}>
          <View style={styles.contactContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{iniciales}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{nombreContacto}</Text>
              <Text style={styles.contactStatus}>Recibiendo alerta...</Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel="Llamar ahora"
            accessibilityRole="button"
            style={styles.callButton}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={18} color="#0F172A" />
            <Text style={styles.callButtonText}>Llamar ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Cancelar alerta"
            accessibilityRole="button"
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
        >
            <Text style={styles.cancelButtonText}>Ha sido un error, cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Abrir pantalla de seguimiento del familiar"
            accessibilityRole="button"
            style={styles.enlaceSeguimiento}
            onPress={() =>
              navigation.navigate('NecesitaAyuda', {
                nombreAdultoMayor: 'Papá',
                nombreContacto,
                telefono,
              })
            }
          >
            <Text style={styles.enlaceSeguimientoTexto}>Ver seguimiento familiar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Asistencia;