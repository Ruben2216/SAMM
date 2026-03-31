import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const IconoAgregar: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 16,
  color = '#FFFFFF',
}) => <Icon name="plus" size={tamaño} color={color} />;

export const IconoEditar: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 22,
  color = '#64748B',
}) => <Icon name="square-edit-outline" size={tamaño} color={color} />;

export const IconoCalendario: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 16,
  color = '#FFFFFF',
}) => <Icon name="calendar-month-outline" size={tamaño} color={color} />;

export const IconoInfoMedica: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 16,
  color = '#1E293B',
}) => <Icon name="information-outline" size={tamaño} color={color} />;

export const IconoTelefono: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 18,
  color = '#FFFFFF',
}) => <Icon name="phone" size={tamaño} color={color} />;

export const IconoBateria: React.FC<{ tamaño?: number; color?: string }> = ({
  tamaño = 16,
  color = '#14EC5C',
}) => <Icon name="battery" size={tamaño} color={color} />;
