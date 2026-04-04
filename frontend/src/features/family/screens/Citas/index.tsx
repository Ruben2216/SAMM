// src/features/family/screens/Citas/index.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { AppointmentCard } from './components/AppointmentCard';
import { Appointment } from './types';
import { citasStyles, themeColors } from './styles';

// Tipado estricto para la navegación
type RootStackParamList = {
  AgendarCita: undefined;
  // ... otras rutas
};

const mockAppointments: Appointment[] = [
  { id: '1', doctorName: 'Dr. Pérez', specialty: 'Cardiólogo', date: '20 Oct', time: '10:00 AM', location: 'Clinica Santa Maria', iconName: 'heart-pulse', type: 'upcoming' },
  { id: '2', doctorName: 'Dra. Gómez', specialty: 'Oftalmólogo', date: '15 Nov', time: '3:30 PM', location: 'Centro Óptico', iconName: 'eye-outline', type: 'upcoming' },
];

const historyAppointments: Appointment[] = [
  { id: '3', doctorName: 'Dr. López', specialty: 'Médico general', date: '5 Sep', time: '9:00 AM', location: 'Clinica Santa Maria', iconName: 'account-box-outline', type: 'history' },
  { id: '4', doctorName: 'Dra. Ruiz', specialty: 'Médico general', date: '20 Ago', time: '2:00 PM', location: 'Centro médico', iconName: 'account-box-outline', type: 'history' },
];

export default function CitasFamiliarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'proximas' | 'historial'>('proximas');

  const currentData = activeTab === 'proximas' ? mockAppointments : historyAppointments;
  const currentTitle = activeTab === 'proximas' ? 'Mis citas médicas' : 'Historial de citas';

  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={citasStyles.header}>
        <TouchableOpacity 
          style={citasStyles.backButton} 
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Regresar a la pantalla anterior"
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.textDark} />
        </TouchableOpacity>
        <Text style={citasStyles.headerTitle}>{currentTitle}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AppointmentCard appointment={item} />}
          contentContainerStyle={citasStyles.listContainer}
          showsVerticalScrollIndicator={false}
        />
        
        {/* BOTÓN NUEVA CITA */}
        {activeTab === 'proximas' && (
          <TouchableOpacity
            style={citasStyles.fab}
            onPress={() => navigation.navigate('AgendarCita')}
            accessibilityRole="button"
            accessibilityLabel="Agregar nueva cita médica"
          >
            <MaterialCommunityIcons name="plus" size={24} color={themeColors.textDark} />
            <Text style={citasStyles.fabText}>Nueva Cita</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TABS INFERIORES */}
      <View style={citasStyles.bottomTabBar}>
        <TouchableOpacity 
          style={citasStyles.tabItem} 
          onPress={() => setActiveTab('proximas')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'proximas' }}
        >
          <MaterialCommunityIcons 
            name={activeTab === 'proximas' ? 'calendar-month' : 'calendar-month-outline'} 
            size={28} 
            color={activeTab === 'proximas' ? themeColors.primary : themeColors.textMuted} 
          />
          <Text style={[citasStyles.tabText, { color: activeTab === 'proximas' ? themeColors.primary : themeColors.textMuted }]}>Próximas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={citasStyles.tabItem} 
          onPress={() => setActiveTab('historial')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'historial' }}
        >
          <MaterialCommunityIcons 
            name="history" 
            size={28} 
            color={activeTab === 'historial' ? themeColors.primary : themeColors.textMuted} 
          />
          <Text style={[citasStyles.tabText, { color: activeTab === 'historial' ? themeColors.primary : themeColors.textMuted }]}>Historial</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}