import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

export const Perfil = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.contenedor}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContenido}
            >
                {/* --- HEADER --- */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonIcono}>
                        <Ionicons name="arrow-back" size={28} color="#0F172A" />
                    </TouchableOpacity>
                    
                    <Text style={styles.tituloHeader}>Mi perfil</Text>
                    
                    <TouchableOpacity onPress={() => console.log('Editar perfil')} style={styles.botonIcono}>
                        <Ionicons name="create-outline" size={28} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                {/* --- TARJETA PRINCIPAL --- */}
                <View style={styles.tarjetaPerfil}>
                    <View style={styles.avatarContenedor}>
                        <Ionicons name="person" size={50} color="#FFFFFF" />
                    </View>
                    <Text style={styles.nombreUsuario}>Roberto Martinez</Text>
                    <Text style={styles.edadUsuario}>78 años</Text>
                </View>

                {/* --- DATOS DE SALUD --- */}
                <View style={styles.seccionTituloRow}>
                    <Ionicons name="heart" size={24} color="#D97777" />
                    <Text style={styles.tituloSeccion}>Datos de Salud</Text>
                </View>

                <View style={styles.saludGrid}>
                    <View style={styles.tarjetaSalud}>
                        <Text style={styles.saludLabel}>Tipo de sangre</Text>
                        <Text style={styles.saludValor}>O Positivo</Text>
                    </View>
                    <View style={styles.tarjetaSalud}>
                        <Text style={styles.saludLabel}>Alergias</Text>
                        <Text style={styles.saludValor}>Penicilina</Text>
                    </View>
                </View>

                {/* --- MI CUIDADOR --- */}
                <View style={styles.seccionTituloRow}>
                    <Ionicons name="checkmark-circle" size={26} color="#4ADE80" />
                    <Text style={styles.tituloSeccion}>Mi Cuidador</Text>
                </View>

                <View style={styles.tarjetaCuidador}>
                    <View style={styles.infoCuidadorRow}>
                        {/* Avatar simulado */}
                        <View style={styles.avatarCuidador}>
                            <Ionicons name="person" size={24} color="#94A3B8" />
                        </View>
                        <View>
                            <Text style={styles.nombreCuidador}>Maria Perez</Text>
                            <Text style={styles.rolCuidador}>Hija</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.botonLlamar} 
                        activeOpacity={0.8}
                        onPress={() => console.log('Llamando a cuidador...')}
                    >
                        <Ionicons name="call" size={24} color="#0F172A" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};