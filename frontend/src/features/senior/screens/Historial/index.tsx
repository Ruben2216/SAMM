import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';

export const Historial = () => {
    const navigation = useNavigation<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const [filtro, setFiltro] = useState('Todos'); // Todos, Tomada, No tomada
    const [historialAgrupado, setHistorialAgrupado] = useState<any>({});
    const [cargando, setCargando] = useState(true);

    const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || "http://192.168.0.17:8001";

    const cargarHistorial = async () => {
        try {
            setCargando(true);
            const userId = usuario?.Id_Usuario;
            if (!userId) { setCargando(false); return; }
            const respuesta = await fetch(`${apiUrl}/medicamentos/usuario/${userId}/historial`);
            const datos = await respuesta.json();

            // Logica para agrupar por "Hoy", "Ayer", etc.
            const agrupado: any = {};
            const hoy = new Date().toISOString().split('T')[0];
            const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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
                <TouchableOpacity style={styles.botonIcono}>
                    <Ionicons name="calendar-outline" size={20} color="#0F172A" />
                </TouchableOpacity>
            </View>

            {/* Tabs de Filtro */}
            <View style={styles.tabsContainer}>
                {['Todos', 'Tomada', 'No tomada'].map((tab) => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tab, filtro === tab && styles.tabActivo]}
                        onPress={() => setFiltro(tab)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabTexto, filtro === tab && styles.tabTextoActivo]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Lista Agrupada */}
            <ScrollView contentContainerStyle={styles.listaContainer} showsVerticalScrollIndicator={false}>
                {cargando ? (
                    <ActivityIndicator size="large" color="#0F172A" style={{ marginTop: 40 }} />
                ) : (
                    Object.keys(historialAgrupado).map((fecha) => {
                        // Filtrar los items de esta fecha según el tab seleccionado
                        const itemsFiltrados = historialAgrupado[fecha].filter((item: any) => {
                            if (filtro === 'Todos') return true;
                            if (filtro === 'Tomada') return item.Estado === 'tomado';
                            if (filtro === 'No tomada') return item.Estado === 'incumplido';
                            return true;
                        });

                        if (itemsFiltrados.length === 0) return null;

                        return (
                            <View key={fecha}>
                                <Text style={styles.fechaSeccion}>{fecha}</Text>
                                
                                {itemsFiltrados.map((item: any) => {
                                    const esTomada = item.Estado === 'tomado';
                                    
                                    return (
                                        <View key={item.Id_Historial} style={styles.tarjeta}>
                                            {/* Icono izquierdo */}
                                            <View style={styles.iconoEstadoContainer}>
                                                <Ionicons 
                                                    name={esTomada ? "checkmark" : "close"} 
                                                    size={24} 
                                                    color={esTomada ? "#10B981" : "#EF4444"} 
                                                />
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
                                            <View style={[styles.badge, { backgroundColor: esTomada ? '#D1FAE5' : '#FEE2E2' }]}>
                                                <Text style={[styles.badgeTexto, { color: esTomada ? '#10B981' : '#EF4444' }]}>
                                                    {esTomada ? 'TOMADA' : 'NO TOMADA'}
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