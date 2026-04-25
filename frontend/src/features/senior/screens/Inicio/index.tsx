import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';
import { SuccessModal } from '../../../../components/ui/success-modal';
import { programarRecordatorioMedicamento, cancelarTodasLasNotificaciones } from '../../../../services/notificationService';

const generarSemana = () => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hoy = new Date();
    const semana = [];

    for (let i = -2; i <= 2; i++) {
        const fecha = new Date();
        fecha.setDate(hoy.getDate() + i);
        semana.push({
            id: i,
            dia: dias[fecha.getDay()],
            numero: fecha.getDate().toString(),
            activo: i === 0, 
        });
    }
    return semana;
};

const SEMANA = generarSemana();

const DICCIONARIO_FRECUENCIA: { [key: string]: string } = {
    'una': '1 vez al día',
    'dos': '2 veces al día',
    'necesario': 'Según sea necesario'
};

const COLORES_ESTADO: { [estado: string]: { bg: string; border: string; text: string } } = {
    pendiente:   { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' },
    tomado:      { bg: '#D1FAE5', border: '#10B981', text: '#047857' }, 
    incumplido:  { bg: '#FEE2E2', border: '#EF4444', text: '#B91C1C' }, 
    necesario:   { bg: '#E0E7FF', border: '#6366F1', text: '#4338CA' }, 
};

const etiquetaEstado = (estado: string) => {
    switch (estado) {
        case 'tomado': return 'Tomado';
        case 'incumplido': return 'No tomado';
        case 'necesario': return 'Según sea necesario';
        default: return 'Pendiente';
    }
};

export const Inicio = () => {
    const navigation = useNavigation<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const [medicamentos, setMedicamentos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [tieneVinculacion, setTieneVinculacion] = useState<boolean | null>(null);
    const [modalExito, setModalExito] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [procesandoTomaId, setProcesandoTomaId] = useState<string | null>(null);

    const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || "http://192.168.0.17:8001";

    const yaCargoMedicamentosUnaVezRef = useRef(false);

    const cargarVinculacion = useCallback(async () => {
        try {
            const res = await httpClient.get('/vinculacion/mis-vinculaciones');
            setTieneVinculacion(res.data.length > 0);
        } catch {
            setTieneVinculacion(false);
        }
    }, []);

    const cargarMedicamentos = useCallback(async () => {
        const esPrimerCarga = !yaCargoMedicamentosUnaVezRef.current;

        try {
            if (esPrimerCarga) {
                setCargando(true);
            }
            const userId = usuario?.Id_Usuario;
            if (!userId) {
                if (esPrimerCarga) {
                    setCargando(false);
                }
                return;
            }
            const respuesta = await fetch(`${apiUrl}/medicamentos/usuario/${userId}`);
            if (!respuesta.ok) throw new Error("Error al cargar los datos");
            const datosDB = await respuesta.json();

            const medicamentosFormateados: any[] = datosDB.flatMap((med: any) => {
                const frecuenciaAmigable = DICCIONARIO_FRECUENCIA[med.Frecuencia] || med.Frecuencia;

                // "Según sea necesario": NO tiene horarios fijos, aparece como 1 tarjeta
                // con botón "Tomar ahora". Se registra el historial con la hora del clic.
                if (med.Frecuencia === 'necesario' || !med.horarios || med.horarios.length === 0) {
                    return [{
                        id_unico: `${med.Id_Medicamento}-necesario`,
                        id_medicamento: med.Id_Medicamento,
                        hora: 'Cuando lo necesites',
                        horaCruda: null,
                        nombre: med.Nombre,
                        dosisCompleta: `${med.Dosis} • ${frecuenciaAmigable}`,
                        rawDosis: med.Dosis,
                        rawFrecuencia: med.Frecuencia,
                        rawHorarios: [],
                        notas: med.Notas,
                        diasSemana: '1,2,3,4,5,6,7',
                        estado: 'necesario',
                    }];
                }

                return med.horarios
                    .filter((h: any) => h.estado_hoy !== 'no_aplica_hoy')
                    .map((horario: any) => {
                        const [horasStr, minutosStr] = horario.Hora_Toma.split(':');
                        let horas = parseInt(horasStr, 10);
                        const ampm = horas >= 12 ? 'PM' : 'AM';
                        horas = horas % 12 || 12;
                        const horaUI = `(${horas}:${minutosStr} ${ampm})`;

                        // Usamos el estado calculado por backend para cada horario
                        const estado = horario.estado_hoy || 'pendiente';

                        return {
                            id_unico: `${med.Id_Medicamento}-${horario.Id_Horario}`,
                            id_medicamento: med.Id_Medicamento,
                            hora: horaUI,
                            horaCruda: horario.Hora_Toma,
                            nombre: med.Nombre,
                            dosisCompleta: `${med.Dosis} • ${frecuenciaAmigable}`,
                            rawDosis: med.Dosis,
                            rawFrecuencia: med.Frecuencia,
                            rawHorarios: med.horarios,
                            notas: med.Notas,
                            diasSemana: horario.Dias_Semana || '1,2,3,4,5,6,7',
                            estado,
                        };
                    });
            });

            medicamentosFormateados.sort((a: any, b: any) => {
                if (!a.horaCruda) return 1;
                if (!b.horaCruda) return -1;
                return a.horaCruda.localeCompare(b.horaCruda);
            });
            setMedicamentos(medicamentosFormateados);

            // Reprogramamos las alarmas locales de TODOS los medicamentos con hora fija
            // La notificación es diaria: aunque hoy ya se haya tomado, debe quedar
            // programada para que dispare mañana a la misma hora.
            await cancelarTodasLasNotificaciones();
            const conHora = medicamentosFormateados.filter((m: any) => m.horaCruda);
            console.log(`[Inicio] Programando ${conHora.length} recordatorio(s) diario(s)...`);
            for (const med of conHora) {
                await programarRecordatorioMedicamento({
                    idMedicamento: med.id_medicamento,
                    idHorario: parseInt(med.id_unico.split('-')[1], 10),
                    nombreMedicamento: med.nombre,
                    dosis: med.rawDosis,
                    notas: med.notas || '',
                    horaToma: med.horaCruda,
                    diasSemana: med.diasSemana || '1,2,3,4,5,6,7',
                });
            }
        } catch (error) {
            console.error("Error obteniendo medicamentos:", error);
        } finally {
            if (esPrimerCarga) {
                setCargando(false);
            }
            yaCargoMedicamentosUnaVezRef.current = true;
        }
    }, [apiUrl, usuario?.Id_Usuario]);

    // Se recarga cada vez que el adulto mayor vuelve a Inicio (p. ej. después de
    // editar/crear un medicamento) para que las notificaciones locales queden
    // reprogramadas con las horas actualizadas.
    useFocusEffect(
        useCallback(() => {
            cargarMedicamentos();
            cargarVinculacion();
        }, [cargarMedicamentos, cargarVinculacion])
    );

    const presionarEditar = (med: any) => {
        navigation.navigate('AgregarMedicamento', { medicamentoAEditar: med });
    };

    const confirmarEliminar = (id_medicamento: number, nombre: string) => {
        Alert.alert(
            "Eliminar Medicamento",
            `¿Estás seguro de que deseas eliminar ${nombre}?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => ejecutarEliminar(id_medicamento) }
            ]
        );
    };

    const ejecutarEliminar = async (id_medicamento: number) => {
        try {
            const respuesta = await fetch(`${apiUrl}/medicamentos/${id_medicamento}`, { method: 'DELETE' });
            if (respuesta.ok) {
                setMensajeExito('Medicamento eliminado con éxito');
                setModalExito(true);
                cargarMedicamentos();
            } else {
                Alert.alert("Error", "No se pudo eliminar el medicamento.");
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo conectar al servidor.");
        }
    };

    const presionarTomarAhora = async (med: any) => {
        if (procesandoTomaId === med.id_unico) return;
        setProcesandoTomaId(med.id_unico);

        // Para "según sea necesario" el historial usa la hora del clic (HH:MM:SS).
        let horaAsignada = med.horaCruda;
        if (!horaAsignada) {
            const ahora = new Date();
            const hh = String(ahora.getHours()).padStart(2, '0');
            const mm = String(ahora.getMinutes()).padStart(2, '0');
            const ss = String(ahora.getSeconds()).padStart(2, '0');
            horaAsignada = `${hh}:${mm}:${ss}`;
        }

        try {
            const respuesta = await fetch(`${apiUrl}/medicamentos/${med.id_medicamento}/tomar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hora_asignada: horaAsignada }),
            });

            if (respuesta.ok) {
                setMensajeExito(`${med.nombre} registrado como tomado`);
                setModalExito(true);

                // En "según sea necesario" se recarga para que aparezca en historial
                // y la tarjeta vuelva a quedar como "necesario" (no se bloquea en tomado)
                if (med.rawFrecuencia === 'necesario') {
                    cargarMedicamentos();
                } else {
                    setMedicamentos(prev => prev.map(item =>
                        item.id_unico === med.id_unico
                            ? { ...item, estado: 'tomado' }
                            : item
                    ));
                }
            } else {
                Alert.alert("Error", "Hubo un problema registrando la toma en el servidor.");
            }
        } catch (error) {
            console.error("Error registrando toma:", error);
            Alert.alert("Error", "No se pudo conectar con el servidor.");
        } finally {
            setProcesandoTomaId(null);
        }
    };

    return (
        <View style={styles.contenedor}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContenido}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.saludo}>HOLA, {usuario?.Nombre?.split(' ')[0]?.toUpperCase() || 'USUARIO'}</Text>
                        <Text style={styles.titulo}>Medicamentos de hoy</Text>
                    </View>
                    <TouchableOpacity style={styles.botonNotificacion}>
                        <Ionicons name="notifications-outline" size={24} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                {tieneVinculacion === false && (
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#0F172A',
                            borderRadius: 12,
                            padding: 14,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: '#1E293B',
                        }}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('VinculacionSenior')}
                    >
                        <Ionicons name="link-outline" size={22} color="#00E676" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                                Vincula a tu familiar
                            </Text>
                            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>
                                Ingresa el código para conectar con tu cuidador
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#64748B" />
                    </TouchableOpacity>
                )}

                <View style={styles.fechasContainer}>
                    {SEMANA.map((dia) => (
                        <TouchableOpacity key={dia.id} style={[styles.diaItem, dia.activo && styles.diaItemActivo]}>
                            <Text style={[styles.diaTexto, dia.activo && styles.diaTextoActivo]}>{dia.dia}</Text>
                            <Text style={[styles.numeroTexto, dia.activo && styles.numeroTextoActivo]}>{dia.numero}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {cargando ? (
                    <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 50 }} />
                ) : medicamentos.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 50, color: '#94A3B8' }}>
                        No tienes medicamentos programados para hoy.
                    </Text>
                ) : (
                    medicamentos.map((med) => {
                        const colores = COLORES_ESTADO[med.estado] || COLORES_ESTADO.pendiente;
                        const puedeTomar = med.estado === 'pendiente' || med.estado === 'necesario';

                        return (
                            <View key={med.id_unico}>
                                <Text style={styles.horaTitulo}>{med.hora}</Text>
                                <View style={[styles.tarjetaMedicamento, styles.tarjetaConBorde, { borderColor: colores.border }]}>
                                    <View style={styles.tarjetaHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.nombreMedicamento}>{med.nombre}</Text>
                                            <Text style={styles.dosisMedicamento}>{med.dosisCompleta}</Text>
                                        </View>

                                        <View style={styles.accionesContenedor}>
                                            <TouchableOpacity onPress={() => presionarEditar(med)} style={styles.botonAccionMini}>
                                                <Ionicons name="create-outline" size={18} color="#2563EB" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => confirmarEliminar(med.id_medicamento, med.nombre)} style={[styles.botonAccionMini, { backgroundColor: '#FEE2E2' }]}>
                                                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Badge de estado visible, con el color del borde */}
                                    <View style={[styles.estadoBadge, { backgroundColor: colores.bg }]}>
                                        <Ionicons
                                            name={
                                                med.estado === 'tomado' ? 'checkmark-circle' :
                                                med.estado === 'incumplido' ? 'close-circle' :
                                                med.estado === 'necesario' ? 'medkit' : 'time-outline'
                                            }
                                            size={14}
                                            color={colores.border}
                                        />
                                        <Text style={[styles.estadoBadgeTexto, { color: colores.text }]}>
                                            {etiquetaEstado(med.estado)}
                                        </Text>
                                    </View>

                                    {med.notas && med.notas.trim() !== '' && (
                                        <View style={styles.notasContainer}>
                                            <Ionicons name="document-text-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                                            <Text style={styles.notasTexto}>{med.notas}</Text>
                                        </View>
                                    )}

                                    {puedeTomar && (
                                        <View style={styles.estadoPendienteRow}>
                                            <TouchableOpacity
                                                style={[styles.botonTomarAhora, procesandoTomaId === med.id_unico && { opacity: 0.6 }]}
                                                onPress={() => presionarTomarAhora(med)}
                                                disabled={procesandoTomaId === med.id_unico}
                                            >
                                                {procesandoTomaId === med.id_unico ? (
                                                    <ActivityIndicator size="small" color="#0F172A" />
                                                ) : (
                                                    <Ionicons name="checkmark" size={20} color="#0F172A" />
                                                )}
                                                <Text style={styles.textoTomarAhora}>
                                                    {procesandoTomaId === med.id_unico ? 'Registrando...' : 'Tomar ahora'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <View style={styles.fabContainer}>
                {/* Boton SOS */}
                <TouchableOpacity 
                    style={styles.botonSOS}
                    onPress={() => navigation.navigate('Emergencia')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.textoSOS}>SOS</Text>
                    <Text style={styles.textoAyuda}>ayuda</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonAgregar} onPress={() => navigation.navigate('AgregarMedicamento')} activeOpacity={0.8}>
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <SuccessModal
                esVisible={modalExito}
                mensaje={mensajeExito}
                alTerminar={() => setModalExito(false)}
            />
        </View>
    );
};