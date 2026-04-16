import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { AppointmentCard } from './components/AppointmentCard';
import { citasStyles, themeColors } from './styles';

// Conexión al backend
import { obtenerCitasUsuario } from '../../../../services/citasService';

type RootStackParamList = {
  AgendarCita: undefined;
};

export default function CitasFamiliarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { idAdultoMayor } = (route.params as { idAdultoMayor?: number }) || {};
  const [activeTab, setActiveTab] = useState<'proximas' | 'historial'>('proximas');


  // Estados para los datos reales
  const [citasProximas, setCitasProximas] = useState<any[]>([]);
  const [citasHistorial, setCitasHistorial] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Función para traer datos del servidor
  const cargarCitas = async () => {
    try {
      setCargando(true);
      // TEMP: Buscamos las citas del ID 2
      const data = await obtenerCitasUsuario(2);
      
      // Separamos en Próximas y el Historial usando el campo "estado"
      const proximas = data.filter((cita: any) => cita.estado === 'programada');
      const historial = data.filter((cita: any) => cita.estado !== 'programada');

      // Ordenamos las próximas por fecha (la más cercana primero)
      proximas.sort((a: any, b: any) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());

      setCitasProximas(proximas);
      setCitasHistorial(historial);
    } catch (error) {
      console.log('Error al cargar citas:', error);
      Alert.alert('Error', 'No pudimos cargar tus citas de la base de datos.');
    } finally {
      setCargando(false);
    }
  };

  // Recarga automáticamente al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [])
  );

  const currentData = activeTab === 'proximas' ? citasProximas : citasHistorial;
  const currentTitle = activeTab === 'proximas' ? 'Mis citas médicas' : 'Historial de citas';

  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={citasStyles.header}>
        <TouchableOpacity
          style={citasStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.textDark} />
        </TouchableOpacity>
        <Text style={citasStyles.headerTitle}>{currentTitle}</Text>
      </View>

      <View style={{ flex: 1 }}>
        {cargando ? (
          <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={currentData}
            // Usamos el ID real de la base de datos como Key (convertido a string)
            keyExtractor={(item) => item.id.toString()}
            // Le pasamos a la tarjeta la función cargarCitas para que se actualice al borrar
            renderItem={({ item }) => <AppointmentCard appointment={item} refreshData={cargarCitas} />}
            contentContainerStyle={citasStyles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', marginTop: 50, color: themeColors.textMuted }}>
                No hay citas en esta sección.
              </Text>
            )}
          />
        )}

        {/* BOTÓN NUEVA CITA */}
        {activeTab === 'proximas' && (
          <TouchableOpacity
            style={citasStyles.fab}
            onPress={() => navigation.navigate('AgendarCita')}
          >
            <MaterialCommunityIcons name="plus" size={24} color={themeColors.textDark} />
            <Text style={citasStyles.fabText}>Nueva Cita</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TABS INFERIORES */}
      <View style={citasStyles.bottomTabBar}>
        <TouchableOpacity
          style={citasStyles.tabItem}
          onPress={() => setActiveTab('proximas')}
        >
          <MaterialCommunityIcons
            name={activeTab === 'proximas' ? 'calendar-month' : 'calendar-month-outline'}
            size={28}
            color={activeTab === 'proximas' ? themeColors.primary : themeColors.textMuted}
          />
          <Text style={[citasStyles.tabText, { color: activeTab === 'proximas' ? themeColors.primary : themeColors.textMuted }]}>Próximas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={citasStyles.tabItem}
          onPress={() => setActiveTab('historial')}
        >
          <MaterialCommunityIcons
            name="history"
            size={28}
            color={activeTab === 'historial' ? themeColors.primary : themeColors.textMuted}
          />
          <Text style={[citasStyles.tabText, { color: activeTab === 'historial' ? themeColors.primary : themeColors.textMuted }]}>Historial</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}