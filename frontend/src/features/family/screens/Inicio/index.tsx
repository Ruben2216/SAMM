import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';
import { obtenerParentescoDelAdultoParaFamiliar } from '../../../../utils/parentescoFormatter';
import { construirUrlAvatar } from '../../../../utils/avatarUrl';

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

interface HorarioInfo {
    Id_Horario: number;
    Hora_Toma: string;
    Dias_Semana: string;
    estado_hoy: 'pendiente' | 'tomado' | 'incumplido' | 'no_aplica_hoy';
}

interface MedicamentoInfo {
    Id_Medicamento: number;
    Nombre: string;
    Dosis: string;
    Frecuencia: string;
    tomado_hoy: boolean;
    horarios: HorarioInfo[];
}

const COLOR_ICONO_BATERIA = '#334155';
const TAMANO_ICONO_BATERIA = 18;
const TIEMPO_CACHE_MS = 20000;
const PADDING_HORIZONTAL = 24;
const { width: ANCHO_PANTALLA } = Dimensions.get('window');
const ANCHO_TARJETA = ANCHO_PANTALLA - PADDING_HORIZONTAL * 2;

export const Inicio = ({ navigation }: { navigation: any }) => {
    const usuario = useAuthStore((s) => s.usuario);
    const [vinculaciones, setVinculaciones] = useState<VinculacionInfo[]>([]);
    const [medicamentosPorAdulto, setMedicamentosPorAdulto] = useState<Record<number, MedicamentoInfo[]>>({});
    const [indiceActivo, setIndiceActivo] = useState(0);
    const [cargando, setCargando] = useState(true);

    const ultimaCargaMsRef = useRef<number>(0);
    const yaCargoUnaVezRef = useRef(false);
    const scrollTarjetasRef = useRef<ScrollView>(null);

    const apiMedicamentos = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

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

            const resVinc = await httpClient.get('/vinculacion/mis-vinculaciones');
            const vincs: VinculacionInfo[] = resVinc.data;
            setVinculaciones(vincs);

            if (vincs.length > 0) {
                const resultados = await Promise.all(
                    vincs.map(async (v) => {
                        try {
                            const res = await fetch(`${apiMedicamentos}/medicamentos/usuario/${v.Id_Adulto_Mayor}`);
                            if (res.ok) {
                                const meds: MedicamentoInfo[] = await res.json();
                                return { id: v.Id_Adulto_Mayor, meds };
                            }
                        } catch (err) {
                            console.log('Error cargando medicamentos del senior:', err);
                        }
                        return { id: v.Id_Adulto_Mayor, meds: [] as MedicamentoInfo[] };
                    }),
                );

                const mapa: Record<number, MedicamentoInfo[]> = {};
                resultados.forEach((r) => {
                    mapa[r.id] = r.meds;
                });
                setMedicamentosPorAdulto(mapa);

                setIndiceActivo((prev) => Math.min(prev, vincs.length - 1));
            } else {
                setMedicamentosPorAdulto({});
                setIndiceActivo(0);
            }
        } catch (error) {
            console.log('No hay vinculaciones:', error);
            setVinculaciones([]);
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
        }, [cargarDatos]),
    );

    useEffect(() => {
        if (vinculaciones.length > 0 && scrollTarjetasRef.current) {
            scrollTarjetasRef.current.scrollTo({
                x: indiceActivo * ANCHO_TARJETA,
                animated: false,
            });
        }
    }, [vinculaciones.length, indiceActivo]);

    const onCambioTarjeta = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const idx = Math.round(x / ANCHO_TARJETA);
        const clamp = Math.max(0, Math.min(idx, vinculaciones.length - 1));
        if (clamp !== indiceActivo) {
            setIndiceActivo(clamp);
        }
    };

    const nombreFamiliar = usuario?.Nombre?.split(' ')[0] || 'Familiar';
    const vinculacionActiva = vinculaciones[indiceActivo] ?? null;
    const idAdultoActivo = vinculacionActiva?.Id_Adulto_Mayor ?? 0;
    const nombreAdultoActivo = vinculacionActiva?.Nombre_Adulto_Mayor ?? '';

    return (
        <View style={styles.contenedor}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContenido}
            >
                {/* --- HEADER --- */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.saludo}>Bienvenid@,</Text>
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
                ) : vinculaciones.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                        <Text style={{ color: '#94A3B8', fontSize: 16, marginTop: 16, textAlign: 'center' }}>
                            No tienes un adulto mayor vinculado.{'\n'}Comparte tu codigo para vincularte.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* --- CARRUSEL DE TARJETAS DE ADULTOS MAYORES --- */}
                        <ScrollView
                            ref={scrollTarjetasRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={onCambioTarjeta}
                            decelerationRate="fast"
                            snapToInterval={ANCHO_TARJETA}
                            snapToAlignment="start"
                            scrollEnabled={vinculaciones.length > 1}
                        >
                            {vinculaciones.map((v) => {
                                const meds = medicamentosPorAdulto[v.Id_Adulto_Mayor] ?? [];
                                const nombre = v.Nombre_Adulto_Mayor || 'Sin nombre';
                                const parentesco =
                                    v.Rol_Familiar ||
                                    obtenerParentescoDelAdultoParaFamiliar(v.Rol_Adulto_Mayor) ||
                                    'Adulto Mayor';
                                const iniciales = obtenerInicialesNombre(nombre);
                                const uriAvatar = v.url_Avatar_Adulto_Mayor
                                    ? construirUrlAvatar(v.url_Avatar_Adulto_Mayor, httpClient.defaults.baseURL ?? undefined)
                                    : '';
                                const tieneAvatar = Boolean(uriAvatar);

                                const porcentaje =
                                    typeof v.Bateria_Porcentaje_Adulto_Mayor === 'number'
                                        ? v.Bateria_Porcentaje_Adulto_Mayor
                                        : null;
                                const cargandoBateria = Boolean(v.Bateria_Cargando_Adulto_Mayor);
                                const iconoBateria = cargandoBateria
                                    ? 'battery-charging-100'
                                    : porcentaje !== null && porcentaje < 20
                                        ? 'battery-alert'
                                        : 'battery';
                                const textoBateria = porcentaje !== null ? `${porcentaje}%` : '--%';

                                // Contamos DOSIS (horarios aplicables hoy), no medicamentos.
                                // Para "necesario" cuenta el medicamento como 1 dosis disponible.
                                let totalMeds = 0;
                                let tomados = 0;
                                let incumplidos = 0;
                                meds.forEach((m) => {
                                    if (m.Frecuencia === 'necesario' || !m.horarios || m.horarios.length === 0) {
                                        return;
                                    }
                                    m.horarios.forEach((h) => {
                                        if (h.estado_hoy === 'no_aplica_hoy') return;
                                        totalMeds += 1;
                                        if (h.estado_hoy === 'tomado') tomados += 1;
                                        else if (h.estado_hoy === 'incumplido') incumplidos += 1;
                                    });
                                });
                                const pendientes = Math.max(0, totalMeds - tomados - incumplidos);

                                return (
                                    <View key={v.Id_Vinculacion} style={{ width: ANCHO_TARJETA }}>
                                        <View style={styles.tarjetaSenior}>
                                            <View style={styles.tarjetaSeniorTop}>
                                                <View style={styles.perfilSeniorRow}>
                                                    <View
                                                        style={styles.avatarSenior}
                                                        accessibilityRole="image"
                                                        accessibilityLabel={`Avatar de ${nombre}`}
                                                    >
                                                        {tieneAvatar ? (
                                                            <Image
                                                                source={{ uri: uriAvatar }}
                                                                style={styles.avatarSenior__imagen}
                                                                accessibilityIgnoresInvertColors
                                                            />
                                                        ) : (
                                                            <Text style={styles.avatarTexto}>{iniciales}</Text>
                                                        )}
                                                    </View>
                                                    <View>
                                                        <Text style={styles.nombreSenior}>{nombre}</Text>
                                                        <Text style={styles.bateriaSenior}>{parentesco}</Text>
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

                                            {v.Nombre_Circulo && (
                                                <View style={styles.ubicacionRow}>
                                                    <Ionicons name="heart-circle" size={16} color="#FFFFFF" />
                                                    <Text style={styles.textoUbicacion}>Circulo: {v.Nombre_Circulo}</Text>
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
                                                    <Ionicons
                                                        name={incumplidos > 0 ? 'alert-circle' : 'calendar'}
                                                        size={20}
                                                        color={incumplidos > 0 ? '#EF4444' : '#00E676'}
                                                    />
                                                    <Text style={styles.textoInfo}>
                                                        {totalMeds === 0
                                                            ? 'Sin pendientes'
                                                            : incumplidos > 0
                                                                ? `${incumplidos} No tomada${incumplidos === 1 ? '' : 's'}`
                                                                : `${pendientes} Pendientes`}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>

                        {/* --- PUNTOS DE PAGINACIÓN --- */}
                        <View style={styles.paginacionRow}>
                            {vinculaciones.map((v, idx) => (
                                <View
                                    key={v.Id_Vinculacion}
                                    style={idx === indiceActivo ? styles.puntoActivo : styles.puntoInactivo}
                                />
                            ))}
                        </View>

                        {/* --- SECCIÓN GESTIONAR SALUD --- */}
                        <Text style={styles.tituloSeccion}>Gestionar Salud</Text>

                        <View style={styles.gridContainer}>
                            <TouchableOpacity
                                style={styles.cardGrid}
                                activeOpacity={0.8}
                                onPress={() =>
                                    navigation.navigate('MedicamentosFamiliar', {
                                        idAdultoMayor: idAdultoActivo,
                                        nombreAdulto: nombreAdultoActivo,
                                    })
                                }
                            >
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="flask" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Medicinas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}
                                onPress={() => navigation.navigate('Mapa')} >
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="map" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Mapa GPS</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cardGrid}
                                activeOpacity={0.8}
                                onPress={() =>
                                    navigation.navigate('CitasFamiliar', { idAdultoMayor: idAdultoActivo })
                                }
                            >
                                <View style={styles.iconoFondoRosa}>
                                    <Ionicons name="calendar-outline" size={24} color="#10B981" />
                                </View>
                                <Text style={styles.textoCardGrid}>Citas Médicas</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cardGrid}
                                activeOpacity={0.8}
                                onPress={() =>
                                    navigation.navigate('HistorialFamiliar', {
                                        idAdultoMayor: idAdultoActivo,
                                        nombreAdulto: nombreAdultoActivo,
                                    })
                                }
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
