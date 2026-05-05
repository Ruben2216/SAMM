import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';
import { SuccessModal } from '../../../../components/ui/success-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Lun=1 ... Dom=7 (isoweekday). Chip visible en la UI.
const DIAS = [
    { iso: 1, label: 'Lun' },
    { iso: 2, label: 'Mar' },
    { iso: 3, label: 'Mié' },
    { iso: 4, label: 'Jue' },
    { iso: 5, label: 'Vie' },
    { iso: 6, label: 'Sáb' },
    { iso: 7, label: 'Dom' },
];

const parseDiasSemana = (csv: string): number[] => {
    try {
        return csv.split(',').map((d) => parseInt(d.trim(), 10)).filter((n) => n >= 1 && n <= 7);
    } catch {
        return [1, 2, 3, 4, 5, 6, 7];
    }
};

const formatearHoraUI = (iso: string): string => {
    // iso = "HH:MM:SS" o "HH:MM"
    const [hStr, mStr] = iso.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${mStr} ${ampm}`;
};

const dateAHoraISO = (d: Date): string => {
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}:00`;
};

const horaISOaDate = (iso: string): Date => {
    const [h, m] = iso.split(':').map((n) => parseInt(n, 10));
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
};

export const EstablecerHora = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const insets = useSafeAreaInsets();
    const datos = route.params?.medicamento || {};
    const esModoEditar = !!datos.id_medicamento;

    const horasPorDefecto = useMemo(() => {
        // Construye horas iniciales según si hay horariosExistentes o por frecuencia.
        if (datos.horariosExistentes && datos.horariosExistentes.length > 0) {
            return datos.horariosExistentes.map((h: any) => h.Hora_Toma as string);
        }
        if (datos.frecuencia === 'dos') return ['09:00:00', '21:00:00'];
        return ['09:00:00'];
    }, [datos.horariosExistentes, datos.frecuencia]);

    const [horas, setHoras] = useState<string[]>(horasPorDefecto);

    const [diasSeleccionados, setDiasSeleccionados] = useState<Set<number>>(
        new Set(parseDiasSemana(datos.diasSemana || '1,2,3,4,5,6,7'))
    );

    const [modalExito, setModalExito] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [guardando, setGuardando] = useState(false);

    const [pickerVisible, setPickerVisible] = useState(false);
    const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

    const maxHorasPermitidas = datos.frecuencia === 'dos' ? 2 : 1;

    const abrirPicker = (indice: number) => {
        setIndiceEditando(indice);
        setPickerVisible(true);
    };

    const onCambioHora = (_event: any, nuevaFecha?: Date) => {
        // En Android el picker se cierra solo
        if (Platform.OS === 'android') setPickerVisible(false);
        if (!nuevaFecha || indiceEditando === null) return;
        const iso = dateAHoraISO(nuevaFecha);
        const actualizadas = [...horas];
        actualizadas[indiceEditando] = iso;
        setHoras(actualizadas);
        if (Platform.OS === 'ios') setPickerVisible(false);
        setIndiceEditando(null);
    };

    const toggleDia = (iso: number) => {
        const nuevos = new Set(diasSeleccionados);
        if (nuevos.has(iso)) nuevos.delete(iso);
        else nuevos.add(iso);
        setDiasSeleccionados(nuevos);
    };

    const seleccionarTodosLosDias = () => setDiasSeleccionados(new Set([1, 2, 3, 4, 5, 6, 7]));

    const manejarConfirmacion = async () => {
        if (guardando) return;

        if (diasSeleccionados.size === 0) {
            Alert.alert('Selecciona al menos un día', 'Debes elegir qué días tomará el medicamento.');
            return;
        }
        if (horas.length !== maxHorasPermitidas) {
            Alert.alert(
                'Horas incompletas',
                `Esta frecuencia requiere ${maxHorasPermitidas} hora${maxHorasPermitidas === 1 ? '' : 's'}.`
            );
            return;
        }

        setGuardando(true);

        // Ordenamos y normalizamos el CSV de días (1..7)
        const diasCsv = [...diasSeleccionados].sort((a, b) => a - b).join(',');

        const payload = {
            Id_Usuario: usuario?.Id_Usuario || 1,
            Nombre: datos.nombre || 'Medicamento',
            Dosis: datos.dosis || 'Sin especificar',
            Frecuencia: datos.frecuencia || 'una',
            Notas: datos.notas || '',
            horarios: horas.map((h) => ({ Hora_Toma: h, Dias_Semana: diasCsv })),
        };

        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';
            const url = esModoEditar ? `${apiUrl}/medicamentos/${datos.id_medicamento}` : `${apiUrl}/medicamentos/`;
            const metodo = esModoEditar ? 'PUT' : 'POST';

            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const resultado = await respuesta.json().catch(() => ({}));

            if (respuesta.ok) {
                setMensajeExito(esModoEditar ? 'Medicamento actualizado con éxito' : 'Medicamento guardado con éxito');
                setModalExito(true);
            } else {
                Alert.alert('Error del Servidor', resultado.detail || 'No se pudo procesar la solicitud.');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            Alert.alert('Error de Red', 'Revisa que el servicio de medicamentos esté encendido (puerto 8001).');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <View style={styles.contenedor}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.tituloHeader}>{esModoEditar ? 'Actualizar horarios' : 'Establecer horarios'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
                <Text style={styles.tituloSecundario}>
                    {maxHorasPermitidas === 1
                        ? '¿A qué hora lo debes tomar?'
                        : '¿A qué horas lo debes tomar?'}
                </Text>
                <Text style={styles.descripcion}>
                    Toca una hora para editarla y elige los días de la semana.
                </Text>

                {/* Lista de horas */}
                {horas.map((h, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={styles.tarjetaHora}
                        onPress={() => abrirPicker(idx)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.tarjetaHoraIcono}>
                            <Ionicons name="time-outline" size={22} color="#00E676" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tarjetaHoraLabel}>
                                {maxHorasPermitidas === 2 ? (idx === 0 ? 'Primera toma' : 'Segunda toma') : 'Hora de toma'}
                            </Text>
                            <Text style={styles.tarjetaHoraValor}>{formatearHoraUI(h)}</Text>
                        </View>
                        <Ionicons name="create-outline" size={20} color="#64748B" />
                    </TouchableOpacity>
                ))}

                {/* Selector de días de la semana */}
                <View style={styles.seccionDias}>
                    <View style={styles.seccionDiasHeader}>
                        <Text style={styles.seccionDiasTitulo}>Días de la semana</Text>
                        <TouchableOpacity onPress={seleccionarTodosLosDias}>
                            <Text style={styles.seccionDiasTodos}>Todos</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.seccionDiasSub}>Se programará la alarma del teléfono sólo en los días marcados.</Text>

                    <View style={styles.chipsContainer}>
                        {DIAS.map((d) => {
                            const activo = diasSeleccionados.has(d.iso);
                            return (
                                <TouchableOpacity
                                    key={d.iso}
                                    style={[styles.chipDia, activo && styles.chipDiaActivo]}
                                    onPress={() => toggleDia(d.iso)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.chipDiaTexto, activo && styles.chipDiaTextoActivo]}>{d.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {pickerVisible && indiceEditando !== null && (
                    <DateTimePicker
                        value={horaISOaDate(horas[indiceEditando])}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onCambioHora}
                    />
                )}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[styles.botonConfirmar, guardando && { opacity: 0.7 }]}
                    onPress={manejarConfirmacion}
                    activeOpacity={0.8}
                    disabled={guardando}
                >
                    {guardando ? (
                        <ActivityIndicator size="small" color="#0F172A" />
                    ) : (
                        <Ionicons name="checkmark" size={24} color="#0F172A" />
                    )}
                    <Text style={styles.textoBoton}>
                        {guardando ? 'Procesando...' : esModoEditar ? 'Actualizar' : 'Confirmar'}
                    </Text>
                </TouchableOpacity>
            </View>

            <SuccessModal
                esVisible={modalExito}
                mensaje={mensajeExito}
                alTerminar={() => {
                    setModalExito(false);
                    navigation.navigate('Inicio');
                }}
            />
        </View>
    );
};
