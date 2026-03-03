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
  pasoActual,
  pasosTotales,
  etiquetaPersonalizada,
}) => {
  const porcentajeProgreso = (pasoActual / pasosTotales) * 100;
  const etiqueta = etiquetaPersonalizada || `Paso ${pasoActual} de ${pasosTotales}`;

  return (
    <View
      style={styles.contenedor}
      accessibilityLabel={`Progreso: ${etiqueta}`}
      accessibilityRole="progressbar"
    >
      <Text style={styles.etiquetaPaso}>{etiqueta}</Text>
      <View style={styles.pistaProgreso}>
        <View
          style={[
            styles.rellenoProgreso,
            { width: `${porcentajeProgreso}%` },
          ]}
        />
      </View>
    </View>
  );
};
