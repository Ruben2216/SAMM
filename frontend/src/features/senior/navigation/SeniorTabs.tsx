import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
// Subimos 3 niveles: navigation -> senior -> features -> src -> theme
import { theme } from '../../../theme'; 

// Importamos las vistas desde la carpeta screens vecina
import { Inicio } from '../screens/Inicio';
import { Historial } from '../screens/Historial';
import { Citas } from '../screens/Citas';
import { Perfil } from '../screens/Perfil';

const Tab = createBottomTabNavigator();

export const SeniorTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Citas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarStyle: {
          height: 70,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          elevation: 8,
          shadowOpacity: 0.1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={Inicio} />
      <Tab.Screen name="Historial" component={Historial} />
      <Tab.Screen name="Citas" component={Citas} />
      <Tab.Screen name="Perfil" component={Perfil} />
    </Tab.Navigator>
  );
};