import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
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
  
  const [filtroActivo, setFiltroActivo] = useState('Todas'); 

  const cargarHistorial = useCallback(async () => {
    if (!idAdultoMayor) { setCargando(false); return; }
    try {
      setCargando(true);
      const data: CitaDB[] = await obtenerCitasUsuario(idAdultoMayor);
      
      const historial = data
        .filter((c) => (c.estado || '').toLowerCase() !== 'programada')
        .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
        
      setCitas(historial);
    } catch (error) {
      console.log('Error al cargar historial:', error);
    } finally {
      setCargando(false);
    }
  }, [idAdultoMayor]);

  useFocusEffect(useCallback(() => { cargarHistorial(); }, [cargarHistorial]));

  const citasFiltradas = citas.filter((cita) => {
    if (filtroActivo === 'Todas') return true;
    const estadoDB = (cita.estado || '').toLowerCase();
    if (filtroActivo === 'Completadas' && estadoDB === 'completada') return true;
    if (filtroActivo === 'Canceladas' && estadoDB === 'cancelada') return true;
    return false;
  });

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

      {!cargando && (
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Todas', 'Completadas', 'Canceladas'].map((filtro) => {
              const activo = filtroActivo === filtro;
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
                  onPress={() => setFiltroActivo(filtro)}
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
        <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={citasFiltradas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <AppointmentCard appointment={item} refreshData={cargarHistorial} readOnly idAdultoMayor={idAdultoMayor} nombreAdulto={nombreAdulto} />}
          contentContainerStyle={citasStyles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={citasStyles.estadoVacio}>
              <Ionicons name="time-outline" size={64} color="#CBD5E1" />
              <Text style={citasStyles.estadoVacio__texto}>
                {filtroActivo === 'Todas' 
                  ? 'Aún no hay citas en el historial.' 
                  : `No hay citas ${filtroActivo.toLowerCase()} en este momento.`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}