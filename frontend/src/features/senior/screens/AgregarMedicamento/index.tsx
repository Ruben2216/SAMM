import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

export const AgregarMedicamento = () => {
    const navigation = useNavigation<any>();
    const [nombre, setNombre] = useState('');
    const [dosis, setDosis] = useState('');
    const [frecuencia, setFrecuencia] = useState('una'); 
    const [notas, setNotas] = useState('');

    const manejarGuardar = () => {
        // Pasamos los datos a la siguiente pantalla para simular el flujo
        navigation.navigate('EstablecerHora', {
            medicamento: { nombre, dosis, frecuencia, notas }
        });
    };

    return (
        <View style={styles.contenedor}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.tituloHeader}>Añadir medicamento</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContenido} showsVerticalScrollIndicator={false}>
                <Text style={styles.tituloSecundario}>Nueva receta</Text>
                <Text style={styles.descripcion}>
                    Ingrese los datos exactamente como aparecen en la etiqueta del frasco de pastillas
                </Text>

                {/* Formulario */}
                <Text style={styles.label}>Nombre del medicamento</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Medicina1, Medicina2..."
                    placeholderTextColor="#94A3B8"
                    value={nombre}
                    onChangeText={setNombre}
                />

                <Text style={styles.label}>Dosis</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: 500 mg, 1 tableta..."
                    placeholderTextColor="#94A3B8"
                    value={dosis}
                    onChangeText={setDosis}
                />

                {/* Frecuencia */}
                <Text style={styles.label}>¿Con qué frecuencia lo tomas?</Text>

                <TouchableOpacity
                    style={[styles.radioItem, frecuencia === 'una' && styles.radioItemActivoUna]}
                    onPress={() => setFrecuencia('una')}
                >
                    <View>
                        <Text style={[styles.radioTitulo, frecuencia === 'una' && styles.textoActivo]}>Una vez al día</Text>
                        <Text style={styles.radioSub}>Generalmente por la mañana</Text>
                    </View>
                    <View style={[styles.circuloExterior, frecuencia === 'una' && { borderColor: '#00E676', backgroundColor: '#D1FAE5' }]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.radioItem, frecuencia === 'dos' && styles.radioItemActivoDos]}
                    onPress={() => setFrecuencia('dos')}
                >
                    <View>
                        <Text style={[styles.radioTitulo, frecuencia === 'dos' && styles.textoActivo]}>Dos veces al día</Text>
                        <Text style={styles.radioSub}>Mañana y tarde</Text>
                    </View>
                    <View style={styles.circuloExterior} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.radioItem, frecuencia === 'necesario' && styles.radioItemActivoNecesario]}
                    onPress={() => setFrecuencia('necesario')}
                >
                    <View>
                        <Text style={[styles.radioTitulo, frecuencia === 'necesario' && styles.textoActivo]}>Según sea necesario</Text>
                        <Text style={styles.radioSub}>Para el dolor o los síntomas</Text>
                    </View>
                    <View style={styles.circuloExterior} />
                </TouchableOpacity>

                {/* Notas */}
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

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.botonGuardar} onPress={manejarGuardar} activeOpacity={0.8}>
                    <Ionicons name="save-outline" size={20} color="#0F172A" />
                    <Text style={styles.textoBoton}>Guardar medicamento</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};