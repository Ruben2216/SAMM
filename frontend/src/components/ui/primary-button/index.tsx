import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from './styles';
import { PrimaryButtonProps } from './types';

/**
 * Botón primario de SAMM con estilo verde neón
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  titulo,
  alPresionar,
  deshabilitado = false,
  cargando = false,
  anchoCompleto = true,
}) => {
  const estaDeshabilitado = deshabilitado || cargando;

  return (
    <TouchableOpacity
      style={[
        styles.boton,
        anchoCompleto && styles.botonAnchoCompleto,
        estaDeshabilitado && styles.botonDeshabilitado,
      ]}
      onPress={alPresionar}
      disabled={estaDeshabilitado}
      activeOpacity={0.8}
      accessibilityLabel={titulo}
      accessibilityRole="button"
      accessibilityState={{ disabled: estaDeshabilitado }}
    >
      {cargando ? (
        <ActivityIndicator color="#000" size="small" />
      ) : (
        <Text style={[styles.textoBoton, estaDeshabilitado && styles.textoBotonDeshabilitado]}>
          {titulo}
        </Text>
      )}
    </TouchableOpacity>
  );
};
