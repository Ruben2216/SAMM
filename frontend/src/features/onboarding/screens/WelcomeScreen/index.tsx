import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { SelectionCard } from '../../../../components/ui/selection-card';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { styles } from './styles';
import { UserRole } from './types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../../navigation/appNavigator';

/**
 * Pantalla de Bienvenida - Primer paso del onboarding
 * Permite al usuario seleccionar su rol (Familiar o Adulto Mayor)
 */

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

export const WelcomeScreen: React.FC = () => {
  const [rolSeleccionado, setRolSeleccionado] = useState<UserRole>(null);
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const manejarContinuar = () => {
    if (!rolSeleccionado) return;

    if (rolSeleccionado === 'familiar') {
      console.log('Rol seleccionado: Familiar');
    }

    if (rolSeleccionado === 'adulto_mayor') {
      console.log('Rol seleccionado: Adulto Mayor');
    }

    navigation.navigate("CrearCuenta", {
      rol: rolSeleccionado
    });
  };

  return (
    <ScrollView
      style={styles.vistaDesplazable}
      contentContainerStyle={styles.contenedor}
      showsVerticalScrollIndicator={false}
    >
      <ProgressBar pasoActual={1} pasosTotales={3} />

      <View style={styles.seccionEncabezado}>
        <Text style={styles.titulo} children="Bienvenido a SAMM" />
        <Text style={styles.subtitulo} children="¿Quién eres?" />
        <Text
          style={styles.descripcion}
          children="Selecciona tu perfil para configurar la aplicación correctamente"
        />
      </View>

      <View style={styles.contenedorTarjetas}>
        <SelectionCard
          titulo="Soy Familiar"
          descripcion="Administro cuenta y medicamento"
          fuenteIcono={require('../../../../../assets/icons/gente.png')}
          alPresionar={() => setRolSeleccionado('familiar')}
          estaSeleccionado={rolSeleccionado === 'familiar'}
        />

        <SelectionCard
          titulo="Soy Adulto Mayor"
          descripcion="Quiero ver mis recordatorio, agendas, etc."
          fuenteIcono={require('../../../../../assets/icons/senior.png')}
          alPresionar={() => setRolSeleccionado('adulto_mayor')}
          estaSeleccionado={rolSeleccionado === 'adulto_mayor'}
        />
      </View>

      <SafeAreaView style={styles.contenedorBotonSafeArea} edges={['bottom']}>
        <View style={styles.contenedorBoton}>
          <PrimaryButton
            titulo="Continuar"
            alPresionar={manejarContinuar}
            deshabilitado={!rolSeleccionado}
          />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};
