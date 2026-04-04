// src/features/family/screens/Citas/AgendarCita.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { citasStyles, themeColors } from './styles';

// Tipado estricto para la navegación
type RootStackParamList = {
  CitasFamiliar: undefined;
  HistorialCitas: undefined;
  AgendarCita: undefined;
};

// --- ÁTOMOS DE UI ---
// Componente para los campos del formulario
interface CustomInputProps {
  label: string;
  placeholder?: string;
  icon?: string;
  multiline?: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, placeholder, icon, multiline, value, onChangeText }) => (
  <View style={formStyles.inputContainer}>
    <Text style={formStyles.label}>{label}</Text>
    <View style={[formStyles.inputWrapper, multiline && formStyles.inputWrapperMultiline]}>
      <TextInput
        style={[formStyles.input, multiline && formStyles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        accessibilityLabel={`Campo de texto para ${label}`}
      />
      {icon && (
        <MaterialCommunityIcons name={icon} size={24} color={themeColors.textDark} style={formStyles.inputIcon} />
      )}
    </View>
  </View>
);

// Componente para el botón de acción principal (como el Pill shape verde)
const PrimaryActionButton: React.FC<{ title: string; icon: string; onPress: () => void }> = ({ title, icon, onPress }) => (
  <TouchableOpacity 
    style={formStyles.primaryButton} 
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <MaterialCommunityIcons name={icon} size={24} color={themeColors.textDark} style={formStyles.primaryButtonIcon} />
    <Text style={formStyles.primaryButtonText}>{title}</Text>
  </TouchableOpacity>
);

// --- COMPONENTE PRINCIPAL ---
export default function AgendarCitaScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Estado para el formulario
  const [formData, setFormData] = useState({ 
    doctor: '', 
    fecha: '', 
    hora: '', 
    lugar: '' 
  });

  return (
    <SafeAreaView style={citasStyles.container}>
      
      {/* HEADER CON FLECHA DE REGRESO */}
      <View style={citasStyles.header}>
        <TouchableOpacity 
          style={citasStyles.backButton} 
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Regresar a la pantalla anterior"
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.textDark} />
        </TouchableOpacity>
        <Text style={citasStyles.headerTitle}>Agendar cita</Text>
      </View>

      {/* CONTENEDOR PRINCIPAL CON FLEX:1 */}
      <View style={{ flex: 1 }}> 
        <ScrollView 
          // El padding bottom debe ser grande para que el último input no lo tape el botón/barra
          contentContainerStyle={[citasStyles.listContainer, { paddingBottom: 180 }]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 24 }}>
            <CustomInput 
              label="Nombre del doctor" 
              placeholder="Ej: Dr. Pérez"
              value={formData.doctor} 
              onChangeText={(t) => setFormData({...formData, doctor: t})} 
            />
            <CustomInput 
              label="Fecha" 
              placeholder="DD/MM/AAAA"
              icon="calendar-month" 
              value={formData.fecha} 
              onChangeText={(t) => setFormData({...formData, fecha: t})} 
            />
            <CustomInput 
              label="Hora" 
              placeholder="00:00 AM"
              icon="clock-time-four-outline" 
              value={formData.hora} 
              onChangeText={(t) => setFormData({...formData, hora: t})} 
            />
            <CustomInput 
              label="Lugar" 
              placeholder="Dirección o centro médico"
              multiline 
              value={formData.lugar} 
              onChangeText={(t) => setFormData({...formData, lugar: t})} 
            />
          </View>
        </ScrollView>

        {/* BOTÓN "GUARDAR CITA" - CENTRADO EN LA PARTE INFERIOR */}
        {/* Usamos absolute positioning para flotar sobre el scroll y barra inferior */}
        <View style={formStyles.buttonContainer}>
          <PrimaryActionButton 
            title="Guardar cita" 
            icon="check" 
            onPress={() => {
              // Aquí se conectará con el store de Zustand después
              navigation.goBack();
            }} 
          />
        </View>
      </View>

      {/* BARRA INFERIOR DE TABS - FIJA AL FONDO */}
      <View style={citasStyles.bottomTabBar}>
        <TouchableOpacity 
          style={citasStyles.tabItem} 
          onPress={() => navigation.navigate('CitasFamiliar')}
          accessibilityRole="tab"
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={28} color={themeColors.textMuted} />
          <Text style={[citasStyles.tabText, { color: themeColors.textMuted }]}>Próximas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={citasStyles.tabItem} 
          onPress={() => navigation.navigate('HistorialCitas')}
          accessibilityRole="tab"
        >
          <MaterialCommunityIcons name="history" size={28} color={themeColors.textMuted} />
          <Text style={[citasStyles.tabText, { color: themeColors.textMuted }]}>Historial</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// Estilos específicos para el formulario de agendar (evitando estilos en línea salvo para valores dinámicos)
const formStyles = StyleSheet.create({
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 18, fontWeight: 'bold', color: themeColors.textDark, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: themeColors.cardBg, borderRadius: 24, paddingHorizontal: 16, height: 60 },
  inputWrapperMultiline: { height: 140, alignItems: 'flex-start', paddingTop: 16 },
  input: { flex: 1, fontSize: 16, color: themeColors.textDark },
  inputMultiline: { textAlignVertical: 'top' },
  inputIcon: { marginLeft: 12 },
  buttonContainer: { position: 'absolute', bottom: 100, left: 16, right: 16, alignItems: 'center' },
  primaryButton: { backgroundColor: themeColors.primary, borderRadius: 30, height: 60, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  primaryButtonIcon: { marginRight: 12 },
  primaryButtonText: { fontSize: 18, fontWeight: 'bold', color: themeColors.textDark },
});