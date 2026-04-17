import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { theme } from './src/theme';
import { registrarParaNotificaciones } from './src/services/notificationService';
import { useAuthStore } from './src/features/auth/authStore';
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


const Stack = createStackNavigator();

/**
 * Componente raíz de la aplicación SAMM
 * Configura proveedores globales y navegación
 */
export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const idUsuario = useAuthStore((s) => s.usuario?.Id_Usuario);

  // Re-registra el token cada vez que cambia el usuario (login/logout)
  useEffect(() => {
    if (idUsuario) {
      registrarParaNotificaciones(idUsuario);
    }
  }, [idUsuario]);

  useEffect(() => {
    // Listener: cuando llega una notificación estando en la app
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[App] Notificación recibida:', notification.request.content.title);
    });

    // Listener: cuando el usuario toca la notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const datos = response.notification.request.content.data;

      if (datos?.tipo === 'recordatorio_medicamento') {
        navigationRef.current?.navigate('RecordatorioMedicamento', {
          idMedicamento: datos.idMedicamento,
          nombreMedicamento: datos.nombreMedicamento,
          dosis: datos.dosis,
          notas: datos.notas,
          horaToma: datos.horaToma,
        });
      } else if (datos?.tipo === 'alerta_familiar') {
        navigationRef.current?.navigate('AlertaMedicamento', {
          nombreAdulto: datos.nombreAdulto,
          rolAdulto: datos.rolAdulto,
          nombreMedicamento: datos.nombreMedicamento,
          horaToma: datos.horaToma,
          tipo: datos.tipoAlerta,
        });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
          //Esta linea de abajo es para cargar una pantalla en especifico no deberia de afectar en nada amenos de que lo activen
           // initialRouteName="MiPerfilFamiliar"
            // Configuracion original: sin initialRouteName (comienza en la primera pantalla registrada)
            initialRouteName="Initial"
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
      </PaperProvider>
    </SafeAreaProvider>
  );
}
