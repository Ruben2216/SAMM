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
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // TODO: Navegar a la siguiente pantalla según el rol
    console.log('Rol seleccionado:', selectedRole);
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Barra de Progreso */}
      <ProgressBar currentStep={1} totalSteps={3} />

      {/* Encabezados */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>
          Bienvenido a SAMM
        </Text>
        <Text style={styles.subtitle}>
          ¿Quién eres?
        </Text>
        <Text style={styles.description}>
          Selecciona tu perfil para configurar la aplicación correctamente
        </Text>
      </View>

      {/* Tarjetas de Selección */}
      <View style={styles.cardsContainer}>
        <SelectionCard
          title="Soy Familiar"
          description="Administro cuenta y medicamento"
          iconSource={require('../../../../../assets/icons/gente.png')}
          onPress={() => setSelectedRole('familiar')}
          isSelected={selectedRole === 'familiar'}
        />

        <SelectionCard
          title="Soy Adulto Mayor"
          description="Quiero ver mis recordatorio, agendas, etc."
          iconSource={require('../../../../../assets/icons/senior.png')}
          onPress={() => setSelectedRole('senior')}
          isSelected={selectedRole === 'senior'}
        />
      </View>

      {/* Botón de Continuar */}
      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Continuar"
          onPress={handleContinue}
          disabled={!selectedRole}
        />
      </View>
    </ScrollView>
  );
};
