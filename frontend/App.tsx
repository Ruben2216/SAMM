import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NativeModules, Platform, StatusBar, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from './src/theme';
import { useFamilyPreferencesStore } from './src/store/useFamilyPreferencesStore';
import { useAuthStore } from './src/features/auth/authStore';
import { AppLock } from './src/components/ui/app-lock';
import { InitialScreen } from './src/features/onboarding/screens/InitialScreen';
import { WelcomeScreen } from './src/features/onboarding/screens/WelcomeScreen';
import { IniciarSesion } from './src/features/onboarding/screens/IniciarSesion';
import { CrearCuenta } from './src/features/onboarding/screens/CrearCuenta';
import { VinculacionFamiliar } from './src/features/onboarding/screens/VinculacionFamiliar';
import { VinculacionSenior } from './src/features/onboarding/screens/VinculacionSenior';
import { CreateCircleScreen } from './src/features/onboarding/screens/CreateCircleScreen/CreateCircleScreen';
import { RolEnCirculo } from './src/features/onboarding/screens/RolEnCirculo';
//Es solo por ahora
import {MiPerfilFamiliar} from './src/features/family/screens/Perfil';
import {Mapa} from './src/features/family/screens/Mapa';

import { SeniorTabs } from './src/features/senior/navigation/SeniorTabs';
import { AgregarMedicamento } from './src/features/senior/screens/AgregarMedicamento';
import { EstablecerHora } from './src/features/senior/screens/EstablecerHora';
import CitasScreen from './src/features/family/screens/Citas';
import AgendarCitaScreen from './src/features/family/screens/Citas/AgendarCita';
import HistorialCitasScreen from './src/features/family/screens/Citas/HistorialCitas';
import { Perfil } from './src/features/senior/screens/Perfil';
import { Emergencia } from './src/features/senior/screens/Emergencia';
import { AgregarContactos } from './src/features/senior/screens/Emergencia/AgregarContactos';
import { Asistencia } from './src/features/senior/screens/Emergencia/Asistencia';
import { NecesitaAyuda } from './src/features/senior/screens/Emergencia/NecesitaAyuda';

import { FamilyTabs } from './src/features/family/navigation/FamilyTabs';
import { CodigoVinculacion } from './src/features/family/screens/CodigoVinculacion';
import { MedicamentosFamiliar } from './src/features/family/screens/MedicamentosFamiliar';
import { HistorialFamiliar } from './src/features/family/screens/HistorialFamiliar';
import { RecordatorioMedicamento } from './src/features/senior/screens/RecordatorioMedicamento';
import { AlertaMedicamento } from './src/features/family/screens/AlertaMedicamento';

import { ForgotPasswordScreen } from './src/features/onboarding/screens/ForgotPasswordScreen';
import { CheckEmailScreen } from './src/features/onboarding/screens/CheckEmailScreen';
import { ResetPasswordScreen } from './src/features/onboarding/screens/ResetPasswordScreen';
import { MonitorActualizaciones } from './src/components/ui/MonitorActualizaciones';


const Stack = createStackNavigator();

