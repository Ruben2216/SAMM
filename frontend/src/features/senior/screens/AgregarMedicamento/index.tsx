import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';
import { SuccessModal } from '../../../../components/ui/success-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const AgregarMedicamento = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const insets = useSafeAreaInsets();

    const medEdit = route.params?.medicamentoAEditar;
    const esModoEditar = !!medEdit;

    const [nombre, setNombre] = useState(esModoEditar ? medEdit.nombre : '');
    const [dosis, setDosis] = useState(esModoEditar ? medEdit.rawDosis : '');
    const [frecuencia, setFrecuencia] = useState(esModoEditar ? medEdit.rawFrecuencia : 'una');
    const [notas, setNotas] = useState(esModoEditar ? (medEdit.notas || '') : '');

    const [guardando, setGuardando] = useState(false);
    const [modalExito, setModalExito] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');

    const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

    const guardarNecesario = async () => {
        // "Según sea necesario": guardamos sin horarios directamente (no programa alarmas).
        if (!nombre.trim() || !dosis.trim()) {
            Alert.alert('Datos incompletos', 'Ingresa nombre y dosis del medicamento.');
            return;
        }
        setGuardando(true);
        try {
            const payload = {
                Id_Usuario: usuario?.Id_Usuario || 1,
                Nombre: nombre,
                Dosis: dosis,
                Frecuencia: 'necesario',
                Notas: notas || '',
                horarios: [], // sin horarios fijos
            };
            const url = esModoEditar
                ? `${apiUrl}/medicamentos/${medEdit.id_medicamento}`
                : `${apiUrl}/medicamentos/`;
            const metodo = esModoEditar ? 'PUT' : 'POST';

            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (respuesta.ok) {
                setMensajeExito(esModoEditar ? 'Medicamento actualizado con éxito' : 'Medicamento guardado con éxito');
                setModalExito(true);
            } else {
                const data = await respuesta.json().catch(() => ({}));
                Alert.alert('Error del Servidor', data.detail || 'No se pudo procesar la solicitud.');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            Alert.alert('Error de Red', 'Revisa que el servicio de medicamentos esté encendido (puerto 8001).');
        } finally {
            setGuardando(false);
        }
    };

    const manejarGuardar = () => {
        if (!nombre.trim() || !dosis.trim()) {
            Alert.alert('Datos incompletos', 'Ingresa nombre y dosis del medicamento.');
            return;
        }

        if (frecuencia === 'necesario') {
            guardarNecesario();
            return;
        }

        // Pasamos a la pantalla de horas. Se pueden pasar horarios ya existentes (edición).
        navigation.navigate('EstablecerHora', {
            medicamento: {
                id_medicamento: esModoEditar ? medEdit.id_medicamento : null,
                horariosExistentes: esModoEditar ? (medEdit.rawHorarios || []) : [],
                diasSemana: esModoEditar ? (medEdit.diasSemana || '1,2,3,4,5,6,7') : '1,2,3,4,5,6,7',
                nombre,
                dosis,
                frecuencia,
                notas,
            },
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.contenedor}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
                        <Ionicons name="arrow-back" size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.tituloHeader}>{esModoEditar ? 'Editar medicamento' : 'Añadir medicamento'}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    contentContainerStyle={[styles.scrollContenido, { paddingBottom: Platform.OS === 'android' ? 200 : 100 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <Text style={styles.tituloSecundario}>{esModoEditar ? 'Modificar receta' : 'Nueva receta'}</Text>
                    <Text style={styles.descripcion}>
                        Ingrese los datos exactamente como aparecen en la etiqueta del frasco de pastillas
                    </Text>

                    <Text style={styles.label}>Nombre del medicamento</Text>
                    <TextInput style={styles.input} placeholder="Ej: Medicina1..." placeholderTextColor="#94A3B8" value={nombre} onChangeText={setNombre} />

                    <Text style={styles.label}>Dosis</Text>
                    <TextInput style={styles.input} placeholder="Ej: 500 mg..." placeholderTextColor="#94A3B8" value={dosis} onChangeText={setDosis} />

                    <Text style={styles.label}>¿Con qué frecuencia lo tomas?</Text>
                    <TouchableOpacity style={[styles.radioItem, frecuencia === 'una' && styles.radioItemActivoUna]} onPress={() => setFrecuencia('una')}>
                        <View>
                            <Text style={[styles.radioTitulo, frecuencia === 'una' && styles.textoActivo]}>Una vez al día</Text>
                            <Text style={styles.radioSub}>Generalmente por la mañana</Text>
                        </View>
                        <View style={[styles.circuloExterior, frecuencia === 'una' && { borderColor: '#00E676', backgroundColor: '#D1FAE5' }]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.radioItem, frecuencia === 'dos' && styles.radioItemActivoDos]} onPress={() => setFrecuencia('dos')}>
                        <View>
                            <Text style={[styles.radioTitulo, frecuencia === 'dos' && styles.textoActivo]}>Dos veces al día</Text>
                            <Text style={styles.radioSub}>Mañana y tarde (dos horas)</Text>
                        </View>
                        <View style={[styles.circuloExterior, frecuencia === 'dos' && { borderColor: '#F59E0B', backgroundColor: '#FDE68A' }]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.radioItem, frecuencia === 'necesario' && styles.radioItemActivoNecesario]} onPress={() => setFrecuencia('necesario')}>
                        <View>
                            <Text style={[styles.radioTitulo, frecuencia === 'necesario' && styles.textoActivo]}>Según sea necesario</Text>
                            <Text style={styles.radioSub}>Sin recordatorio — se registra al tocar "Tomar ahora"</Text>
                        </View>
                        <View style={[styles.circuloExterior, frecuencia === 'necesario' && { borderColor: '#6366F1', backgroundColor: '#E0E7FF' }]} />
                    </TouchableOpacity>

                    <Text style={[styles.label, { marginTop: 10 }]}>Notas adicionales <Text style={styles.labelOpcional}>(Opcional)</Text></Text>
                    <TextInput
                        style={[styles.input, styles.inputArea]}
                        placeholder="Instrucciones..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={4}
                        value={notas}
                        onChangeText={setNotas}
                    />
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TouchableOpacity
                        style={[styles.botonGuardar, guardando && { opacity: 0.7 }]}
                        onPress={manejarGuardar}
                        activeOpacity={0.8}
                        disabled={guardando}
                    >
                        {guardando ? (
                            <ActivityIndicator size="small" color="#0F172A" />
                        ) : (
                            <Ionicons name={frecuencia === 'necesario' ? 'save-outline' : 'arrow-forward'} size={20} color="#0F172A" />
                        )}
                        <Text style={styles.textoBoton}>
                            {guardando
                                ? 'Procesando...'
                                : frecuencia === 'necesario'
                                    ? (esModoEditar ? 'Actualizar medicamento' : 'Guardar medicamento')
                                    : 'Continuar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <SuccessModal
                esVisible={modalExito}
                mensaje={mensajeExito}
                alTerminar={() => {
                    setModalExito(false);
                    navigation.navigate('Inicio');
                }}
            />
        </KeyboardAvoidingView>
    );
};
