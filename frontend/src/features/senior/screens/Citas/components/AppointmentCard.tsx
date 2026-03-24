// Ruta: src/features/senior/screens/Citas/components/AppointmentCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Appointment } from '../types';
import { citasStyles, themeColors } from '../styles';

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const isHistory = appointment.type === 'history';
  const currentTextColor = isHistory ? themeColors.textMuted : themeColors.text;

  return (
    <Card 
      style={citasStyles.card}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Cita con ${appointment.specialty}, ${appointment.doctorName}, fecha ${appointment.date} a las ${appointment.time}`}
    >
      <Card.Content style={citasStyles.cardContent}>
        <View style={citasStyles.headerRow}>
          <View style={citasStyles.iconContainer}>
            <MaterialCommunityIcons 
              name={appointment.iconName} 
              size={32} 
              color={currentTextColor} 
            />
          </View>
          <View style={citasStyles.doctorInfo}>
            <Text style={[citasStyles.specialty, { color: currentTextColor }]}>
              {appointment.specialty}:
            </Text>
            <Text style={[citasStyles.doctorName, { color: currentTextColor }]}>
              {appointment.doctorName}
            </Text>
          </View>
        </View>

        <Text style={[citasStyles.dateTime, { color: currentTextColor }]}>
          {appointment.date}, {appointment.time}
        </Text>
        
        <Text style={[citasStyles.location, { color: currentTextColor }]}>
          {appointment.location}
        </Text>
      </Card.Content>
    </Card>
  );
};