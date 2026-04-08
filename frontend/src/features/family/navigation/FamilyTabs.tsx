import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../../theme';
import { crearEstiloTabBar, styles } from './FamilyTabs.styles';

import { Inicio } from '../screens/Inicio';
import { Familia } from '../screens/Familia';
import { Recordatorio } from '../screens/Recordatorio';
import { Perfil } from '../screens/Perfil';

const Tab = createBottomTabNavigator();

const SAFE_AREA_INSETS = { bottom: 0 };

export const FamilyTabs = () => {
  const insets = useSafeAreaInsets();
  const estiloTabBar = crearEstiloTabBar(insets.bottom);

  return (
    <Tab.Navigator
        safeAreaInsets={SAFE_AREA_INSETS}
        screenOptions={({ route }: { route: any }) => ({
          tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Inicio') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Familia') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Recordatorio') {
              iconName = focused ? 'notifications' : 'notifications-outline';
            } else if (route.name === 'Perfil') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-circle-outline';
            }

            return <Ionicons name={iconName} size={28} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: estiloTabBar,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Inicio" component={Inicio} />
        <Tab.Screen name="Familia" component={Familia} />
        <Tab.Screen name="Recordatorio" component={Recordatorio} />
        <Tab.Screen name="Perfil" component={Perfil} />
      </Tab.Navigator>
  );
};
