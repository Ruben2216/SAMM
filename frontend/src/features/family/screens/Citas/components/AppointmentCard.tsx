import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { themeColors } from '../styles';
import { ConfirmationModal } from '../../../../../components/ui/confirmation-modal';
import { SuccessModal } from '../../../../../components/ui/success-modal';
import { eliminarCita } from '../../../../../services/citasService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface CitaDB {
  id: number;
  id_usuario: number;
  id_usuario_creador?: number;
  doctor_nombre: string;
  especialidad: string;
  fecha_hora: string;
  ubicacion: string;
  notas: string;
  estado: string;
}

interface AppointmentCardProps {
  appointment: CitaDB;
  refreshData: () => void;
  readOnly?: boolean;
  idAdultoMayor?: number;
  nombreAdulto?: string;
}

const obtenerIconoEspecialidad = (especialidad: string) => {
  if (!especialidad) return 'stethoscope';
  const n = especialidad.toLowerCase();
  if (n.includes('cardio')) return 'heart-pulse';
  if (n.includes('odonto') || n.includes('dent')) return 'tooth-outline';
  if (n.includes('oftalmo') || n.includes('ojo')) return 'eye-outline';
  if (n.includes('geriat')) return 'human-cane';
  if (n.includes('trauma') || n.includes('hueso')) return 'bone';
  return 'stethoscope';
};

const formatearFechaHora = (iso: string) => {
  const date = new Date(iso);
  const fecha = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const hora = date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { fecha, hora };
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  refreshData,
  readOnly = false,
  idAdultoMayor,
  nombreAdulto,
}) => {
  const [expandido, setExpandido] = useState(false);
  const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);
  const [modalEliminadaVisible, setModalEliminadaVisible] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const navigation = useNavigation<any>();

  const esHistorico = appointment.estado !== 'programada';
  const { fecha, hora } = formatearFechaHora(appointment.fecha_hora);

  const alternarExpansion = () => {
    if (esHistorico || readOnly) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido(!expandido);
  };

  const confirmarEliminacion = async () => {
    try {
      setEliminando(true);
      await eliminarCita(appointment.id);
      setModalConfirmarVisible(false);
      setModalEliminadaVisible(true);
    } catch (err) {
      console.log('Error eliminando cita:', err);
      setModalConfirmarVisible(false);
    } finally {
      setEliminando(false);
    }
  };

  const colorAccent = esHistorico ? themeColors.textMuted : themeColors.primary;
  const iconoEspecialidad = obtenerIconoEspecialidad(appointment.especialidad);

  return (
    <>
      <View style={[estilos.tarjeta, esHistorico && estilos.tarjeta__historica]}>
        <TouchableOpacity
          activeOpacity={esHistorico || readOnly ? 1 : 0.85}
          onPress={alternarExpansion}
          accessibilityRole="button"
          accessibilityLabel={`Cita de ${appointment.especialidad} con ${appointment.doctor_nombre} el ${fecha} a las ${hora}`}
        >
          <View style={estilos.filaTop}>
            <View style={[estilos.iconoBox, { backgroundColor: esHistorico ? '#F1F5F9' : '#F0FDF4', borderColor: colorAccent }]}>
              <MaterialCommunityIcons name={iconoEspecialidad} size={24} color={colorAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[estilos.especialidad, esHistorico && estilos.textoTenue]} numberOfLines={1}>
                {appointment.especialidad || 'Cita médica'}
              </Text>
              <Text style={[estilos.doctor, esHistorico && estilos.textoTenue]} numberOfLines={1}>
                {appointment.doctor_nombre}
              </Text>
            </View>
            {!readOnly && !esHistorico && (
              <MaterialCommunityIcons
                name={expandido ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={themeColors.textGray}
              />
            )}
          </View>

          <View style={estilos.filaFecha}>
            <View style={estilos.filaFechaItem}>
              <MaterialCommunityIcons name="calendar-month" size={16} color={colorAccent} />
              <Text style={[estilos.textoFecha, esHistorico && estilos.textoTenue]}>{fecha}</Text>
            </View>
            <View style={estilos.filaFechaItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colorAccent} />
              <Text style={[estilos.textoFecha, esHistorico && estilos.textoTenue]}>{hora}</Text>
            </View>
          </View>

          {appointment.ubicacion ? (
            <View style={estilos.filaUbicacion}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={themeColors.textGray} />
              <Text style={[estilos.textoUbicacion, esHistorico && estilos.textoTenue]} numberOfLines={1}>
                {appointment.ubicacion}
              </Text>
            </View>
          ) : null}

          {appointment.notas ? (
            <View style={estilos.notasBox}>
              <Text style={[estilos.notasTexto, esHistorico && estilos.textoTenue]} numberOfLines={2}>
                {appointment.notas}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {expandido && !esHistorico && !readOnly && (
          <View style={estilos.accionesRow}>
            <TouchableOpacity
              style={[estilos.botonAccion, estilos.botonEditar]}
              onPress={() =>
                navigation.navigate('AgendarCita', {
                  citaToEdit: appointment,
                  idAdultoMayor,
                  nombreAdulto,
                })
              }
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="pencil-outline" size={16} color={themeColors.text} />
              <Text style={estilos.botonEditar__texto}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[estilos.botonAccion, estilos.botonEliminar]}
              onPress={() => setModalConfirmarVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FFFFFF" />
              <Text style={estilos.botonEliminar__texto}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ConfirmationModal
        esVisible={modalConfirmarVisible}
        textoPregunta="¿Cancelar esta cita médica?"
        textoCancelar="No"
        textoConfirmar={eliminando ? 'Cancelando...' : 'Sí, cancelar'}
        alCancelar={() => !eliminando && setModalConfirmarVisible(false)}
        alConfirmar={() => !eliminando && void confirmarEliminacion()}
      />

      <SuccessModal
        esVisible={modalEliminadaVisible}
        mensaje="La cita fue cancelada."
        alTerminar={() => {
          setModalEliminadaVisible(false);
          refreshData();
        }}
      />
    </>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: themeColors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: themeColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  tarjeta__historica: {
    backgroundColor: '#F8FAFC',
  },
  filaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  especialidad: {
    fontSize: 16,
    fontWeight: '800',
    color: themeColors.textDark,
    letterSpacing: -0.3,
  },
  doctor: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.textGray,
    marginTop: 2,
  },
  textoTenue: {
    color: themeColors.textMuted,
  },
  filaFecha: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 10,
  },
  filaFechaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoFecha: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.textDark,
  },
  filaUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoUbicacion: {
    fontSize: 13,
    fontWeight: '500',
    color: themeColors.textGray,
    flex: 1,
  },
  notasBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  notasTexto: {
    fontSize: 12,
    fontWeight: '500',
    color: themeColors.textGray,
    lineHeight: 16,
  },
  accionesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  botonEditar: {
    backgroundColor: '#F1F5F9',
  },
  botonEditar__texto: {
    color: themeColors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  botonEliminar: {
    backgroundColor: themeColors.error,
  },
  botonEliminar__texto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
