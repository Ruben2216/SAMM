import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';

import { AppointmentCard } from '../../../family/screens/Citas/components/AppointmentCard';
import { citasStyles, themeColors } from './styles';

import { obtenerCitasUsuario } from '../../../../services/citasService';
import { useAuthStore } from '../../../auth/authStore';

type RootStackParamList = {
  HistorialCitas: undefined;
};

export default function ProximasCitasSenior() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { usuario } = useAuthStore();
  
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarCitas = async () => {
    try {
      setCargando(true);
      const idUsuario = usuario?.Id_Usuario || 2; 
      const data = await obtenerCitasUsuario(idUsuario);
      
      const citasProgramadas = data.filter((cita: any) => cita.estado === 'programada');
      
      citasProgramadas.sort((a: any, b: any) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
      
      setCitas(citasProgramadas);
    } catch (error) {
      console.log('Error al cargar citas:', error);
      Alert.alert('Error', 'No pudimos cargar tus citas.');
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [])
  );

  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={[citasStyles.header, { justifyContent: 'space-between' }]}>
        <View style={{ width: 40 }} />
        
        <Text style={citasStyles.headerTitle}>Mis citas médicas</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('HistorialCitas')}
          style={{ padding: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Ver historial de citas"
        >
          <MaterialCommunityIcons name="history" size={28} color={themeColors.text} />
        </TouchableOpacity>
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
              refreshData={cargarCitas} 
              readOnly={true} 
            />
          )}
          contentContainerStyle={citasStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 50, color: themeColors.textMuted }}>
              No tienes citas médicas programadas.
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}