import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, NativeModules, Platform, ToastAndroid } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import * as Battery from 'expo-battery';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../theme';

import { useAuthStore } from '../../auth/authStore';
import httpClient from '../../../services/httpService';

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
  const insets = useSafeAreaInsets();
  const tieneGestos = insets.bottom > 0;
  const alturaBarra = tieneGestos ? 60 + insets.bottom : 70;
  const paddingInferior = tieneGestos ? insets.bottom : 10;

  const idUsuario = useAuthStore((s) => s.usuario?.Id_Usuario ?? null);
  const rolUsuario = useAuthStore((s) => s.usuario?.Rol ?? null);

  const ultimoEnvioMsRef = useRef<number>(0);
  const ultimoEstadoEnviadoRef = useRef<{ porcentaje: number; cargando: boolean } | null>(null);
  const porcentajeActualRef = useRef<number | null>(null);
  const cargandoActualRef = useRef<boolean>(false);

  useEffect(() => {
    if (Platform.OS !== 'android' || rolUsuario !== 'adulto_mayor') return;

    const prepararNotificacionesYServicio = async () => {
      try {
        const permisos = await Notifications.getPermissionsAsync();
        if (permisos.status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }

        // Reintento: si al loguear el servicio falló por falta de permisos, lo levantamos acá.
        const moduloDispositivo = NativeModules.SAMMDeviceToken;
        if (moduloDispositivo?.iniciarServicioBateria) {
          await moduloDispositivo.iniciarServicioBateria();
        }
      } catch {
        // Silencioso
      }
    };

    prepararNotificacionesYServicio();
  }, [rolUsuario]);

  useEffect(() => {
    if (!idUsuario || rolUsuario !== 'adulto_mayor') return;

    let subNivel: Battery.Subscription | null = null;
    let subEstado: Battery.Subscription | null = null;

    const enviarEstado = async (porcentaje: number, cargando: boolean) => {
      const ahora = Date.now();

      // Throttle defensivo para no saturar al backend.
      if (ahora - ultimoEnvioMsRef.current < 15000) return;

      const ultimo = ultimoEstadoEnviadoRef.current;
      if (ultimo && ultimo.porcentaje === porcentaje && ultimo.cargando === cargando) {
        // Si no cambió nada, limitar aún más el envío.
        if (ahora - ultimoEnvioMsRef.current < 60000) return;
      }

      try {
        await httpClient.put('/users/me/bateria', {
          porcentaje,
          esta_cargando: cargando,
        });

        ultimoEnvioMsRef.current = ahora;
        ultimoEstadoEnviadoRef.current = { porcentaje, cargando };
      } catch {
        // Silencioso: el estado se reintentará cuando haya cambios o en el próximo envío.
      }
    };

    const leerYEnviar = async () => {
      try {
        const nivel = await Battery.getBatteryLevelAsync();
        const estado = await Battery.getBatteryStateAsync();

        const porcentaje = Math.round(nivel * 100);
        const cargando =
          estado === Battery.BatteryState.CHARGING || estado === Battery.BatteryState.FULL;

        porcentajeActualRef.current = porcentaje;
        cargandoActualRef.current = cargando;

        await enviarEstado(porcentaje, cargando);
      } catch {
        // Si falla (dispositivo/permiso), no bloquea navegación.
      }
    };

    leerYEnviar();

    subNivel = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      const porcentaje = Math.round((batteryLevel ?? 0) * 100);
      porcentajeActualRef.current = porcentaje;
      enviarEstado(porcentaje, cargandoActualRef.current);
    });

    subEstado = Battery.addBatteryStateListener(({ batteryState }) => {
      const cargando =
        batteryState === Battery.BatteryState.CHARGING ||
        batteryState === Battery.BatteryState.FULL;
      cargandoActualRef.current = cargando;
      enviarEstado(porcentajeActualRef.current ?? 0, cargando);
    });

    return () => {
      subNivel?.remove();
      subEstado?.remove();
    };
  }, [idUsuario, rolUsuario]);

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