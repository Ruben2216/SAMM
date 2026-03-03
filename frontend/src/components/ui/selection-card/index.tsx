import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './styles';
import { SelectionCardProps } from './types';

/**
 * Componente de tarjeta de selección con icono circular
 * Usado para opciones de onboarding y selección de perfil
 * Soporta tanto iconos de MaterialCommunityIcons como imágenes locales
 */
export const SelectionCard: React.FC<SelectionCardProps> = ({
  titulo,
  descripcion,
  nombreIcono,
  fuenteIcono,
  alPresionar,
  estaSeleccionado = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.tarjeta, estaSeleccionado && styles.tarjetaSeleccionada]}
      onPress={alPresionar}
      activeOpacity={0.7}
      accessibilityLabel={`${titulo}. ${descripcion}`}
      accessibilityRole="button"
      accessibilityState={{ selected: estaSeleccionado }}
    >
      <View style={styles.circuloIcono}>
        {fuenteIcono ? (
          <Image source={fuenteIcono} style={styles.imagenIcono} resizeMode="contain" />
        ) : (
          <Icon name={nombreIcono || 'help'} size={32} color="#FFFFFF" />
        )}
      </View>
      
      <View style={styles.contenidoTarjeta}>
        <Text style={styles.tituloTarjeta}>{titulo}</Text>
        <Text style={styles.descripcionTarjeta}>{descripcion}</Text>
      </View>
    </TouchableOpacity>
  );
};
