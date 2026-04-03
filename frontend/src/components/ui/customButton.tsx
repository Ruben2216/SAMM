
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

const themeColors = {
  primary: '#14EC5C',
  textDark: '#1E293B',
};

interface CustomButtonProps extends TouchableOpacityProps {
  label: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ label, ...props }) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: themeColors.primary,
    borderRadius: 30, // Forma de píldora
    minHeight: 55,    // Cumpliendo con la accesibilidad de > 44px
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.textDark, // Texto oscuro para contrastar con el verde
  },
});