import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './styles';

export const HistorialFamiliar: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { idAdultoMayor, nombreAdulto } = (route.params as { idAdultoMayor: number; nombreAdulto: string }) || {};

  const [filtro, setFiltro] = useState('Todos');
  const [historialAgrupado, setHistorialAgrupado] = useState<any>({});
  const [cargando, setCargando] = useState(true);

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState<string | null>(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

  const manejarCambioFecha = (event: any, fechaSeleccionada?: Date) => {
    setMostrarCalendario(Platform.OS === 'ios');
    if (fechaSeleccionada) {
      // Ajuste de zona horaria para México/Local
      const tzOffset = fechaSeleccionada.getTimezoneOffset() * 60000;
      const fechaStr = new Date(fechaSeleccionada.getTime() - tzOffset).toISOString().split('T')[0];
      setFechaFiltro(fechaStr);
    } else {
      setMostrarCalendario(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      if (!idAdultoMayor) { setCargando(false); return; }

      const respuesta = await fetch(`${apiUrl}/medicamentos/usuario/${idAdultoMayor}/historial`);
      const datos = await respuesta.json();

      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const agrupado: any = {};
      const hoy = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
      const ayer = new Date(Date.now() - 86400000 - tzOffset).toISOString().split('T')[0];

      datos.forEach((item: any) => {
        let etiquetaFecha = item.Fecha_Asignada;
        if (item.Fecha_Asignada === hoy) etiquetaFecha = 'Hoy';
        else if (item.Fecha_Asignada === ayer) etiquetaFecha = 'Ayer';

        if (!agrupado[etiquetaFecha]) agrupado[etiquetaFecha] = [];
        agrupado[etiquetaFecha].push(item);
      });

      setHistorialAgrupado(agrupado);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [idAdultoMayor])
  );

  const formatearHora = (horaCruda: string) => {
    const [horas, minutos] = horaCruda.split(':');
    let h = parseInt(horas, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutos} ${ampm}`;
  };

  return (
    <View style={styles.contenedor}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonIcono} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Historial</Text>
        <TouchableOpacity style={styles.botonIcono} onPress={() => setMostrarCalendario(true)}>
          <Ionicons name={fechaFiltro ? "calendar" : "calendar-outline"} size={20} color={fechaFiltro ? "#10B981" : "#0F172A"} />
        </TouchableOpacity>
      </View>

      {/* Subtítulo con nombre del adulto */}
      <Text style={styles.subtituloNombre}>{nombreAdulto || 'Adulto Mayor'}</Text>

      {/* Tabs de filtro */}
      <View style={styles.tabsContainer}>
        {['Todos', 'Tomada', 'No tomada'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filtro === tab && styles.tabActivo]}
            onPress={() => setFiltro(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabTexto, filtro === tab && styles.tabTextoActivo]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Etiqueta de Filtro Activo */}
      {fechaFiltro && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 5 }}>
          <TouchableOpacity 
            style={{ backgroundColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setFechaFiltro(null)}
          >
            <Text style={{ fontSize: 13, color: '#475569', fontWeight: '600', marginRight: 6 }}>Viendo: {fechaFiltro}</Text>
            <Ionicons name="close-circle" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      {mostrarCalendario && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={manejarCambioFecha}
        />
      )}

      {/* Lista agrupada */}
      <ScrollView contentContainerStyle={styles.listaContainer} showsVerticalScrollIndicator={false}>
        {cargando ? (
          <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 40 }} />
        ) : Object.keys(historialAgrupado).length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="time-outline" size={64} color="#CBD5E1" />
            <Text style={{ color: '#94A3B8', fontSize: 15, marginTop: 16, textAlign: 'center' }}>
              Sin historial de medicamentos
            </Text>
          </View>
        ) : (
          Object.keys(historialAgrupado)
          .filter(fecha => {
            if (!fechaFiltro) return true;
            
            const tzOffset = new Date().getTimezoneOffset() * 60000;
            const hoyStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
            const ayerStr = new Date(Date.now() - 86400000 - tzOffset).toISOString().split('T')[0];
            
            let fechaReal = fecha;
            if (fecha === 'Hoy') fechaReal = hoyStr;
            if (fecha === 'Ayer') fechaReal = ayerStr;

            return fechaReal === fechaFiltro;
          })
          .map((fecha) => {

            const itemsFiltrados = historialAgrupado[fecha].filter((item: any) => {
              if (filtro === 'Todos') return true;
              if (filtro === 'Tomada') return item.Estado === 'tomado';
              if (filtro === 'No tomada') return item.Estado === 'incumplido';
              return true;
            });

            if (itemsFiltrados.length === 0) return null;

            return (
              <View key={fecha}>
                <Text style={styles.fechaSeccion}>{fecha}</Text>

                {itemsFiltrados.map((item: any) => {
                  const esTomada = item.Estado === 'tomado';

                  return (
                    <View key={item.Id_Historial} style={styles.tarjeta}>
                      <View style={styles.iconoEstadoContainer}>
                        <Ionicons
                          name={esTomada ? 'checkmark' : 'close'}
                          size={24}
                          color={esTomada ? '#10B981' : '#EF4444'}
                        />
                      </View>

                      <View style={styles.infoContainer}>
                        <Text style={styles.nombreMedicamento}>
                          {item.Nombre_Medicamento} - {item.Dosis}
                        </Text>
                        <View style={styles.detalleRow}>
                          <Ionicons name="time-outline" size={14} color="#64748B" />
                          <Text style={styles.detalleTexto}>
                            {formatearHora(item.Hora_Asignada)} • {item.Notas || 'Sin notas'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.badge, { backgroundColor: esTomada ? '#D1FAE5' : '#FEE2E2' }]}>
                        <Text style={[styles.badgeTexto, { color: esTomada ? '#10B981' : '#EF4444' }]}>
                          {esTomada ? 'TOMADA' : 'NO TOMADA'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
