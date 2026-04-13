import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';

// Importamos el componente reciclado
import { AppointmentCard } from '../../../family/screens/Citas/components/AppointmentCard';
import { citasStyles, themeColors } from './styles';

// Conexión al backend y autenticación
import { obtenerCitasUsuario } from '../../../../services/citasService';
import { useAuthStore } from '../../../auth/authStore';

type RootStackParamList = {
  // Ajusta según tus rutas reales
  ProximasCitas: undefined; 
};

export default function HistorialCitasSenior() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { usuario } = useAuthStore();
  
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      // Usamos el ID del adulto mayor logueado. Si no hay, intentamos con el ID temporal (2)
      const idUsuario = usuario?.Id_Usuario || 2; 
      const data = await obtenerCitasUsuario(idUsuario);
      
      // Para el historial, filtramos TODO lo que NO sea "programada"
      const citasHistorial = data.filter((cita: any) => cita.estado !== 'programada');
      
      // Ordenamos por fecha (la más reciente primero)
      citasHistorial.sort((a: any, b: any) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
      
      setCitas(citasHistorial);
    } catch (error) {
      console.log('Error al cargar historial:', error);
      Alert.alert('Error', 'No pudimos cargar tu historial de citas.');
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [])
  );

  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={citasStyles.header}>
        <TouchableOpacity 
          style={citasStyles.headerRightButton} // Usamos el estilo para el botón de retroceso
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Regresar"
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={citasStyles.headerTitle}>Historial de citas</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AppointmentCard 
              appointment={item} 
              refreshData={cargarHistorial} 
              // Mantenemos el modo solo lectura para el adulto mayor
              readOnly={true} 
            />
          )}
          contentContainerStyle={citasStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 50, color: themeColors.textMuted }}>
              Aún no tienes un historial de citas médicas.
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}