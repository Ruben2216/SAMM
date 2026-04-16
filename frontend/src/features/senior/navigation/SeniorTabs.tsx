import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../theme';

import { Inicio } from '../screens/Inicio';
import { Historial } from '../screens/Historial';
import  Citas  from '../screens/Citas';
import { Perfil } from '../screens/Perfil';

const Tab = createBottomTabNavigator();

export const SeniorTabs = () => {
  const insets = useSafeAreaInsets();
  const tieneGestos = insets.bottom > 0;
  const alturaBarra = tieneGestos ? 60 + insets.bottom : 70;
  const paddingInferior = tieneGestos ? insets.bottom : 10;

  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }}
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
          marginBottom: tieneGestos ? 0 : 5,
        },
        tabBarStyle: {
          height: alturaBarra,
          paddingTop: 10,
          paddingBottom: paddingInferior,
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