import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { AppointmentCard, CitaDB } from './components/AppointmentCard';
import { citasStyles } from './styles';
import { obtenerCitasUsuario } from '../../../../services/citasService';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';

type TabKey = 'proximas' | 'historial';

export default function CitasScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const usuario = useAuthStore((s) => s.usuario);

  const params = (route.params as { idAdultoMayor?: number; nombreAdulto?: string }) || {};
  const esAdultoMismo = !params.idAdultoMayor;
  const idAdultoMayor = params.idAdultoMayor ?? usuario?.Id_Usuario ?? 0;
  const nombreInicial =
    (params.nombreAdulto && params.nombreAdulto.trim()) ||
    (esAdultoMismo ? usuario?.Nombre ?? '' : '');

  const [nombreAdulto, setNombreAdulto] = useState<string>(nombreInicial);
  const [tabActivo, setTabActivo] = useState<TabKey>('proximas');
  const [citasProximas, setCitasProximas] = useState<CitaDB[]>([]);
  const [citasHistorial, setCitasHistorial] = useState<CitaDB[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroHistorial, setFiltroHistorial] = useState('Todas');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (nombreAdulto || !idAdultoMayor || esAdultoMismo) return;
    let cancelado = false;
    (async () => {
      try {
        const res = await httpClient.get('/vinculacion/mis-vinculaciones');
        const vincs: Array<{ Id_Adulto_Mayor: number; Nombre_Adulto_Mayor: string | null }> =
          res.data || [];
        const encontrado = vincs.find((v) => v.Id_Adulto_Mayor === idAdultoMayor);
        if (!cancelado && encontrado?.Nombre_Adulto_Mayor) {
          setNombreAdulto(encontrado.Nombre_Adulto_Mayor);
        }
      } catch (err) {
        console.log('Error obteniendo nombre del adulto:', err);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [nombreAdulto, idAdultoMayor, esAdultoMismo]);

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

  const historialFiltrado = citasHistorial.filter((cita) => {
    if (filtroHistorial === 'Todas') return true;
    const estadoDB = (cita.estado || '').toLowerCase();
    if (filtroHistorial === 'Completadas' && estadoDB === 'completada') return true;
    if (filtroHistorial === 'Canceladas' && estadoDB === 'cancelada') return true;
    return false;
  });

  const datos = tabActivo === 'proximas' ? citasProximas : historialFiltrado;
  
  const mensajeVacio =
    tabActivo === 'proximas'
      ? 'No hay citas médicas programadas.'
      : filtroHistorial === 'Todas'
      ? 'Aún no hay citas en el historial.'
      : `No hay citas ${filtroHistorial.toLowerCase()} en este momento`;

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

      {tabActivo === 'historial' && !cargando && (
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
                    borderColor: activo ? '#00E676' : '#E2E8F0',
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
                readOnly={tabActivo === 'historial'}
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
        <View style={[citasStyles.footer, {paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 25}]}>
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