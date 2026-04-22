import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { AppointmentCard, CitaDB } from '../components/AppointmentCard';
import { citasStyles } from './styles';
import { obtenerCitasUsuario } from '../../../../../services/citasService';
import { useAuthStore } from '../../../../auth/authStore';

export default function HistorialCitasScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const usuario = useAuthStore((s) => s.usuario);

  const params = (route.params as { idAdultoMayor?: number; nombreAdulto?: string }) || {};
  const idAdultoMayor = params.idAdultoMayor ?? usuario?.Id_Usuario ?? 0;
  const nombreAdulto = params.nombreAdulto ?? usuario?.Nombre ?? '';

  const [citas, setCitas] = useState<CitaDB[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = useCallback(async () => {
    if (!idAdultoMayor) { setCargando(false); return; }
    try {
      setCargando(true);
      const data: CitaDB[] = await obtenerCitasUsuario(idAdultoMayor);
      const historial = data.filter((c) => c.estado !== 'programada').sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
      setCitas(historial);
    } catch (error) {
      console.log('Error al cargar historial:', error);
    } finally {
      setCargando(false);
    }
  }, [idAdultoMayor]);

  useFocusEffect(useCallback(() => { cargarHistorial(); }, [cargarHistorial]));

  return (
    <View style={citasStyles.contenedor}>
      <View style={citasStyles.header}>
        <TouchableOpacity style={citasStyles.botonAtras} onPress={() => navigation.goBack()} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={citasStyles.tituloHeader}>Historial de citas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={citasStyles.textosTop}>
        <Text style={citasStyles.tituloSecundario}>Registro completo</Text>
        <Text style={citasStyles.descripcion}>
          {nombreAdulto ? `Revisa todas las consultas médicas pasadas de ${nombreAdulto.split(' ')[0]}` : 'Revisa todas tus consultas médicas pasadas y su estado'}
        </Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <AppointmentCard appointment={item} refreshData={cargarHistorial} readOnly idAdultoMayor={idAdultoMayor} nombreAdulto={nombreAdulto} />}
          contentContainerStyle={citasStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={citasStyles.estadoVacio}>
              <Ionicons name="time-outline" size={64} color="#CBD5E1" />
              <Text style={citasStyles.estadoVacio__texto}>Aún no hay citas en el historial.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}