import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './boton-codigo.styles';
import { BotonCodigoProps } from './types';

export const BotonCodigo: React.FC<BotonCodigoProps> = ({
  valor,
  indice,
  onPresionar,
  esActivo = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.contenedorBoton,
        esActivo && styles.contenedorBoton__activo,
      ]}
      onPress={() => onPresionar(indice)}
      activeOpacity={0.7}
      accessibilityLabel={`Botón de código ${indice + 1}, valor ${valor}`}
      accessibilityRole="button"
    >
      <Text style={styles.textoValor}>{valor}</Text>
    </TouchableOpacity>
  );
};
