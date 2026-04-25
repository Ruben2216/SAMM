import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';

export const Historial = () => {
    const navigation = useNavigation<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const [filtro, setFiltro] = useState('Tomada'); // Tomada | No tomada
    const [historialAgrupado, setHistorialAgrupado] = useState<any>({});
    const [cargando, setCargando] = useState(true);

    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [fechaFiltro, setFechaFiltro] = useState<string | null>(null);

    const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || "http://192.168.0.17:8001";

    const manejarCambioFecha = (event: any, fechaSeleccionada?: Date) => {
        setMostrarCalendario(Platform.OS === 'ios');
        if (fechaSeleccionada) {
            // Ajustamos la zona horaria para obtener el YYYY-MM-DD correcto
            const tzOffset = fechaSeleccionada.getTimezoneOffset() * 60000;
            const fechaStr = new Date(fechaSeleccionada.getTime() - tzOffset).toISOString().split('T')[0];
            setFechaFiltro(fechaStr);
        } else {
            setMostrarCalendario(false);
        }
    };

    const cargarHistorial = async () => {
        try {
            setCargando(true);
            const userId = usuario?.Id_Usuario;
            if (!userId) { setCargando(false); return; }
            const respuesta = await fetch(`${apiUrl}/medicamentos/usuario/${userId}/historial`);
            const datos = await respuesta.json();

            // Logica para agrupar por "Hoy", "Ayer", etc.
            const tzOffset = new Date().getTimezoneOffset() * 60000;
            const agrupado: any = {};
            const hoy = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
            const ayer = new Date(Date.now() - 86400000 - tzOffset).toISOString().split('T')[0];

            datos.forEach((item: any) => {
                let etiquetaFecha = item.Fecha_Asignada;
                if (item.Fecha_Asignada === hoy) etiquetaFecha = 'Hoy';
                else if (item.Fecha_Asignada === ayer) etiquetaFecha = 'Ayer';

                if (!agrupado[etiquetaFecha]) agrupado[etiquetaFecha] = [];
                agrupado[etiquetaFecha].push(item);
            });

            setHistorialAgrupado(agrupado);
        } catch (error) {
            console.error("Error cargando historial:", error);
        } finally {
            setCargando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarHistorial();
        }, [])
    );

    // Formatear hora de 24h a 12h (AM/PM)
    const formatearHora = (horaCruda: string) => {
        const [horas, minutos] = horaCruda.split(':');
        let h = parseInt(horas, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutos} ${ampm}`;
    };

    return (
        <View style={styles.contenedor}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.botonIcono} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.tituloHeader}>Historial</Text>
                <TouchableOpacity style={styles.botonIcono} onPress={() => setMostrarCalendario(true)}>
                    <Ionicons name={fechaFiltro ? "calendar" : "calendar-outline"} size={20} color={fechaFiltro ? "#10B981" : "#0F172A"} />
                </TouchableOpacity>
            </View>

            {/* Tabs de Filtro */}
            <View style={styles.tabsContainer}>
                {['Tomada', 'No tomada'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, filtro === tab && styles.tabActivo]}
                        onPress={() => setFiltro(tab)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabTexto, filtro === tab && styles.tabTextoActivo]} numberOfLines={1}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Etiqueta de Filtro Activo */}
            {fechaFiltro && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <TouchableOpacity 
                        style={{ backgroundColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => setFechaFiltro(null)}
                    >
                        <Text style={{ fontSize: 13, color: '#475569', fontWeight: '600', marginRight: 6 }}>Viendo: {fechaFiltro}</Text>
                        <Ionicons name="close-circle" size={16} color="#64748B" />
                    </TouchableOpacity>
                </View>
            )}

            {mostrarCalendario && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={manejarCambioFecha}
                />
            )}

            {/* Lista Agrupada */}
            <ScrollView contentContainerStyle={styles.listaContainer} showsVerticalScrollIndicator={false}>
                {cargando ? (
                    <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 40 }} />
                ) : (
                    Object.keys(historialAgrupado)
                    .filter(fecha => {
                        if (!fechaFiltro) return true;
                        
                        const tzOffset = new Date().getTimezoneOffset() * 60000;
                        const hoyStr = new Date(Date.now() - tzOffset).toISOString().split('T')[0];
                        const ayerStr = new Date(Date.now() - 86400000 - tzOffset).toISOString().split('T')[0];
                        
                        let fechaReal = fecha;
                        if (fecha === 'Hoy') fechaReal = hoyStr;
                        if (fecha === 'Ayer') fechaReal = ayerStr;

                        return fechaReal === fechaFiltro;
                    })
                    .map((fecha) => {

                        // Filtrar los items de esta fecha según el tab seleccionado
                        // "Tomada" incluye tomas programadas Y "según sea necesario" (se distinguen por color)
                        const itemsFiltrados = historialAgrupado[fecha].filter((item: any) => {
                            if (filtro === 'Tomada') return item.Estado === 'tomado' || item.Estado === 'tomado_necesario';
                            if (filtro === 'No tomada') return item.Estado === 'incumplido';
                            return false;
                        });

                        if (itemsFiltrados.length === 0) return null;

                        return (
                            <View key={fecha}>
                                <Text style={styles.fechaSeccion}>{fecha}</Text>
                                
                                {itemsFiltrados.map((item: any) => {
                                    // Una toma es "según necesidad" si lo dice el estado nuevo (tomado_necesario)
                                    // o si la frecuencia del medicamento es 'necesario' (compatibilidad con
                                    // registros viejos guardados como 'tomado').
                                    const esNecesario = item.Estado === 'tomado_necesario' || item.Frecuencia === 'necesario';
                                    const esIncumplido = item.Estado === 'incumplido';
                                    const colorBorde = esIncumplido ? '#EF4444' : esNecesario ? '#6366F1' : '#10B981';
                                    const iconoNombre = esIncumplido ? 'close' : esNecesario ? 'medkit' : 'checkmark';
                                    const badgeBg = esIncumplido ? '#FEE2E2' : esNecesario ? '#E0E7FF' : '#D1FAE5';
                                    const badgeText = esIncumplido ? '#EF4444' : esNecesario ? '#4338CA' : '#10B981';
                                    const badgeLabel = esIncumplido ? 'NO TOMADA' : esNecesario ? 'SEGÚN NECESIDAD' : 'TOMADA';

                                    return (
                                        <View
                                            key={item.Id_Historial}
                                            style={[styles.tarjeta, styles.tarjetaConBorde, { borderColor: colorBorde }]}
                                        >
                                            {/* Icono izquierdo */}
                                            <View style={styles.iconoEstadoContainer}>
                                                <Ionicons name={iconoNombre as any} size={24} color={colorBorde} />
                                            </View>

                                            {/* Información central */}
                                            <View style={styles.infoContainer}>
                                                <Text style={styles.nombreMedicamento}>{item.Nombre_Medicamento} - {item.Dosis}</Text>
                                                <View style={styles.detalleRow}>
                                                    <Ionicons name="time-outline" size={14} color="#64748B" />
                                                    <Text style={styles.detalleTexto}>
                                                        {formatearHora(item.Hora_Asignada)} • {item.Notas || "Sin notas"}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Badge derecho */}
                                            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                                                <Text style={[styles.badgeTexto, { color: badgeText }]}>
                                                    {badgeLabel}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};