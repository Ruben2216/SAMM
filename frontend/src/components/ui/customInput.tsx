
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const themeColors = {
  text: '#1E293B',
  inputBg: '#E2E8F0',
};

interface CustomInputProps extends TextInputProps {
  label: string;
  iconName?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({ label, iconName, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          accessible={true}
          accessibilityLabel={`Campo de entrada para ${label}`}
          {...props}
        />
        {iconName && (
          <MaterialCommunityIcons 
            name={iconName} 
            size={24} 
            color={themeColors.text} 
            style={styles.icon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.inputBg,
    borderRadius: 24,
    paddingHorizontal: 20,
    minHeight: 55,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: themeColors.text,
  },
  icon: {
    marginLeft: 10,
  },
});