import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import httpClient from '../../../../services/httpService';

interface VinculacionContacto {
    Id_Familiar: number;
    Nombre_Familiar: string | null;
    Rol_Adulto_Mayor: string | null;
}

interface ContactoRapido {
    idFamiliar: number;
    nombre: string;
    etiqueta: string;
    telefono: string;
}

export const Emergencia = () => {
    const navigation = useNavigation<any>();
    const [contactosRapidos, setContactosRapidos] = useState<ContactoRapido[]>([]);
    const [cargandoContactos, setCargandoContactos] = useState(false);
    const numeroEmergencia = (process.env.EXPO_PUBLIC_NUMERO_EMERGENCIA ?? '911').trim() || '911';

    useFocusEffect(
        useCallback(() => {
            let cancelado = false;

            const cargarContactosRapidos = async () => {
                try {
                    setCargandoContactos(true);
                    const respuesta = await httpClient.get('/vinculacion/mis-vinculaciones');
                    const vinculaciones: VinculacionContacto[] = Array.isArray(respuesta.data)
                        ? respuesta.data
                        : [];

                    const contactos = await Promise.all(
                        vinculaciones.map(async (vinculacion, indice) => {
                            let telefono = '';
                            try {
                                const respuestaTelefono = await httpClient.get(
                                    `/users/internal/telefono/${vinculacion.Id_Familiar}`,
                                );
                                telefono = (respuestaTelefono.data?.telefono ?? '').trim();
                            } catch (error) {
                                console.log('[Emergencia] No se pudo cargar teléfono familiar:', error);
                            }

                            return {
                                idFamiliar: vinculacion.Id_Familiar,
                                nombre: vinculacion.Nombre_Familiar?.trim() || 'Familiar',
                                etiqueta:
                                    vinculacion.Rol_Adulto_Mayor?.trim() ||
                                    (indice === 0 ? 'Mi cuidador' : 'Familiar principal'),
                                telefono,
                            };
                        }),
                    );

                    if (!cancelado) {
                        setContactosRapidos(contactos);
                    }
                } catch (error) {
                    console.error('[Emergencia] No se pudieron cargar contactos rápidos:', error);
                    if (!cancelado) {
                        setContactosRapidos([]);
                    }
                } finally {
                    if (!cancelado) {
                        setCargandoContactos(false);
                    }
                }
            };

            cargarContactosRapidos();

            return () => {
                cancelado = true;
            };
        }, []),
    );

    const realizarLlamada = async (numeroTelefono: string) => {
        const numeroLimpio = (numeroTelefono || '').replace(/\s+/g, '');
        if (!numeroLimpio) {
            Alert.alert('Número inválido', 'No se pudo iniciar la llamada.');
            return;
        }

        const enlace = `tel:${numeroLimpio}`;
        try {
            const puedeAbrir = await Linking.canOpenURL(enlace);
            if (puedeAbrir) {
                await Linking.openURL(enlace);
                return;
            }
            Alert.alert('No disponible', 'Este dispositivo no permite realizar llamadas telefónicas.');
        } catch (error) {
            console.error('No se pudo iniciar la llamada de emergencia', error);
            Alert.alert('Error', 'No se pudo iniciar la llamada de emergencia.');
        }
    };

    const llamarEmergencias = () => {
        void realizarLlamada(numeroEmergencia);
    };

    const abrirAsistencia = (nombreContacto: string, telefono: string) => {
        navigation.navigate('Asistencia', { nombreContacto, telefono });
    };

    const manejarPresionarContacto = (contacto: ContactoRapido) => {
        if (!contacto.telefono) {
            Alert.alert(
                'Número no disponible',
                `${contacto.nombre} aún no ha registrado su teléfono en su perfil.`,
            );
            return;
        }

        abrirAsistencia(contacto.nombre, contacto.telefono);
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

                {cargandoContactos && (
                    <View style={styles.estadoContactos}>
                        <ActivityIndicator size="small" color="#14EC5C" />
                        <Text style={styles.estadoContactosTexto}>Cargando contactos...</Text>
                    </View>
                )}

                {!cargandoContactos && contactosRapidos.length === 0 && (
                    <View style={styles.estadoContactos}>
                        <Text style={styles.estadoContactosTexto}>No hay familiares vinculados.</Text>
                    </View>
                )}

                {!cargandoContactos && contactosRapidos.map((contacto, indice) => (
                    <TouchableOpacity
                        key={contacto.idFamiliar}
                        style={styles.tarjetaContacto}
                        onPress={() => manejarPresionarContacto(contacto)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconoContactoFondo}>
                            <Ionicons
                                name={indice === 0 ? 'person' : 'heart'}
                                size={24}
                                color={indice === 0 ? '#3B82F6' : '#10B981'}
                            />
                        </View>
                        <View style={styles.infoContacto}>
                            <Text style={styles.nombreContacto}>{contacto.nombre}</Text>
                            <Text style={styles.numeroContacto}>
                                {contacto.telefono || `Sin teléfono · ${contacto.etiqueta}`}
                            </Text>
                        </View>
                        <Ionicons
                            name={contacto.telefono ? 'call' : 'alert-circle-outline'}
                            size={24}
                            color="#0F172A"
                        />
                    </TouchableOpacity>
                ))}

                <Text style={[styles.seccionTitulo, { marginTop: 16 }]}>Servicios Médicos</Text>
                
                <TouchableOpacity 
                    style={styles.boton911} 
                    onPress={llamarEmergencias}
                    activeOpacity={0.9}
                    accessibilityLabel="Llamar al número de emergencias 911"
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