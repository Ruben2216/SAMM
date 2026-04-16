import React, { useCallback, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
// Subimos 3 niveles: navigation -> senior -> features -> src -> theme
import { theme } from '../../../theme';

import { Inicio } from '../screens/Inicio';
import { Historial } from '../screens/Historial';
import Citas from '../screens/Citas';
import { Perfil } from '../screens/Perfil';

const Tab = createBottomTabNavigator();

const TAB_INICIO = 'Inicio';
const TIEMPO_DOBLE_ATRAS_MS = 2000;

export const SeniorTabs = () => {
  const navegacion = useNavigation<any>();
  const ruta = useRoute<any>();
  const ultimaPulsacionAtrasMs = useRef<number>(0);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const manejarAtras = () => {
        const estadoTabs = (ruta as any)?.state;
        const nombreTabActual =
          estadoTabs?.routes?.[estadoTabs.index ?? 0]?.name ?? TAB_INICIO;

        const ahora = Date.now();

        if (ahora - ultimaPulsacionAtrasMs.current < TIEMPO_DOBLE_ATRAS_MS) {
          BackHandler.exitApp();
          return true;
        }

        // Primer atrás: siempre regresa a Inicio y avisa que el siguiente sale
        ultimaPulsacionAtrasMs.current = ahora;

        if (nombreTabActual !== TAB_INICIO) {
          navegacion.navigate('SeniorTabs', { screen: TAB_INICIO });
        }

        ToastAndroid.show('Presiona atrás otra vez para salir', ToastAndroid.SHORT);
        return true;
      };

      const suscripcion = BackHandler.addEventListener('hardwareBackPress', manejarAtras);
      return () => suscripcion.remove();
    }, [navegacion, ruta])
  );

  return (
    <Tab.Navigator
      initialRouteName={TAB_INICIO}
      backBehavior="initialRoute"
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
          marginBottom:  5,
        },
        tabBarStyle: {
          height: 120 ,
          paddingBottom: 50,
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