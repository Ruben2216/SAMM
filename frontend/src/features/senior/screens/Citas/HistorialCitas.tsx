import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
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

  // NUEVO 1: Estado para controlar el filtro activo
  const [filtroHistorial, setFiltroHistorial] = useState('Todas');

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      // Usamos el ID del adulto mayor logueado. Si no hay, intentamos con el ID temporal (2)
      const idUsuario = usuario?.Id_Usuario || 2; 
      const data = await obtenerCitasUsuario(idUsuario);
      
      // Para el historial, filtramos TODO lo que NO sea "programada" (blindado contra mayúsculas)
      const citasHistorial = data.filter((cita: any) => (cita.estado || '').toLowerCase() !== 'programada');
      
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

  // NUEVO 2: Filtramos la lista de acuerdo al botón presionado
  const historialFiltrado = citas.filter((cita) => {
    if (filtroHistorial === 'Todas') return true;
    
    const estadoDB = (cita.estado || '').toLowerCase();
    
    if (filtroHistorial === 'Completadas' && estadoDB === 'completada') return true;
    if (filtroHistorial === 'Canceladas' && estadoDB === 'cancelada') return true;
    
    return false;
  });

  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={citasStyles.header}>
        <TouchableOpacity 
          style={citasStyles.headerRightButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Regresar"
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={citasStyles.headerTitle}>Historial de citas</Text>
      </View>

      {/* NUEVO 3: La barra de filtros con tu paleta verde/blanco */}
      {!cargando && (
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Todas', 'Completadas', 'Canceladas'].map((filtro) => {
              const activo = filtroHistorial === filtro;
              return (
                <TouchableOpacity
                  key={filtro}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 25,
                    backgroundColor: activo ? '#ECFDF5' : '#FFFFFF',
                    marginRight: 10,
                    borderWidth: 1,
                    borderColor: activo ? '#10B981' : '#E2E8F0',
                  }}
                  onPress={() => setFiltroHistorial(filtro)}
                  activeOpacity={0.8}
                >
                  <Text style={{ 
                    fontWeight: activo ? '700' : '600', 
                    color: activo ? '#0F172A' : '#64748B',
                    fontSize: 14 
                  }}>
                    {filtro}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {cargando ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={historialFiltrado} // <-- NUEVO 4: Pasamos la lista filtrada
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AppointmentCard 
              appointment={item} 
              refreshData={cargarHistorial} 
              readOnly={true} 
            />
          )}
          contentContainerStyle={citasStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 50, color: themeColors.textMuted, paddingHorizontal: 20 }}>
              {filtroHistorial === 'Todas' 
                ? 'Aún no tienes un historial de citas médicas.' 
                : `No tienes citas ${filtroHistorial.toLowerCase()} registradas.`}
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}