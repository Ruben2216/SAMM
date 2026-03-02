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
  title,
  description,
  iconName,
  iconSource,
  onPress,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.iconCircle}>
        {iconSource ? (
          <Image source={iconSource} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <Icon name={iconName || 'help'} size={32} color="#FFFFFF" />
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};
