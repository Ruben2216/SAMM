// Ruta: src/features/senior/screens/Citas/index.tsx
import React from 'react';
import { FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB } from 'react-native-paper';
import { AppointmentCard } from './components/AppointmentCard';
import { Appointment } from './types';
import { citasStyles, themeColors } from './styles';

const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Pérez',
    specialty: 'Cardiólogo',
    date: '20 Oct',
    time: '10:00 AM',
    location: 'Clinica Santa Maria',
    iconName: 'heart-pulse',
    type: 'upcoming',
  },
  {
    id: '2',
    doctorName: 'Dra. Gómez',
    specialty: 'Oftalmólogo',
    date: '15 Nov',
    time: '3:30 PM',
    location: 'Centro Óptico',
    iconName: 'eye-outline',
    type: 'upcoming',
  },
];

export const Citas = ({ navigation }: any) => {
  return (
    <SafeAreaView style={citasStyles.container}>
      <FlatList
        data={mockAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        contentContainerStyle={citasStyles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <FAB
        icon="plus"
        label="Nueva Cita"
        style={citasStyles.fab}
        color={themeColors.text} 
        accessible={true}
        accessibilityLabel="Agendar una nueva cita médica"
        onPress={() => navigation.navigate('AgendarCita')} 
      />
    </SafeAreaView>
  );
};
export default Citas;