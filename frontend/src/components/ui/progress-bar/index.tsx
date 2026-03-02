import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from './styles';
import { ProgressBarProps } from './types';

/**
 * Componente de barra de progreso SAMM
 * Muestra el paso actual del onboarding/proceso
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  customLabel,
}) => {
  // Calcular porcentaje de progreso
  const progressPercentage = (currentStep / totalSteps) * 100;
  const label = customLabel || `Paso ${currentStep} de ${totalSteps}`;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Progreso: ${label}`}
      accessibilityRole="progressbar"
    >
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressPercentage}%` },
          ]}
        />
      </View>
    </View>
  );
};
