import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from './src/theme';
import { InitialScreen } from './src/features/onboarding/screens/InitialScreen';
import { WelcomeScreen } from './src/features/onboarding/screens/WelcomeScreen';
import { IniciarSesion } from './src/features/onboarding/screens/IniciarSesion';
import { CrearCuenta } from './src/features/onboarding/screens/CrearCuenta';
import { VinculacionFamiliar } from './src/features/onboarding/screens/VinculacionFamiliar';
import { VinculacionSenior } from './src/features/onboarding/screens/VinculacionSenior';

import { SeniorTabs } from './src/features/senior/navigation/SeniorTabs';
import { AgregarMedicamento } from './src/features/senior/screens/AgregarMedicamento';
import { EstablecerHora } from './src/features/senior/screens/EstablecerHora';
import { Citas as ProximasCitasScreen } from './src/features/senior/screens/Citas';
import { Perfil } from './src/features/senior/screens/Perfil';

import { FamilyTabs } from '@/features/family/navigation/FamilyTabs';

const Stack = createStackNavigator();

/**
 * Componente raíz de la aplicación SAMM
 * Configura proveedores globales y navegación
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <NavigationContainer>
          <Stack.Navigator
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

            {/* Ruta Principal del Adulto Mayor */}
            <Stack.Screen name="SeniorTabs" component={SeniorTabs} />
            <Stack.Screen name="AgregarMedicamento" component={AgregarMedicamento} />
            <Stack.Screen name="EstablecerHora" component={EstablecerHora} />
            <Stack.Screen name="Citas" component={ProximasCitasScreen} />
            <Stack.Screen name="Perfil" component={Perfil} />

            {/* Ruta Principal del Familiar */}
            <Stack.Screen name="FamilyTabs" component={FamilyTabs} />

          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
