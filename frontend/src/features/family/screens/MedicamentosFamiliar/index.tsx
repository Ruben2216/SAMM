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

const COLORES_ESTADO: { [estado: string]: { bg: string; border: string; text: string } } = {
  pendiente:  { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' },
  tomado:     { bg: '#D1FAE5', border: '#10B981', text: '#047857' },
  incumplido: { bg: '#FEE2E2', border: '#EF4444', text: '#B91C1C' },
  necesario:  { bg: '#E0E7FF', border: '#6366F1', text: '#4338CA' },
};

const etiquetaEstado = (estado: string) => {
  switch (estado) {
    case 'tomado': return 'Tomado';
    case 'incumplido': return 'No tomado';
    case 'necesario': return 'Según sea necesario';
    default: return 'Pendiente';
  }
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

        const medsFormateados: any[] = datosDB.flatMap((med: any) => {
          const frecuencia = DICCIONARIO_FRECUENCIA[med.Frecuencia] || med.Frecuencia;

          if (med.Frecuencia === 'necesario' || !med.horarios || med.horarios.length === 0) {
            return [{
              id_unico: `${med.Id_Medicamento}-necesario`,
              hora: 'Cuando lo necesite',
              horaCruda: null,
              nombre: med.Nombre,
              dosisCompleta: `${med.Dosis} • ${frecuencia}`,
              notas: med.Notas,
              estado: 'necesario',
            }];
          }

          return med.horarios
            .filter((h: any) => h.estado_hoy !== 'no_aplica_hoy')
            .map((horario: any) => {
              const [hStr, mStr] = horario.Hora_Toma.split(':');
              let horas = parseInt(hStr, 10);
              const ampm = horas >= 12 ? 'PM' : 'AM';
              horas = horas % 12 || 12;
              const horaUI = `(${horas}:${mStr} ${ampm})`;

              return {
                id_unico: `${med.Id_Medicamento}-${horario.Id_Horario}`,
                hora: horaUI,
                horaCruda: horario.Hora_Toma,
                nombre: med.Nombre,
                dosisCompleta: `${med.Dosis} • ${frecuencia}`,
                notas: med.Notas,
                estado: horario.estado_hoy || 'pendiente',
              };
            });
        });

        medsFormateados.sort((a: any, b: any) => {
          if (!a.horaCruda) return 1;
          if (!b.horaCruda) return -1;
          return a.horaCruda.localeCompare(b.horaCruda);
        });
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
          medicamentos.map((med) => {
            const colores = COLORES_ESTADO[med.estado] || COLORES_ESTADO.pendiente;
            const icono =
              med.estado === 'tomado' ? 'checkmark-circle' :
              med.estado === 'incumplido' ? 'close-circle' :
              med.estado === 'necesario' ? 'medkit' : 'time-outline';

            return (
              <View key={med.id_unico}>
                <Text style={styles.horaTitulo}>{med.hora}</Text>
                <View style={[styles.tarjetaMedicamento, styles.tarjetaConBorde, { borderColor: colores.border }]}>
                  <View style={styles.tarjetaHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nombreMedicamento}>{med.nombre}</Text>
                      <Text style={styles.dosisMedicamento}>{med.dosisCompleta}</Text>
                    </View>
                  </View>

                  {med.notas && med.notas.trim() !== '' && (
                    <View style={styles.notasContainer}>
                      <Ionicons name="document-text-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                      <Text style={styles.notasTexto}>{med.notas}</Text>
                    </View>
                  )}

                  <View style={styles.estadoRow}>
                    <View style={[styles.estadoBadge, { backgroundColor: colores.bg }]}>
                      <Ionicons name={icono as any} size={14} color={colores.border} />
                      <Text style={[styles.estadoBadgeTexto, { color: colores.text }]}>
                        {etiquetaEstado(med.estado)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
