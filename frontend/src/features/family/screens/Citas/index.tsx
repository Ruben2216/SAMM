import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { AppointmentCard, CitaDB } from './components/AppointmentCard';
import { citasStyles, themeColors } from './styles';
import { obtenerCitasUsuario } from '../../../../services/citasService';
import { useAuthStore } from '../../../auth/authStore';

type TabKey = 'proximas' | 'historial';

export default function CitasScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const usuario = useAuthStore((s) => s.usuario);

  const params = (route.params as { idAdultoMayor?: number; nombreAdulto?: string }) || {};
  const idAdultoMayor = params.idAdultoMayor ?? usuario?.Id_Usuario ?? 0;
  const nombreAdulto = params.nombreAdulto ?? usuario?.Nombre ?? '';

  const [tabActivo, setTabActivo] = useState<TabKey>('proximas');
  const [citasProximas, setCitasProximas] = useState<CitaDB[]>([]);
  const [citasHistorial, setCitasHistorial] = useState<CitaDB[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarCitas = useCallback(async () => {
    if (!idAdultoMayor) {
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      const data: CitaDB[] = await obtenerCitasUsuario(idAdultoMayor);

      const proximas = data
        .filter((c) => c.estado === 'programada')
        .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());

      const historial = data
        .filter((c) => c.estado !== 'programada')
        .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());

      setCitasProximas(proximas);
      setCitasHistorial(historial);
    } catch (error) {
      console.log('Error al cargar citas:', error);
    } finally {
      setCargando(false);
    }
  }, [idAdultoMayor]);

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [cargarCitas]),
  );

  const datos = tabActivo === 'proximas' ? citasProximas : citasHistorial;
  const mensajeVacio =
    tabActivo === 'proximas'
      ? 'No hay citas médicas programadas.'
      : 'Aún no hay citas en el historial.';

  return (
    <View style={citasStyles.contenedor}>
      <View style={citasStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={citasStyles.botonAtras}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={citasStyles.tituloHeader}>Citas médicas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={citasStyles.textosTop}>
        <Text style={citasStyles.tituloSecundario}>Agenda médica</Text>
        <Text style={citasStyles.descripcion}>
          {nombreAdulto 
            ? `Gestiona las próximas consultas y chequeos de ${nombreAdulto.split(' ')[0]}` 
            : 'Revisa tus próximas consultas y tu historial médico'}
        </Text>
      </View>

      <View style={citasStyles.tabsRow}>
        <TouchableOpacity
          style={[citasStyles.radioItem, tabActivo === 'proximas' && citasStyles.radioItemActivo]}
          onPress={() => setTabActivo('proximas')}
          activeOpacity={0.8}
        >
          <Text style={[citasStyles.radioTitulo, tabActivo === 'proximas' && citasStyles.textoActivo]}>
            Próximas ({citasProximas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[citasStyles.radioItem, tabActivo === 'historial' && citasStyles.radioItemActivo]}
          onPress={() => setTabActivo('historial')}
          activeOpacity={0.8}
        >
          <Text style={[citasStyles.radioTitulo, tabActivo === 'historial' && citasStyles.textoActivo]}>
            Historial ({citasHistorial.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {cargando ? (
          <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={datos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <AppointmentCard
                appointment={item}
                refreshData={cargarCitas}
                idAdultoMayor={idAdultoMayor}
                nombreAdulto={nombreAdulto}
              />
            )}
            contentContainerStyle={citasStyles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={citasStyles.estadoVacio}>
                <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
                <Text style={citasStyles.estadoVacio__texto}>{mensajeVacio}</Text>
              </View>
            )}
          />
        )}
      </View>

      {tabActivo === 'proximas' && idAdultoMayor > 0 && (
        <View style={citasStyles.footer}>
          <TouchableOpacity
            style={citasStyles.botonGuardar}
            onPress={() => navigation.navigate('AgendarCita', { idAdultoMayor, nombreAdulto })}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#0F172A" />
            <Text style={citasStyles.textoBoton}>Agendar nueva cita</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}