const linking = {
  prefixes: ['samm://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

const moduloDispositivo = NativeModules.SAMMDeviceToken;

/**
 * Componente raíz de la aplicación SAMM
 * Configura proveedores globales y navegación
 */
export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any> | null>(null);

  const [bloqueoVisible, setBloqueoVisible] = useState(false);
  const [bloqueoCargando, setBloqueoCargando] = useState(false);
  const [bloqueoDescripcion, setBloqueoDescripcion] = useState('Desbloquea SAMM para continuar.');
  const [inicializando, setInicializando] = useState(true);
  const desbloqueoEnCursoRef = useRef(false);

  const intentarDesbloquear = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    if (desbloqueoEnCursoRef.current) return false;

    desbloqueoEnCursoRef.current = true;
    setBloqueoCargando(true);
    setBloqueoDescripcion('Confirma tu identidad para ingresar.');

    try {
      const tieneHardware = await LocalAuthentication.hasHardwareAsync();
      const estaEnrolado = await LocalAuthentication.isEnrolledAsync();

      // Si el dispositivo no soporta o no tiene credenciales/biometría configurada,
      // no bloqueamos (evitamos dejar la app inaccesible).
      if (!tieneHardware || !estaEnrolado) {
        setBloqueoVisible(false);
        return true;
      }

      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear SAMM',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (resultado.success) {
        setBloqueoVisible(false);
        return true;
      }

      setBloqueoDescripcion('Autenticación requerida para ingresar.');
      return false;
    } catch (e: any) {
      console.error('[AppLock] Error autenticando:', e?.message || e);
      setBloqueoDescripcion('No se pudo autenticar. Intenta de nuevo.');
      return false;
    } finally {
      setBloqueoCargando(false);
      desbloqueoEnCursoRef.current = false;
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const inicializar = async () => {
      try {
        // 1) Preferencias (AsyncStorage)
        await useFamilyPreferencesStore.getState().rehidratar();

        // 2) Sesión (SecureStore)
        await useAuthStore.getState().cargarSesionGuardada();
        if (!activo) return;

        // 3) Bloqueo de app (solo Android) si el usuario lo activó.
        if (Platform.OS !== 'android') return;

        const usuario = useAuthStore.getState().usuario;
        if (!usuario?.Id_Usuario) return;

        const preferencias = useFamilyPreferencesStore
          .getState()
          .obtenerConfiguracion(usuario.Id_Usuario);

        if (!preferencias.biometriaFaceId) return;

        setBloqueoVisible(true);
        setBloqueoDescripcion('Desbloquea SAMM para continuar.');
        await intentarDesbloquear();
      } catch (e: any) {
        console.error('[App] Error inicializando:', e?.message || e);
      } finally {
        if (activo) {
          setInicializando(false);
        }
      }
    };

    void inicializar();
    return () => {
      activo = false;
    };
  }, [intentarDesbloquear]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) return;

    if (moduloDispositivo?.guardarApiUrl) {
      void moduloDispositivo.guardarApiUrl(apiUrl);
    }
  }, []);

  // El registro del token de notificaciones se hace en authStore (login/register/asignarRol).
  // Al tocar la notificación, abrir la pantalla correspondiente.
  useEffect(() => {
    const manejarRespuesta = (response: Notifications.NotificationResponse) => {
      const datos = response.notification.request.content.data as any;
      if (!datos?.tipo || !navigationRef.current) return;

      if (datos.tipo === 'recordatorio_medicamento') {
        navigationRef.current.navigate('RecordatorioMedicamento', {
          idMedicamento: datos.idMedicamento,
          nombreMedicamento: datos.nombreMedicamento,
          dosis: datos.dosis,
          notas: datos.notas,
          horaToma: datos.horaToma,
        });
      } else if (datos.tipo === 'alerta_familiar') {
        navigationRef.current.navigate('AlertaMedicamento', {
          idAdulto: datos.id_adulto ?? datos.idAdulto,
          nombreAdulto: datos.nombreAdulto,
          rolAdulto: datos.rolAdulto || datos.rol_adulto_mayor,
          horaToma: datos.horaToma,
          tipo: datos.tipoAlerta,
        });
      }
    };

    const suscripcion = Notifications.addNotificationResponseReceivedListener(manejarRespuesta);

    Notifications.getLastNotificationResponseAsync().then((ultima) => {
      if (ultima) manejarRespuesta(ultima);
    });

    return () => suscripcion.remove();
  }, []);

  const autenticado = useAuthStore((state) => state.autenticado);
  const usuario = useAuthStore((state) => state.usuario);

  if (inicializando) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  let rutaInicial: keyof ReactNavigation.RootParamList | string = 'Initial';
  if (autenticado && usuario) {
    if (usuario.Rol === 'familiar') {
      rutaInicial = 'FamilyTabs';
    } else if (usuario.Rol === 'adulto_mayor') {
      rutaInicial = 'SeniorTabs';
    }
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <MonitorActualizaciones />
        <NavigationContainer ref={navigationRef} linking={linking}>
          <Stack.Navigator
            initialRouteName={rutaInicial as any}
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="Initial" component={InitialScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="IniciarSesion" component={IniciarSesion} />
            <Stack.Screen name="CrearCuenta" component={CrearCuenta} />
            <Stack.Screen name="VinculacionFamiliar" component={VinculacionFamiliar} />
            <Stack.Screen name="VinculacionSenior" component={VinculacionSenior} />
            <Stack.Screen name="CreateCircleScreen" component={CreateCircleScreen} />
            <Stack.Screen name="RolEnCirculo" component={RolEnCirculo} />

            {/* Recuperación de contraseña */}
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />


            {/* Ruta Principal del Adulto Mayor */}
            <Stack.Screen name="SeniorTabs" component={SeniorTabs} />
            <Stack.Screen name="AgregarMedicamento" component={AgregarMedicamento} />
            <Stack.Screen name="EstablecerHora" component={EstablecerHora} />
            <Stack.Screen name="Citas" component={CitasScreen} />
            <Stack.Screen name="AgendarCita" component={AgendarCitaScreen} />
            <Stack.Screen name="HistorialCitas" component={HistorialCitasScreen} />
            <Stack.Screen name="Perfil" component={Perfil} />
            <Stack.Screen name="Emergencia" component={Emergencia} />
            <Stack.Screen name="AgregarContactos" component={AgregarContactos} />
            <Stack.Screen name="Asistencia" component={Asistencia} />
            <Stack.Screen name="NecesitaAyuda" component={NecesitaAyuda} />
            <Stack.Screen name="Mapa" component={Mapa} />


            {/* Ruta Principal del Familiar */}
            <Stack.Screen name="FamilyTabs" component={FamilyTabs} />
            <Stack.Screen name="MiPerfilFamiliar" component={MiPerfilFamiliar} />

            <Stack.Screen name="CitasFamiliar" component={CitasScreen} />
            <Stack.Screen name="CodigoVinculacion" component={CodigoVinculacion} />
            <Stack.Screen name="MedicamentosFamiliar" component={MedicamentosFamiliar} />
            <Stack.Screen name="HistorialFamiliar" component={HistorialFamiliar} />

            {/* Pantallas de notificaciones */}
            <Stack.Screen name="RecordatorioMedicamento" component={RecordatorioMedicamento} />
            <Stack.Screen name="AlertaMedicamento" component={AlertaMedicamento} />

          </Stack.Navigator>
        </NavigationContainer>

        <AppLock
          esVisible={bloqueoVisible}
          cargando={bloqueoCargando}
          titulo="Acceso protegido"
          descripcion={bloqueoDescripcion}
          textoBoton="Desbloquear"
          alReintentar={() => {
            void intentarDesbloquear();
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
