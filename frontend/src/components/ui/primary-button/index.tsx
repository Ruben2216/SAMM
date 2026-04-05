import React from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  nombreIcono,
  tamanoIcono = 24,
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
        <View style={styles.contenido}>
          {nombreIcono ? (
            <Icon
              name={nombreIcono}
              size={tamanoIcono}
              color="#000"
              style={styles.icono}
            />
          ) : null}
          <Text
            style={[
              styles.textoBoton,
              estaDeshabilitado && styles.textoBotonDeshabilitado,
            ]}
          >
            {titulo}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
