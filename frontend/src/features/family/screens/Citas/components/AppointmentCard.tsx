import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { citasStyles, themeColors } from '../styles';

// Importamos el servicio para poder borrar
import { eliminarCita } from '../../../../../services/citasService';

// Activar animaciones de Layout en Android (Para el efecto acordeón)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Tipado Estricto de la Base de Datos Real (Regla 4)
export interface CitaDB {
  id: number;
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
}

// 1. Diccionario Mágico de Iconos
const getIconForSpecialty = (especialidad: string) => {
  if (!especialidad) return 'stethoscope';
  const normalize = especialidad.toLowerCase();
  if (normalize.includes('cardio')) return 'heart-pulse';
  if (normalize.includes('odonto') || normalize.includes('dent')) return 'tooth-outline';
  if (normalize.includes('oftalmo') || normalize.includes('ojo')) return 'eye-outline';
  if (normalize.includes('geriat')) return 'human-cane';
  if (normalize.includes('trauma') || normalize.includes('hueso')) return 'bone';
  return 'stethoscope';
};

// 2. Formateador de Fechas
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  return `${date.toLocaleDateString('es-MX', optionsDate)}, ${date.toLocaleTimeString('es-MX', optionsTime)}`;
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, refreshData, readOnly = false }) => {
  // Estado local para controlar si la tarjeta está abierta o cerrada
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation<any>();
  
  const isHistory = appointment.estado !== 'programada';
  const iconColor = isHistory ? themeColors.textMuted : themeColors.textDark;

  // Función para abrir/cerrar con animación
  const toggleExpand = () => {
    // Si es del historial, no abrimos el menú de editar/eliminar
    if (isHistory || readOnly) return; 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Función para confirmar y borrar
  const handleEliminar = () => {
    Alert.alert(
      "¿Cancelar Cita?",
      "¿Estás seguro de que quieres eliminar esta cita médica?.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí", 
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarCita(appointment.id);
              Alert.alert("Éxito", "La cita fue cancelada.");
              refreshData(); // Le avisamos al index.tsx que vuelva a cargar la lista
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar la cita.");
            }
          }
        }
      ]
    );
  };

  return (
    <View 
      style={[
        localStyles.cardContainer, 
        isHistory ? localStyles.historyBg : localStyles.activeBg
      ]}
    >
      <TouchableOpacity 
        activeOpacity={isHistory ? 1 : 0.8} 
        style={localStyles.cardInfo}
        onPress={toggleExpand}
        // Reglas de Accesibilidad (Regla 3)
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Cita de ${appointment.especialidad} con ${appointment.doctor_nombre} el ${formatDateTime(appointment.fecha_hora)} en ${appointment.ubicacion}`}
      >
        <View style={localStyles.cardHeaderRow}>
          <View style={[localStyles.iconBox, isHistory && { borderColor: themeColors.textMuted }]}>
            <MaterialCommunityIcons 
              name={getIconForSpecialty(appointment.especialidad)} 
              size={32} 
              color={iconColor} 
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[localStyles.specialtyText, isHistory && { color: themeColors.textMuted }]}>
              {appointment.especialidad}:
            </Text>
            <Text style={[localStyles.doctorText, isHistory && { color: themeColors.textMuted }]}>
              {appointment.doctor_nombre}
            </Text>
          </View>
        </View>
        
        <View>
          <Text style={[localStyles.dateText, isHistory && { color: themeColors.textMuted }]}>
            {formatDateTime(appointment.fecha_hora)}
          </Text>
          
          <View style={localStyles.locationRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={iconColor} />
            <Text style={[localStyles.locationText, isHistory && { color: themeColors.textMuted }]} numberOfLines={1}>
              {appointment.ubicacion || 'Sin ubicación registrada'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* BOTONES OCULTOS*/}
      {expanded && !isHistory && (
        <View style={localStyles.actionButtonsRow}>
          <TouchableOpacity 
            style={[localStyles.actionBtn, localStyles.editBtn]}
            onPress={() => navigation.navigate('AgendarCita', {citaToEdit: appointment})}
          >
            <Text style={localStyles.editBtnText}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[localStyles.actionBtn, localStyles.deleteBtn]}
            onPress={handleEliminar}
          >
            <Text style={localStyles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Estilos específicos para esta tarjeta, respetando tus variables
const localStyles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeBg: {
    backgroundColor: '#8CE9B4', // El verde vivo para las próximas
  },
  historyBg: {
    backgroundColor: '#F1F5F9', // Gris claro para el historial
  },
  cardInfo: {
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: themeColors.textDark,
    borderRadius: 12,
    padding: 8,
    marginRight: 16,
  },
  specialtyText: {
    fontSize: 22,
    fontWeight: '900',
    color: themeColors.textDark,
  },
  doctorText: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 24,
    fontWeight: '900',
    color: themeColors.textDark,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.textDark,
    marginLeft: 6,
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#FDE68A', 
    marginRight: 8,
  },
  editBtnText: {
    color: '#D97706',
    fontWeight: '900',
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: '#FECACA', 
    marginLeft: 8,
  },
  deleteBtnText: {
    color: '#B91C1C',
    fontWeight: '900',
    fontSize: 16,
  },
});