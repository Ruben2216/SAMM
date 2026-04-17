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

export const Inicio = () => {
    const navigation = useNavigation<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const [medicamentos, setMedicamentos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [tieneVinculacion, setTieneVinculacion] = useState<boolean | null>(null);
    const [modalExito, setModalExito] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');

    const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || "http://192.168.0.17:8001";

    const ultimaCargaMsRef = useRef<number>(0);
    const TIEMPO_CACHE_MS = 20000;
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

            const medicamentosFormateados = datosDB.flatMap((med: any) => {
                return med.horarios.map((horario: any) => {
                    const [horasStr, minutosStr] = horario.Hora_Toma.split(':');
                    let horas = parseInt(horasStr, 10);
                    const ampm = horas >= 12 ? 'PM' : 'AM';
                    horas = horas % 12 || 12;
                    const horaUI = `(${horas}:${minutosStr} ${ampm})`;
                    const frecuenciaAmigable = DICCIONARIO_FRECUENCIA[med.Frecuencia] || med.Frecuencia;

                    //Evaluamos si el backend nos dijo que ya se lo tomó
                    const yaSeTomo = med.tomado_hoy === true;

                    return {
                        id_unico: `${med.Id_Medicamento}-${horario.Id_Horario}`,
                        id_medicamento: med.Id_Medicamento,
                        hora: horaUI,
                        horaCruda: horario.Hora_Toma,
                        nombre: med.Nombre,
                        dosisCompleta: `${med.Dosis} • ${frecuenciaAmigable}`,
                        rawDosis: med.Dosis, 
                        rawFrecuencia: med.Frecuencia, 
                        notas: med.Notas, 
                        estado: yaSeTomo ? 'tomado' : 'pendiente', //  Usa el estado real
                        colorPunto: yaSeTomo ? '#00E676' : '#FEF08A'
                    };
                });
            });

            medicamentosFormateados.sort((a: any, b: any) => a.horaCruda.localeCompare(b.horaCruda));
            setMedicamentos(medicamentosFormateados);

            // Programar notificaciones locales para cada medicamento pendiente
            await cancelarTodasLasNotificaciones();
            for (const med of medicamentosFormateados) {
                if (med.estado === 'pendiente') {
                    await programarRecordatorioMedicamento({
                        idMedicamento: med.id_medicamento,
                        idHorario: parseInt(med.id_unico.split('-')[1], 10),
                        nombreMedicamento: med.nombre,
                        dosis: med.rawDosis,
                        notas: med.notas || '',
                        horaToma: med.horaCruda,
                    });
                }
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

    useFocusEffect(
        useCallback(() => {
            const ahora = Date.now();
            if (ahora - ultimaCargaMsRef.current < TIEMPO_CACHE_MS) {
                return;
            }
            ultimaCargaMsRef.current = ahora;

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
        try {
            const respuesta = await fetch(`${apiUrl}/medicamentos/${med.id_medicamento}/tomar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Se envia al backend la hora exacta de esta pastilla
                body: JSON.stringify({ hora_asignada: med.horaCruda }) 
            });

            if (respuesta.ok) {
                setMensajeExito(`${med.nombre} registrado como tomado`);
                setModalExito(true);

                setMedicamentos(prev => prev.map(item =>
                    item.id_unico === med.id_unico 
                        ? { ...item, estado: 'tomado', colorPunto: '#00E676' }
                        : item
                ));
            } else {
                Alert.alert("Error", "Hubo un problema registrando la toma en el servidor.");
            }
        } catch (error) {
            console.error("Error registrando toma:", error);
            Alert.alert("Error", "No se pudo conectar con el servidor.");
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
                    medicamentos.map((med) => (
                        <View key={med.id_unico}>
                            <Text style={styles.horaTitulo}>{med.hora}</Text>
                            <View style={styles.tarjetaMedicamento}>
                                
                                {/* NUEVO HEADER DE LA TARJETA */}
                                <View style={styles.tarjetaHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.nombreMedicamento}>{med.nombre}</Text>
                                        <Text style={styles.dosisMedicamento}>{med.dosisCompleta}</Text>
                                    </View>
                                    
                                    <View style={styles.accionesContenedor}>
                                        <TouchableOpacity onPress={() => presionarEditar(med)} style={styles.botonAccionMini}>
                                            <Ionicons name="create-outline" size={18} color="#2563EB" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => confirmarEliminar(med.id_medicamento, med.nombre)} style={[styles.botonAccionMini, { backgroundColor: '#FEE2E2', marginRight: 12 }]}>
                                            <Ionicons name="trash-outline" size={18} color="#DC2626" />
                                        </TouchableOpacity>
                                        <View style={[styles.puntoEstado, { backgroundColor: med.colorPunto }]} />
                                    </View>
                                </View>

                                {/* SECCIÓN DE NOTAS ADICIONALES */}
                                {med.notas && med.notas.trim() !== '' && (
                                    <View style={styles.notasContainer}>
                                        <Ionicons name="document-text-outline" size={16} color="#64748B" style={{ marginTop: 2 }} />
                                        <Text style={styles.notasTexto}>{med.notas}</Text>
                                    </View>
                                )}
                                
                                {/* BOTONES DE ACCIÓN (Si está pendiente) */}
                                {med.estado === 'pendiente' && (
                                    <View style={styles.estadoPendienteRow}>
                                        <TouchableOpacity style={styles.botonTomarAhora} onPress={() => presionarTomarAhora(med)}>
                                            <Ionicons name="checkmark" size={20} color="#0F172A" />
                                            <Text style={styles.textoTomarAhora}>Tomar ahora</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.botonPosponer}>
                                            <Ionicons name="alarm-outline" size={22} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                            </View>
                        </View>
                    ))
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