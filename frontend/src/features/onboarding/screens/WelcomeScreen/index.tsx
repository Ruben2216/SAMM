import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { SelectionCard } from '../../../../components/ui/selection-card';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { styles } from './styles';
import { UserRole } from './types';

/**
 * Pantalla de Bienvenida - Primer paso del onboarding
 * Permite al usuario seleccionar su rol (Familiar o Adulto Mayor)
 */
export const WelcomeScreen: React.FC = () => {
  const [rolSeleccionado, setRolSeleccionado] = useState<UserRole>(null);

  const manejarContinuar = () => {
    if (!rolSeleccionado) return;
    
    console.log('Rol seleccionado:', rolSeleccionado);
  };

  return (
    <ScrollView 
      style={styles.vistaDesplazable}
      contentContainerStyle={styles.contenedor}
      showsVerticalScrollIndicator={false}
    >
      <ProgressBar pasoActual={1} pasosTotales={3} />

      <View style={styles.seccionEncabezado}>
        <Text style={styles.titulo}>
          Bienvenido a SAMM
        </Text>
        <Text style={styles.subtitulo}>
          ¿Quién eres?
        </Text>
        <Text style={styles.descripcion}>
          Selecciona tu perfil para configurar la aplicación correctamente
        </Text>
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
          alPresionar={() => setRolSeleccionado('senior')}
          estaSeleccionado={rolSeleccionado === 'senior'}
        />
      </View>

      <View style={styles.contenedorBoton}>
        <PrimaryButton
          titulo="Continuar"
          alPresionar={manejarContinuar}
          deshabilitado={!rolSeleccionado}
        />
      </View>
    </ScrollView>
  );
};
