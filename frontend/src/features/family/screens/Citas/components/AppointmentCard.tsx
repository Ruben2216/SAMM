import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { citasStyles, themeColors } from '../styles';
import { Appointment } from '../types';

// Tipado Estricto (Regla 4)
interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const isHistory = appointment.type === 'history';

  // Determinamos el color del icono por separado
  const iconColor = isHistory ? themeColors.textMuted : themeColors.textDark;

  return (
    <View 
      style={citasStyles.card}
      // Reglas de Accesibilidad (Regla 3)
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Cita de ${appointment.specialty} con ${appointment.doctorName} el ${appointment.date} a las ${appointment.time} en ${appointment.location}`}
    >
      <View style={citasStyles.cardTopRow}>
        
        <View style={[citasStyles.iconBox, isHistory && citasStyles.iconBoxHistory]}>
          <MaterialCommunityIcons 
            name={appointment.iconName} 
            size={32} 
            color={iconColor} 
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[citasStyles.specialtyText, isHistory && citasStyles.textHistory]}>
            {appointment.specialty}:
          </Text>
          <Text style={[citasStyles.doctorText, isHistory && citasStyles.textHistory]}>
            {appointment.doctorName}
          </Text>
        </View>

      </View>
      
      <View>
        <Text style={[citasStyles.dateTimeText, isHistory && citasStyles.textHistory]}>
          {appointment.date}, {appointment.time}
        </Text>
        <Text style={[citasStyles.locationText, isHistory && citasStyles.textHistory]}>
          {appointment.location}
        </Text>
      </View>
      
    </View>
  );
};