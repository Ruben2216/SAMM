import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { Appointment } from '../../../family/screens/Citas/types';
import { AppointmentCard } from '../../../family/screens/Citas/components/AppointmentCard';
import { citasStyles, themeColors } from '../../../family/screens/Citas/styles';

type RootStackParamList = {
  HistorialCitas: undefined;
};

const seniorMockAppointments: Appointment[] = [
  { 
    id: '1', 
    doctorName: 'Dr. Pérez', 
    specialty: 'Cardiólogo', 
    date: '20 Oct', 
    time: '10:00 AM', 
    location: 'Clinica Santa Maria', 
    iconName: 'heart-pulse', 
    type: 'upcoming' 
  },
  { 
    id: '2', 
    doctorName: 'Dra. Gómez', 
    specialty: 'Oftalmólogo', 
    date: '15 Nov', 
    time: '3:30 PM', 
    location: 'Centro Óptico', 
    iconName: 'eye-outline', 
    type: 'upcoming' 
  },
];

export default function ProximasCitasSenior() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={[citasStyles.header, { justifyContent: 'space-between' }]}>
        <View style={{ width: 40 }} />
        
        <Text style={citasStyles.headerTitle}>Mis citas médicas</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('HistorialCitas')}
          style={{ padding: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Ver historial de citas"
        >
          <MaterialCommunityIcons name="history" size={28} color={themeColors.textDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={seniorMockAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        contentContainerStyle={citasStyles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}