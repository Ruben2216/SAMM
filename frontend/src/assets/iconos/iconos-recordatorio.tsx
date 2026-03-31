import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const IconoMedicina: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 16,
  color = '#14EC5C',
}) => <Icon name="pill" size={tamaño} color={color} />;

export const IconoInyeccion: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 16,
  color = '#3B82F6',
}) => <Icon name="needle" size={tamaño} color={color} />;

export const IconoVerificado: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 14,
  color = '#13EC5B',
}) => <Icon name="check-circle" size={tamaño} color={color} />;

export const IconoUbicacion: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 12,
  color = '#64748B',
}) => <Icon name="map-marker" size={tamaño} color={color} />;

export const IconoFlechaDerecha: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 16,
  color = '#CBD5E1',
}) => <Icon name="chevron-right" size={tamaño} color={color} />;
