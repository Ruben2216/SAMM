import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

export const AgregarContactos = () => {
  const navigation = useNavigation<any>();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [telefonoAlternativo, setTelefonoAlternativo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [notasContacto, setNotasContacto] = useState('');

  const handleGuardar = () => {
    if (!nombre.trim() || !apellido.trim() || !telefono.trim() || telefono.length < 10) {
      Alert.alert('Faltan datos', 'Revisa los campos obligatorios.');
      return;
    }
    Alert.alert('¡Éxito!', `El contacto ${nombre} ${apellido} ha sido guardado.`, [
      { text: 'Entendido', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Nuevo Contacto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContenido} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Text style={styles.descripcion}>Añade a un familiar, médico o persona de confianza a tu red de emergencias.</Text>
        
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Roberto" placeholderTextColor="#94A3B8" />

        <Text style={styles.label}>Apellido</Text>
        <TextInput style={styles.input} value={apellido} onChangeText={setApellido} placeholder="Ej: Pérez" placeholderTextColor="#94A3B8" />

        <Text style={styles.label}>Teléfono principal</Text>
        <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Móvil o casa" placeholderTextColor="#94A3B8" keyboardType="phone-pad" maxLength={15} />

        <Text style={styles.label}>Teléfono alternativo <Text style={styles.labelOpcional}>(Opcional)</Text></Text>
        <TextInput style={styles.input} value={telefonoAlternativo} onChangeText={setTelefonoAlternativo} placeholder="Otro número de contacto" placeholderTextColor="#94A3B8" keyboardType="phone-pad" maxLength={15} />

        <Text style={styles.label}>Dirección <Text style={styles.labelOpcional}>(Opcional)</Text></Text>
        <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} placeholder="Ciudad, calle, número..." placeholderTextColor="#94A3B8" maxLength={80} />

        <Text style={styles.label}>Notas <Text style={styles.labelOpcional}>(Opcional)</Text></Text>
        <TextInput style={[styles.input, styles.inputArea]} value={notasContacto} onChangeText={setNotasContacto} placeholder="¿Es alérgico? ¿Es médico?" placeholderTextColor="#94A3B8" multiline numberOfLines={4} maxLength={140} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar} activeOpacity={0.8}>
          <Ionicons name="save-outline" size={20} color="#0F172A" />
          <Text style={styles.textoBoton}>Guardar contacto</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};