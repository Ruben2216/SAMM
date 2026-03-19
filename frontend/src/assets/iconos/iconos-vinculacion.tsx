import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const IconoCompartir: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 36,
  color = '#0f172a',
}) => <Icon name="share-variant" size={tamaño} color={color} />;

export const IconoVincular: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 36,
  color = '#0f172a',
}) => <Icon name="link" size={tamaño} color={color} />;

export const IconoFlecha: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 23,
  color = '#14EC5C',
}) => <Icon name="arrow-up" size={tamaño} color={color} />;

