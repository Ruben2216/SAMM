import React from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { styles } from './styles';
import { PrimaryButtonProps } from './types';

/**
 * Botón primario de SAMM con estilo verde neón
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.buttonFullWidth,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color="#000" size="small" />
      ) : (
        <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
