import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export const Asistencia = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { nombreContacto = 'Familiar Principal', telefono = '3000000000' } = route.params || {};
  const pulsosRadar = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
    
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

  useEffect(() => {
    const animaciones = pulsosRadar.map((pulso) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulso, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulso, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.stagger(600, animaciones).start();

    return () => {
      animaciones.forEach((animacion) => animacion.stop());
    };
  }, [pulsosRadar]);

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.botonAtras}
          accessibilityLabel="Volver a la pantalla anterior"
        >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Asistencia</Text>
        <View style={styles.espaciadorHeader} />
      </View>

      <View style={styles.centroContenido}>
        <View style={styles.anillosContainer}>
            {pulsosRadar.map((pulso, indice) => (
              <Animated.View
                key={`pulso-${indice}`}
                style={[
                  styles.pulsoRadar,
                  {
                    transform: [
                      {
                        scale: pulso.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.55, 1.75],
                        }),
                      },
                    ],
                    opacity: pulso.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.42, 0],
                    }),
                  },
                ]}
              />
            ))}
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
            <View style={styles.estadoContactoFila}>
                <View style={styles.puntoVerde} />
                <Text style={styles.contactStatus}>Recibiendo alerta...</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCall}
          activeOpacity={0.85}
          accessibilityLabel={`Llamar ahora a ${nombreContacto}`}
        >
          <Ionicons name="call" size={24} color="#0F172A" />
          <Text style={styles.callButtonText}>Llamar ahora</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
          accessibilityLabel="Cancelar alerta de asistencia"
        >
          <Text style={styles.cancelButtonText}>Ha sido un error, cancelar alerta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};