import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';

// Datos simulados
const SEMANA = [
    { id: 1, dia: 'Lun', numero: '23', activo: false },
    { id: 2, dia: 'MAR', numero: '24', activo: true },
    { id: 3, dia: 'Mie', numero: '25', activo: false },
    { id: 4, dia: 'Jue', numero: '26', activo: false },
    { id: 5, dia: 'Vie', numero: '27', activo: false },
];

const MEDICAMENTOS_HOY = [
    {
        id: '1',
        hora: '(8:00 AM)',
        nombre: 'Losartan',
        dosis: '50mg • 1 Tableta',
        estado: 'tomado', 
        colorPunto: '#A7F3D0',
        mensaje: 'Tomada a las 8:05 AM',
    },
    {
        id: '2',
        hora: '(1:00 PM)',
        nombre: 'Metformina',
        dosis: '500mg • 1 Tableta',
        estado: 'pendiente',
        colorPunto: '#FEF08A',
    },
    {
        id: '3',
        hora: '(8:00 PM)',
        nombre: 'Paracetamol',
        dosis: '20mg • 1 Tableta',
        estado: 'olvidado',
        colorPunto: '#FECACA',
        mensaje: 'Por favor, avisa a tu doctor, o familiar...',
    }
];

export const Inicio = () => {

    const presionarTomarAhora = (nombre: string) => {
        console.log(`Medicamento tomado: ${nombre}`);
    };

    const navigation = useNavigation<any>();

    return (
        <View style={styles.contenedor}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContenido}
            >
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.saludo}>HOLA, NOMBRE...</Text>
                        <Text style={styles.titulo}>Medicamentos de hoy</Text>
                    </View>
                    <TouchableOpacity style={styles.botonNotificacion}>
                        <Ionicons name="notifications-outline" size={24} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                {/* SELECTOR DE FECHAS */}
                <View style={styles.fechasContainer}>
                    {SEMANA.map((dia) => (
                        <TouchableOpacity 
                            key={dia.id} 
                            style={[styles.diaItem, dia.activo && styles.diaItemActivo]}
                        >
                            <Text style={[styles.diaTexto, dia.activo && styles.diaTextoActivo]}>
                                {dia.dia}
                            </Text>
                            <Text style={[styles.numeroTexto, dia.activo && styles.numeroTextoActivo]}>
                                {dia.numero}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* LISTA DE MEDICAMENTOS */}
                {MEDICAMENTOS_HOY.map((med) => (
                    <View key={med.id}>
                        <Text style={styles.horaTitulo}>{med.hora}</Text>
                        
                        <View style={styles.tarjetaMedicamento}>
                            <View style={styles.tarjetaHeader}>
                                <View>
                                    <Text style={styles.nombreMedicamento}>{med.nombre}</Text>
                                    <Text style={styles.dosisMedicamento}>{med.dosis}</Text>
                                </View>
                                <View style={[styles.puntoEstado, { backgroundColor: med.colorPunto }]} />
                            </View>
                            
                            {/* 1. ESTADO TOMADO */}
                            {med.estado === 'tomado' && (
                                <View style={styles.estadoTomadoRow}>
                                    <Ionicons name="time-outline" size={16} color="#94A3B8" />
                                    <Text style={styles.textoTomado}>{med.mensaje}</Text>
                                </View>
                            )}

                            {/* 2. ESTADO PENDIENTE */}
                            {med.estado === 'pendiente' && (
                                <View style={styles.estadoPendienteRow}>
                                    <TouchableOpacity 
                                        style={styles.botonTomarAhora}
                                        onPress={() => presionarTomarAhora(med.nombre)}
                                    >
                                        <Ionicons name="checkmark" size={20} color="#0F172A" />
                                        <Text style={styles.textoTomarAhora}>Tomar ahora</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.botonPosponer}>
                                        <Ionicons name="alarm-outline" size={22} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* 3. ESTADO OLVIDADO */}
                            {med.estado === 'olvidado' && (
                                <View style={styles.estadoOlvidadoRow}>
                                    <Ionicons name="warning-outline" size={18} color="#EF4444" />
                                    <Text style={styles.textoOlvidado}>{med.mensaje}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* BOTONES FLOTANTES */}
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

                {/* Boton Agregar */}
                <TouchableOpacity 
    style={styles.botonAgregar}
    onPress={() => navigation.navigate('AgregarMedicamento')}
    activeOpacity={0.8}
>
    <Ionicons name="add" size={32} color="#FFFFFF" />
</TouchableOpacity>
            </View>
            
        </View>
    );
};