import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

export const Inicio = () => {
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
                        <Text style={styles.nombreUsuario}>Nombre</Text>
                    </View>
                    <TouchableOpacity style={styles.botonVincular} activeOpacity={0.8}>
                        <Ionicons name="add" size={16} color="#10B981" />
                        <Text style={styles.textoVincular}>Vincular</Text>
                    </TouchableOpacity>
                </View>

                {/* --- TARJETA DEL ADULTO MAYOR --- */}
                <View style={styles.tarjetaSenior}>
                    <View style={styles.tarjetaSeniorTop}>
                        <View style={styles.perfilSeniorRow}>
                            <View style={styles.avatarSenior}>
                                <Text style={styles.avatarTexto}>RM</Text>
                            </View>
                            <View>
                                <Text style={styles.nombreSenior}>Papá{'\n'}(Roberto)</Text>
                                <Text style={styles.bateriaSenior}>Batería: 85%</Text>
                            </View>
                        </View>
                        
                        <View style={styles.badgeEstable}>
                            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                            <Text style={styles.textoEstable}>Estable</Text>
                        </View>
                    </View>

                    <View style={styles.ubicacionRow}>
                        <Ionicons name="location" size={16} color="#FFFFFF" />
                        <Text style={styles.textoUbicacion}>Ubicación: Casa, Calle Central 123</Text>
                    </View>

                    <View style={styles.infoBotonesRow}>
                        <TouchableOpacity style={styles.botonInfo} activeOpacity={0.9}>
                            <Ionicons name="medkit" size={20} color="#00E676" />
                            <Text style={styles.textoInfo}>3/4 Dosis</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.botonInfo} activeOpacity={0.9}>
                            <Ionicons name="calendar" size={20} color="#00E676" />
                            <Text style={styles.textoInfo}>Cita: 4PM</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- PUNTOS DE PAGINACIÓN --- */}
                <View style={styles.paginacionRow}>
                    <View style={styles.puntoActivo} />
                    <View style={styles.puntoInactivo} />
                </View>

                {/* --- SECCIÓN GESTIONAR SALUD --- */}
                <Text style={styles.tituloSeccion}>Gestionar Salud</Text>

                <View style={styles.gridContainer}>
                    {/* Tarjeta Medicinas */}
                    <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}>
                        <View style={styles.iconoFondoRosa}>
                            <Ionicons name="flask" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.textoCardGrid}>Medicinas</Text>
                    </TouchableOpacity>

                    {/* Tarjeta Mapa GPS */}
                    <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}>
                        <View style={styles.iconoFondoAzul}>
                            <Ionicons name="map" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.textoCardGrid}>Mapa GPS</Text>
                    </TouchableOpacity>

                    {/* Tarjeta Citas Médicas */}
                    <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}>
                        <View style={styles.iconoFondoRosa}>
                            <Ionicons name="calendar-outline" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.textoCardGrid}>Citas Médicas</Text>
                    </TouchableOpacity>

                    {/* Tarjeta Historial */}
                    <TouchableOpacity style={styles.cardGrid} activeOpacity={0.8}>
                        <View style={styles.iconoFondoRosa}>
                            <Ionicons name="time-outline" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.textoCardGrid}>Historial</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};