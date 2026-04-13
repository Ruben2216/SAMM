import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';

import { AppointmentCard } from './components/AppointmentCard';
import { citasStyles, themeColors } from './styles';

// Conexión al backend
import { obtenerCitasUsuario } from '../../../../services/citasService';

type RootStackParamList = {
  CitasFamiliar: undefined;
};

export default function HistorialCitasScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Traemos los datos reales del backend
  const cargarHistorial = async () => {
    try {
      setCargando(true);
      // TEMP: Usamos el ID 2
      const data = await obtenerCitasUsuario(2);
      
      // Filtramos todo lo que no esté programado
      const citasHistorial = data.filter((cita: any) => cita.estado !== 'programada');
      
      // Ordenamos (la más reciente hasta arriba)
      citasHistorial.sort((a: any, b: any) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
      
      setCitas(citasHistorial);
    } catch (error) {
      console.log('Error al cargar historial:', error);
      Alert.alert('Error', 'No pudimos cargar tu historial de citas de la base de datos.');
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
          style={citasStyles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.textDark} />
        </TouchableOpacity>
        <Text style={citasStyles.headerTitle}>Historial de citas</Text>
      </View>

      <View style={{ flex: 1 }}>
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
              />
            )}
            contentContainerStyle={citasStyles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', marginTop: 50, color: themeColors.textMuted }}>
                Aún no hay citas en tu historial.
              </Text>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}