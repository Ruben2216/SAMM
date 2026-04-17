import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
    url_Avatar_Adulto_Mayor?: string | null;
    Bateria_Porcentaje_Adulto_Mayor?: number | null;
    Bateria_Cargando_Adulto_Mayor?: boolean | null;
    Bateria_Actualizado_En_Adulto_Mayor?: string | null;
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

const COLOR_ICONO_BATERIA = '#334155';
const TAMANO_ICONO_BATERIA = 18;
const TIEMPO_CACHE_MS = 20000;

export const Inicio = ({ navigation }: { navigation: any }) => {
    const usuario = useAuthStore((s) => s.usuario);
    const [vinculacion, setVinculacion] = useState<VinculacionInfo | null>(null);
    const [medicamentos, setMedicamentos] = useState<MedicamentoInfo[]>([]);
    const [cargando, setCargando] = useState(true);

    const ultimaCargaMsRef = useRef<number>(0);
    const yaCargoUnaVezRef = useRef(false);

    const apiMedicamentos = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

    const construirUriAvatar = (urlAvatar: string) => {
        const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
        const ruta = urlAvatar.trim();

        if (!ruta) return '';
        if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
        if (!baseUrl) return ruta;

        return `${baseUrl}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
    };

    const obtenerInicialesNombre = (nombreCompleto: string) => {
        const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
        const primera = partes[0]?.[0] ?? '';
        const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : '';
        return `${primera}${ultima}`.toUpperCase();
    };

    const cargarDatos = useCallback(async () => {
        const esPrimerCarga = !yaCargoUnaVezRef.current;

        try {
            if (esPrimerCarga) {
                setCargando(true);
            }

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
            if (esPrimerCarga) {
                setCargando(false);
            }
            yaCargoUnaVezRef.current = true;
        }
    }, [apiMedicamentos]);

    useFocusEffect(
        useCallback(() => {
            const ahora = Date.now();
            if (ahora - ultimaCargaMsRef.current < TIEMPO_CACHE_MS) {
                return;
            }
            ultimaCargaMsRef.current = ahora;

            cargarDatos();
        }, [cargarDatos])
    );

    const nombreFamiliar = usuario?.Nombre?.split(' ')[0] || 'Familiar';
    const nombreSenior = vinculacion?.Nombre_Adulto_Mayor || 'Sin vincular';
    const parentescoSenior =
        vinculacion?.Rol_Familiar ||
        obtenerParentescoDelAdultoParaFamiliar(vinculacion?.Rol_Adulto_Mayor) ||
        'Adulto Mayor';
    const iniciales = nombreSenior !== 'Sin vincular'
        ? obtenerInicialesNombre(nombreSenior)
        : '??';

    const uriAvatarSenior = vinculacion?.url_Avatar_Adulto_Mayor
        ? construirUriAvatar(vinculacion.url_Avatar_Adulto_Mayor)
        : '';
    const tieneAvatarSenior = Boolean(uriAvatarSenior);

    const porcentajeBateriaSenior =
        typeof vinculacion?.Bateria_Porcentaje_Adulto_Mayor === 'number'
            ? vinculacion.Bateria_Porcentaje_Adulto_Mayor
            : null;
    const estaCargandoSenior = Boolean(vinculacion?.Bateria_Cargando_Adulto_Mayor);

    const iconoBateria = estaCargandoSenior
        ? 'battery-charging-100'
        : porcentajeBateriaSenior !== null && porcentajeBateriaSenior < 20
            ? 'battery-alert'
            : 'battery';

    const textoBateria = porcentajeBateriaSenior !== null ? `${porcentajeBateriaSenior}%` : '--%';

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
                                    <View
                                        style={styles.avatarSenior}
                                        accessibilityRole="image"
                                        accessibilityLabel={`Avatar de ${nombreSenior}`}
                                    >
                                        {tieneAvatarSenior ? (
                                            <Image
                                                source={{ uri: uriAvatarSenior }}
                                                style={styles.avatarSenior__imagen}
                                                accessibilityIgnoresInvertColors
                                            />
                                        ) : (
                                            <Text style={styles.avatarTexto}>{iniciales}</Text>
                                        )}
                                    </View>
                                    <View>
                                        <Text style={styles.nombreSenior}>{nombreSenior}</Text>
                                        <Text style={styles.bateriaSenior}>{parentescoSenior}</Text>
                                    </View>
                                </View>

                                <View style={styles.estadoSenior}>
                                    <View style={styles.badgeEstable}>
                                        <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                                        <Text style={styles.textoEstable}>Vinculado</Text>
                                    </View>

                                    <View
                                        style={styles.estadoSenior__bateriaRow}
                                        accessibilityLabel={`Batería del adulto mayor: ${textoBateria}`}
                                    >
                                        <Icon
                                            name={iconoBateria}
                                            size={TAMANO_ICONO_BATERIA}
                                            color={COLOR_ICONO_BATERIA}
                                        />
                                        <Text style={styles.estadoSenior__bateriaTexto}>{textoBateria}</Text>
                                    </View>
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
                            <TouchableOpacity
                                style={styles.cardGrid}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('MedicamentosFamiliar', { idAdultoMayor: vinculacion.Id_Adulto_Mayor, nombreAdulto: nombreSenior })}
                            >
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
                                onPress={() => navigation.navigate('CitasFamiliar', { idAdultoMayor: vinculacion.Id_Adulto_Mayor })}
                            >
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="calendar-outline" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Citas Médicas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cardGrid}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('HistorialFamiliar', { idAdultoMayor: vinculacion.Id_Adulto_Mayor, nombreAdulto: nombreSenior })}
                            >
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
