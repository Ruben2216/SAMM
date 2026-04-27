import React from 'react';
import { View, Text, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

export const Emergencia = () => {
    const navigation = useNavigation<any>();

    const realizarLlamada = async (numeroTelefono: string) => {
        const enlace = `tel:${numeroTelefono}`;
        try {
            const puedeAbrir = await Linking.canOpenURL(enlace);
            if (puedeAbrir) {
                await Linking.openURL(enlace);
            }
        } catch (error) {
            console.error('No se pudo iniciar la llamada de emergencia', error);
        }
    };

    const abrirAsistencia = (nombreContacto: string, telefono: string) => {
        navigation.navigate('Asistencia', { nombreContacto, telefono });
    };

    return (
        <View style={styles.contenedor}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.tituloHeader}>Centro de Ayuda</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContenido} showsVerticalScrollIndicator={false}>
                <View style={styles.alertaContainer}>
                    <View style={styles.iconoAlertaFondo}>
                        <Ionicons name="warning" size={32} color="#EF4444" />
                    </View>
                    <Text style={styles.tituloAlerta}>¿Tienes una emergencia?</Text>
                    <Text style={styles.subtituloAlerta}>
                        Toca cualquiera de los botones abajo para comunicarte inmediatamente.
                    </Text>
                </View>

                <Text style={styles.seccionTitulo}>Contactos Rápidos</Text>

                <TouchableOpacity 
                    style={styles.tarjetaContacto} 
                    onPress={() => abrirAsistencia('Mi cuidador', '3000000000')}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconoContactoFondo}>
                        <Ionicons name="person" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.infoContacto}>
                        <Text style={styles.nombreContacto}>Mi cuidador</Text>
                        <Text style={styles.numeroContacto}>Toca para pedir asistencia</Text>
                    </View>
                    <Ionicons name="call" size={24} color="#0F172A" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.tarjetaContacto} 
                    onPress={() => abrirAsistencia('Contacto de emergencia', '3000000001')}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconoContactoFondo}>
                        <Ionicons name="heart" size={24} color="#10B981" />
                    </View>
                    <View style={styles.infoContacto}>
                        <Text style={styles.nombreContacto}>Familiar Principal</Text>
                        <Text style={styles.numeroContacto}>Toca para pedir asistencia</Text>
                    </View>
                    <Ionicons name="call" size={24} color="#0F172A" />
                </TouchableOpacity>

                <Text style={[styles.seccionTitulo, { marginTop: 16 }]}>Servicios Médicos</Text>
                
                <TouchableOpacity 
                    style={styles.boton911} 
                    onPress={() => realizarLlamada('911')}
                    activeOpacity={0.9}
                >
                    <Ionicons name="medical" size={32} color="#FFFFFF" />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                        <Text style={styles.texto911}>Llamar al 911</Text>
                        <Text style={styles.subtexto911}>Ambulancia y Policía</Text>
                    </View>
                    <Ionicons name="call" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};