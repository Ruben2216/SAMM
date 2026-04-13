import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

// ¡NUEVO! Importamos useRoute para poder leer el paquete que nos manda la tarjeta
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { citasStyles, themeColors } from './styles';

// ¡NUEVO! Importamos la función de actualizar
import { agendarCita, actualizarCita } from '../../../../services/citasService';
import { useAuthStore } from '../../../auth/authStore'; 

// Actualizamos el tipo para aceptar parámetros
type RootStackParamList = {
  CitasFamiliar: undefined;
  HistorialCitas: undefined;
  AgendarCita: { citaToEdit?: any } | undefined; 
};

const ESPECIALIDADES = [
  'Medicina General', 'Cardiología', 'Geriatría', 
  'Odontología', 'Oftalmología', 'Traumatología', 'Otro'
];

// --- ÁTOMOS DE UI ---
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
      />
      {icon && <MaterialCommunityIcons name={icon} size={24} color={themeColors.textDark} style={formStyles.inputIcon} />}
    </View>
  </View>
);

const CustomPicker: React.FC<{ label: string; value: string; onSelect: (val: string) => void }> = ({ label, value, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={formStyles.inputContainer}>
      <Text style={formStyles.label}>{label}</Text>
      <TouchableOpacity style={formStyles.inputWrapper} onPress={() => setModalVisible(true)}>
        <Text style={[formStyles.input, { color: value ? themeColors.textDark : themeColors.textMuted }]}>
          {value || 'Selecciona una especialidad'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={24} color={themeColors.textDark} style={formStyles.inputIcon} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={formStyles.modalOverlay}>
          <View style={formStyles.modalContent}>
            <Text style={formStyles.modalTitle}>{label}</Text>
            {ESPECIALIDADES.map((opt) => (
              <TouchableOpacity key={opt} style={formStyles.modalOption} onPress={() => { onSelect(opt); setModalVisible(false); }}>
                <Text style={formStyles.modalOptionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={formStyles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={formStyles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const DateSelector: React.FC<{ label: string; value: Date; mode: 'date' | 'time'; icon: string; onPress: () => void }> = ({ label, value, mode, icon, onPress }) => {
  const displayText = mode === 'date' 
    ? value.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : value.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={formStyles.inputContainer}>
      <Text style={formStyles.label}>{label}</Text>
      <TouchableOpacity style={formStyles.inputWrapper} onPress={onPress}>
        <Text style={formStyles.input}>{displayText}</Text>
        <MaterialCommunityIcons name={icon} size={24} color={themeColors.textDark} style={formStyles.inputIcon} />
      </TouchableOpacity>
    </View>
  );
};

const PrimaryActionButton: React.FC<{ title: string; icon: string; onPress: () => void }> = ({ title, icon, onPress }) => (
  <TouchableOpacity style={formStyles.primaryButton} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={24} color={themeColors.textDark} style={formStyles.primaryButtonIcon} />
    <Text style={formStyles.primaryButtonText}>{title}</Text>
  </TouchableOpacity>
);

// --- COMPONENTE PRINCIPAL ---
export default function AgendarCitaScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<any>(); // Para leer los parámetros
  const { usuario } = useAuthStore(); 

  // Detectamos si nos enviaron una cita para editar
  const citaToEdit = route.params?.citaToEdit;
  const isEditing = !!citaToEdit;

  // Si estamos editando, rellenamos el estado con la información que ya existía
  const [formData, setFormData] = useState({ 
    doctor: citaToEdit?.doctor_nombre || '', 
    especialidad: citaToEdit?.especialidad || '',
    lugar: citaToEdit?.ubicacion || '',
    notas: citaToEdit?.notas || '',
    fecha: citaToEdit ? new Date(citaToEdit.fecha_hora) : new Date(), 
    hora: citaToEdit ? new Date(citaToEdit.fecha_hora) : new Date(), 
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleGuardarCita = async () => {
    if (!formData.doctor || !formData.especialidad) {
      Alert.alert("Atención", "Por favor ingresa el nombre del doctor y su especialidad.");
      return;
    }

    const fechaEnvio = new Date(formData.fecha);
    fechaEnvio.setHours(formData.hora.getHours(), formData.hora.getMinutes(), 0, 0);

    const citaData = {
      id_usuario: 2, 
      id_usuario_creador: usuario?.Id_Usuario || 1, 
      doctor_nombre: formData.doctor,
      especialidad: formData.especialidad,
      fecha_hora: fechaEnvio.toISOString(), 
      ubicacion: formData.lugar,
      notas: formData.notas,
      estado: "programada"
    };

    try {
      if (isEditing) {
        // MODO EDICIÓN
        await actualizarCita(citaToEdit.id, citaData);
        Alert.alert("¡Actualizada!", "La cita médica se modificó correctamente.");
      } else {
        // MODO CREACIÓN
        await agendarCita(citaData);
        Alert.alert("¡Cita Guardada!", "La cita médica se agendó correctamente.");
      }
      
      // Regresamos a la pantalla anterior (que automáticamente recargará la lista gracias a tu useFocusEffect)
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", `No se pudo ${isEditing ? 'actualizar' : 'guardar'} la cita.`);
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={citasStyles.container}>
      <View style={citasStyles.header}>
        <TouchableOpacity style={citasStyles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={themeColors.textDark} />
        </TouchableOpacity>
        {/* Cambiamos el título dinámicamente */}
        <Text style={citasStyles.headerTitle}>{isEditing ? 'Editar cita' : 'Agendar cita'}</Text>
      </View>

      <View style={{ flex: 1 }}> 
        <ScrollView contentContainerStyle={[citasStyles.listContainer, { paddingBottom: 180 }]} showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 24 }}>
            <CustomInput 
              label="Nombre del doctor" 
              placeholder="Ej: Dr. Pérez"
              value={formData.doctor} 
              onChangeText={(t) => setFormData({...formData, doctor: t})} 
            />
            
            <CustomPicker 
              label="Especialidad" 
              value={formData.especialidad} 
              onSelect={(val) => setFormData({...formData, especialidad: val})} 
            />

            <DateSelector 
              label="Fecha de la cita" 
              value={formData.fecha} 
              mode="date" 
              icon="calendar-month" 
              onPress={() => setShowDatePicker(true)} 
            />

            <DateSelector 
              label="Hora de la cita" 
              value={formData.hora} 
              mode="time" 
              icon="clock-time-four-outline" 
              onPress={() => setShowTimePicker(true)} 
            />

            <CustomInput 
              label="Lugar o Consultorio" 
              placeholder="Dirección o centro médico"
              multiline 
              value={formData.lugar} 
              onChangeText={(t) => setFormData({...formData, lugar: t})} 
            />

            <CustomInput 
              label="Notas o indicaciones (Opcional)" 
              placeholder="Ej: Llegar 15 min antes..."
              multiline 
              value={formData.notas} 
              onChangeText={(t) => setFormData({...formData, notas: t})} 
            />
          </View>
        </ScrollView>

        <View style={formStyles.buttonContainer}>
          {/* Cambiamos el texto y el icono dinámicamente */}
          <PrimaryActionButton 
            title={isEditing ? "Actualizar cita" : "Guardar cita"} 
            icon={isEditing ? "update" : "check"} 
            onPress={handleGuardarCita} 
          />
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={formData.fecha}
          mode="date"
          display="default"
          accentColor={themeColors.primary}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) setFormData({ ...formData, fecha: selectedDate });
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={formData.hora}
          mode="time"
          display="default"
          accentColor={themeColors.primary}
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) setFormData({ ...formData, hora: selectedTime });
          }}
        />
      )}
    </SafeAreaView>
  );
}

const formStyles = StyleSheet.create({
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 18, fontWeight: 'bold', color: themeColors.textDark, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: themeColors.cardBg, borderRadius: 24, paddingHorizontal: 16, height: 60 },
  inputWrapperMultiline: { height: 140, alignItems: 'flex-start', paddingTop: 16 },
  input: { flex: 1, fontSize: 16, color: themeColors.textDark },
  inputMultiline: { textAlignVertical: 'top' },
  inputIcon: { marginLeft: 12 },
  buttonContainer: { position: 'absolute', bottom: 40, left: 16, right: 16, alignItems: 'center' },
  primaryButton: { backgroundColor: themeColors.primary, borderRadius: 30, height: 60, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  primaryButtonIcon: { marginRight: 12 },
  primaryButtonText: { fontSize: 18, fontWeight: 'bold', color: themeColors.textDark },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: themeColors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: themeColors.textDark, marginBottom: 16, textAlign: 'center' },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  modalOptionText: { fontSize: 18, color: themeColors.textDark, textAlign: 'center' },
  modalCloseBtn: { marginTop: 24, paddingVertical: 16, backgroundColor: '#F0F0F0', borderRadius: 24 },
  modalCloseText: { fontSize: 18, fontWeight: 'bold', color: '#FF3B30', textAlign: 'center' },
});