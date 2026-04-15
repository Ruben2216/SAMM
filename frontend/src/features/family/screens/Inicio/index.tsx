import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';
import { obtenerParentescoDelAdultoParaFamiliar } from '../../../../utils/parentescoFormatter';

interface VinculacionInfo {
    Id_Vinculacion: number;
    Id_Familiar: number;
    Id_Adulto_Mayor: number;
    Nombre_Familiar: string | null;
    Nombre_Adulto_Mayor: string | null;
    Nombre_Circulo: string | null;
    Rol_Adulto_Mayor: string | null;
    Rol_Familiar?: string | null;
}

interface MedicamentoInfo {
    Id_Medicamento: number;
    Nombre: string;
    Dosis: string;
    tomado_hoy: boolean;
}

export const Inicio = ({ navigation }: { navigation: any }) => {
    const usuario = useAuthStore((s) => s.usuario);
    const [vinculacion, setVinculacion] = useState<VinculacionInfo | null>(null);
    const [medicamentos, setMedicamentos] = useState<MedicamentoInfo[]>([]);
    const [cargando, setCargando] = useState(true);

    const apiMedicamentos = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

    const cargarDatos = async () => {
        try {
            setCargando(true);

            // 1. Obtener vinculaciones
            const resVinc = await httpClient.get('/vinculacion/mis-vinculaciones');
            const vinculaciones: VinculacionInfo[] = resVinc.data;

            if (vinculaciones.length > 0) {
                const vinc = vinculaciones[0];
                setVinculacion(vinc);

                // 2. Obtener medicamentos del senior vinculado
                try {
                    const resMeds = await fetch(`${apiMedicamentos}/medicamentos/usuario/${vinc.Id_Adulto_Mayor}`);
                    if (resMeds.ok) {
                        const meds = await resMeds.json();
                        setMedicamentos(meds);
                    }
                } catch (err) {
                    console.log('Error cargando medicamentos del senior:', err);
                }
            }
        } catch (error) {
            console.log('No hay vinculaciones:', error);
        } finally {
            setCargando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, [])
    );

    const nombreFamiliar = usuario?.Nombre?.split(' ')[0] || 'Familiar';
    const nombreSenior = vinculacion?.Nombre_Adulto_Mayor || 'Sin vincular';
    const parentescoSenior =
        vinculacion?.Rol_Familiar ||
        obtenerParentescoDelAdultoParaFamiliar(vinculacion?.Rol_Adulto_Mayor) ||
        'Adulto Mayor';
    const iniciales = nombreSenior !== 'Sin vincular'
        ? nombreSenior.split(' ').map((p: string) => p[0]).join('').toUpperCase().substring(0, 2)
        : '??';

    const totalMeds = medicamentos.length;
    const tomados = medicamentos.filter((m) => m.tomado_hoy).length;

    return (
        <View style={styles.contenedor}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContenido}
            >
                {/* --- HEADER --- */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.saludo}>Bienvenido,</Text>
                        <Text style={styles.nombreUsuario}>{nombreFamiliar}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.botonVincular}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('CodigoVinculacion')}
                    >
                        <Ionicons name="add" size={16} color="#10B981" />
                        <Text style={styles.textoVincular}>Vincular</Text>
                    </TouchableOpacity>
                </View>

                {cargando ? (
                    <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 50 }} />
                ) : !vinculacion ? (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                        <Text style={{ color: '#94A3B8', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
                            No tienes un adulto mayor vinculado.{'\n'}Comparte tu codigo para vincularte.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* --- TARJETA DEL ADULTO MAYOR --- */}
                        <View style={styles.tarjetaSenior}>
                            <View style={styles.tarjetaSeniorTop}>
                                <View style={styles.perfilSeniorRow}>
                                    <View style={styles.avatarSenior}>
                                        <Text style={styles.avatarTexto}>{iniciales}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.nombreSenior}>{nombreSenior}</Text>
                                        <Text style={styles.bateriaSenior}>{parentescoSenior}</Text>
                                    </View>
                                </View>

                                <View style={styles.badgeEstable}>
                                    <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                                    <Text style={styles.textoEstable}>Vinculado</Text>
                                </View>
                            </View>

                            {vinculacion.Nombre_Circulo && (
                                <View style={styles.ubicacionRow}>
                                    <Ionicons name="heart-circle" size={16} color="#FFFFFF" />
                                    <Text style={styles.textoUbicacion}>Circulo: {vinculacion.Nombre_Circulo}</Text>
                                </View>
                            )}

                            <View style={styles.infoBotonesRow}>
                                <TouchableOpacity style={styles.botonInfo} activeOpacity={0.9}>
                                    <Ionicons name="medkit" size={20} color="#00E676" />
                                    <Text style={styles.textoInfo}>
                                        {totalMeds > 0 ? `${tomados}/${totalMeds} Dosis` : 'Sin medicamentos'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.botonInfo} activeOpacity={0.9}>
                                    <Ionicons name="calendar" size={20} color="#00E676" />
                                    <Text style={styles.textoInfo}>
                                        {totalMeds > 0
                                            ? `${totalMeds - tomados} Pendientes`
                                            : 'Sin pendientes'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* --- PUNTOS DE PAGINACIÓN --- */}
                        <View style={styles.paginacionRow}>
                            <View style={styles.puntoActivo} />
                        </View>

                        {/* --- SECCIÓN GESTIONAR SALUD --- */}
                        <Text style={styles.tituloSeccion}>Gestionar Salud</Text>

                        <View style={styles.gridContainer}>
                            <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}>
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="flask" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Medicinas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}>
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="map" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Mapa GPS</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cardGrid}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Citas')}
                            >
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="calendar-outline" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Citas Medicas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}>
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="time-outline" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Historial</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};
