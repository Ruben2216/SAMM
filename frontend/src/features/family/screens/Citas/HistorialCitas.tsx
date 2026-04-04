import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppointmentCard } from './components/AppointmentCard';
import { Appointment } from './types';
import { citasStyles, themeColors } from './styles';

const historyAppointments: Appointment[] = [
  {
    id: '3',
    doctorName: 'Dr. López',
    specialty: 'Médico general',
    date: '5 Sep',
    time: '9:00 AM',
    location: 'Clinica Santa Maria',
    iconName: 'account-outline',
    type: 'history', 
  },
];

export const HistorialCitasScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={citasStyles.header}>
        <TouchableOpacity 
          style={citasStyles.backButton}
          onPress={() => navigation.goBack()} 
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={citasStyles.headerTitle}>Historial de citas</Text>
      </View>

      <FlatList
        data={historyAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        contentContainerStyle={citasStyles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HistorialCitasScreen;