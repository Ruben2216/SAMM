import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';

const DICCIONARIO_FRECUENCIA: { [key: string]: string } = {
  'una': '1 vez al día',
  'dos': '2 veces al día',
  'necesario': 'Según sea necesario',
};

export const MedicamentosFamiliar: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { idAdultoMayor, nombreAdulto } = (route.params as { idAdultoMayor: number; nombreAdulto: string }) || {};

  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

  const cargarMedicamentos = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${apiUrl}/medicamentos/usuario/${idAdultoMayor}`);
      if (res.ok) {
        const datosDB = await res.json();

        const medsFormateados = datosDB.flatMap((med: any) => {
          return med.horarios.map((horario: any) => {
            const [hStr, mStr] = horario.Hora_Toma.split(':');
            let horas = parseInt(hStr, 10);
            const ampm = horas >= 12 ? 'PM' : 'AM';
            horas = horas % 12 || 12;
            const horaUI = `(${horas}:${mStr} ${ampm})`;
            const frecuencia = DICCIONARIO_FRECUENCIA[med.Frecuencia] || med.Frecuencia;
            const yaTomado = med.tomado_hoy === true;

            return {
              id_unico: `${med.Id_Medicamento}-${horario.Id_Horario}`,
              hora: horaUI,
              horaCruda: horario.Hora_Toma,
              nombre: med.Nombre,
              dosisCompleta: `${med.Dosis} • ${frecuencia}`,
              notas: med.Notas,
              estado: yaTomado ? 'tomado' : 'pendiente',
              colorPunto: yaTomado ? '#00E676' : '#FEF08A',
            };
          });
        });

        medsFormateados.sort((a: any, b: any) => a.horaCruda.localeCompare(b.horaCruda));
        setMedicamentos(medsFormateados);
      }
    } catch (err) {
      console.log('Error cargando medicamentos:', err);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (idAdultoMayor) cargarMedicamentos();
    }, [idAdultoMayor])
  );

  return (
    <View style={styles.contenedor}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonIcono} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Medicamentos</Text>
        <View style={styles.botonIcono}>
          <Ionicons name="medkit-outline" size={20} color="#0F172A" />
        </View>
      </View>

      {/* Subtítulo con el nombre del adulto (al que se vinculo en caso de tener mas) */}
      <Text style={styles.subtituloNombre}>{nombreAdulto || 'Adulto Mayor'}</Text>

      {/* Lista de medicamentos */}
      <ScrollView contentContainerStyle={styles.listaContainer} showsVerticalScrollIndicator={false}>
        {cargando ? (
          <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 50 }} />
        ) : medicamentos.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="medkit-outline" size={64} color="#CBD5E1" />
            <Text style={{ color: '#94A3B8', fontSize: 15, marginTop: 16, textAlign: 'center' }}>
              No tiene medicamentos registrados
            </Text>
          </View>
        ) : (
          medicamentos.map((med) => (
            <View key={med.id_unico}>
              <Text style={styles.horaTitulo}>{med.hora}</Text>
              <View style={styles.tarjetaMedicamento}>
                <View style={styles.tarjetaHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nombreMedicamento}>{med.nombre}</Text>
                    <Text style={styles.dosisMedicamento}>{med.dosisCompleta}</Text>
                  </View>
                  <View style={[styles.puntoEstado, { backgroundColor: med.colorPunto }]} />
                </View>

                {med.notas && med.notas.trim() !== '' && (
                  <View style={styles.notasContainer}>
                    <Ionicons name="document-text-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                    <Text style={styles.notasTexto}>{med.notas}</Text>
                  </View>
                )}

                {/* Badge de estado (solo lectura, sin botones de acción) */}
                <View style={styles.estadoRow}>
                  <View style={[styles.estadoBadge, { backgroundColor: med.estado === 'tomado' ? '#D1FAE5' : '#FEF9C3' }]}>
                    <Ionicons
                      name={med.estado === 'tomado' ? 'checkmark-circle' : 'time-outline'}
                      size={14}
                      color={med.estado === 'tomado' ? '#10B981' : '#F59E0B'}
                    />
                    <Text style={[styles.estadoBadgeTexto, { color: med.estado === 'tomado' ? '#10B981' : '#F59E0B' }]}>
                      {med.estado === 'tomado' ? 'Tomado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};
