import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from './Astyles';

export const AgregarContactos = () => {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const styles = React.useMemo(() => createStyles(width, height), [width, height]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoAlternativo, setTelefonoAlternativo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [notasContacto, setNotasContacto] = useState('');

  const handleGuardar = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre');
      return;
    }
    if (!apellido.trim()) {
      Alert.alert('Error', 'Por favor ingresa el apellido');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Error', 'Por favor ingresa el teléfono');
      return;
    }
    if (telefono.length < 10) {
      Alert.alert('Error', 'Por favor ingresa un teléfono válido (mínimo 10 dígitos)');
      return;
    }
    if (telefonoAlternativo.trim() && telefonoAlternativo.trim().length < 10) {
      Alert.alert('Error', 'El teléfono alternativo debe tener al menos 10 dígitos');
      return;
    }

    Alert.alert(
      'Éxito',
      `Contacto de emergencia guardado:\n${nombre} ${apellido}\nTel: ${telefono}\nTel alternativo: ${telefonoAlternativo || 'No aplica'}\nDirección: ${direccion || 'No aplica'}\nNotas: ${notasContacto || 'Sin notas'}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setNombre('');
            setApellido('');
            setTelefono('');
            setTelefonoAlternativo('');
            setDireccion('');
            setNotasContacto('');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.encabezado}>
              <TouchableOpacity
                accessibilityLabel="Volver a emergencia"
                accessibilityRole="button"
                onPress={() => navigation.goBack()}
                style={styles.botonVolver}
              >
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.title}>Agregar contacto de{`\n`}emergencia</Text>
              <View style={styles.espaciadorEncabezado} />
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  accessibilityLabel="Campo nombre de contacto"
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder=""
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  accessibilityLabel="Campo apellido de contacto"
                  style={styles.input}
                  value={apellido}
                  onChangeText={setApellido}
                  placeholder=""
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  accessibilityLabel="Campo teléfono de contacto"
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder=""
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono alternativo</Text>
                <TextInput
                  accessibilityLabel="Campo teléfono alternativo de contacto"
                  style={styles.input}
                  value={telefonoAlternativo}
                  onChangeText={setTelefonoAlternativo}
                  placeholder=""
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dirección (opcional)</Text>
                <TextInput
                  accessibilityLabel="Campo dirección de contacto"
                  style={styles.input}
                  value={direccion}
                  onChangeText={setDireccion}
                  placeholder=""
                  maxLength={80}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas</Text>
                <TextInput
                  accessibilityLabel="Campo notas de contacto"
                  style={[styles.input, styles.inputMultilinea]}
                  value={notasContacto}
                  onChangeText={setNotasContacto}
                  placeholder=""
                  multiline
                  numberOfLines={3}
                  maxLength={140}
                />
              </View>

              <TouchableOpacity
                accessibilityLabel="Guardar contacto de emergencia"
                accessibilityRole="button"
                style={styles.guardarButton}
                onPress={handleGuardar}
              >
                <Text style={styles.guardarButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};