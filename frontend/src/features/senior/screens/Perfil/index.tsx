import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';
import { ConfirmationModal } from '../../../../components/ui/confirmation-modal';

interface PerfilSaludData {
    Tipo_Sangre: string;
    Alergias: string;
    Peso: string;
    Edad: string;
    Condicion_Medica: string;
    Telefono: string;
}

const CampoEditable = ({
    label,
    value,
    onChange,
    keyboard = 'default',
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    keyboard?: 'default' | 'numeric' | 'phone-pad';
}) => (
    <View style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 6 }}>{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChange}
            keyboardType={keyboard}
            style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E2E8F0',
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: '#0F172A',
                fontWeight: '600',
            }}
            placeholderTextColor="#CBD5E1"
            placeholder={`Ingresa ${label.toLowerCase()}`}
        />
    </View>
);

export const Perfil = () => {
    const navigation = useNavigation<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

    const apiMedicamentos = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

    const [vinculacion, setVinculacion] = useState<any>(null);
    const [perfil, setPerfil] = useState<PerfilSaludData>({
        Tipo_Sangre: '',
        Alergias: '',
        Peso: '',
        Edad: '',
        Condicion_Medica: '',
        Telefono: '',
    });
    const [editando, setEditando] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const userId = usuario?.Id_Usuario;
            if (!userId) return;

            // Cargar perfil de salud desde medication-service
            try {
                const res = await fetch(`${apiMedicamentos}/perfil-salud/usuario/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setPerfil({
                        Tipo_Sangre: data.Tipo_Sangre || '',
                        Alergias: data.Alergias || '',
                        Peso: data.Peso || '',
                        Edad: data.Edad ? String(data.Edad) : '',
                        Condicion_Medica: data.Condicion_Medica || '',
                        Telefono: data.Telefono || '',
                    });
                }
            } catch (err) {
                console.log('Sin perfil de salud aún');
            }

            // Cargar vinculación desde identity-service
            try {
                const resVinc = await httpClient.get('/vinculacion/mis-vinculaciones');
                if (resVinc.data.length > 0) {
                    setVinculacion(resVinc.data[0]);
                }
            } catch (err) {
                console.log('Sin vinculación');
            }
        } finally {
            setCargando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, [])
    );

    const guardarPerfil = async () => {
        try {
            setGuardando(true);
            const userId = usuario?.Id_Usuario;
            if (!userId) return;

            const res = await fetch(`${apiMedicamentos}/perfil-salud/usuario/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Tipo_Sangre: perfil.Tipo_Sangre || null,
                    Alergias: perfil.Alergias || null,
                    Peso: perfil.Peso || null,
                    Edad: perfil.Edad ? parseInt(perfil.Edad) : null,
                    Condicion_Medica: perfil.Condicion_Medica || null,
                    Telefono: perfil.Telefono || null,
                }),
            });

            if (res.ok) {
                setEditando(false);
                Alert.alert('Guardado', 'Tu perfil de salud se actualizó correctamente.');
            } else {
                Alert.alert('Error', 'No se pudo guardar el perfil.');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo conectar al servidor.');
        } finally {
            setGuardando(false);
        }
    };

    const manejarCerrarSesion = async () => {
        try {
            await cerrarSesion();
            setModalVisible(false);
            navigation.reset({ index: 0, routes: [{ name: 'Initial' }] });
        } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión.');
        }
    };

    const nombreUsuario = usuario?.Nombre || 'Usuario';
    const iniciales = nombreUsuario.split(' ').map((p: string) => p[0]).join('').toUpperCase().substring(0, 2);
    const nombreFamiliar = vinculacion?.Nombre_Familiar || '';
    const inicialesFamiliar = nombreFamiliar
        ? nombreFamiliar.split(' ').map((p: string) => p[0]).join('').toUpperCase().substring(0, 2)
        : '??';

    if (cargando) {
        return (
            <View style={[styles.contenedor, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#00E676" />
            </View>
        );
    }

    return (
        <View style={styles.contenedor}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContenido}
            >
                {/* --- HEADER --- */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonIcono}>
                        <Ionicons name="arrow-back" size={28} color="#0F172A" />
                    </TouchableOpacity>

                    <Text style={styles.tituloHeader}>Mi perfil</Text>

                    <TouchableOpacity
                        onPress={() => editando ? guardarPerfil() : setEditando(true)}
                        style={styles.botonIcono}
                    >
                        {guardando ? (
                            <ActivityIndicator size="small" color="#00E676" />
                        ) : (
                            <Ionicons
                                name={editando ? "checkmark" : "create-outline"}
                                size={28}
                                color={editando ? "#00E676" : "#0F172A"}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* --- TARJETA PRINCIPAL --- */}
                <View style={styles.tarjetaPerfil}>
                    <View style={styles.avatarContenedor}>
                        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900' }}>{iniciales}</Text>
                    </View>
                    <Text style={styles.nombreUsuario}>{nombreUsuario}</Text>
                    <Text style={styles.edadUsuario}>
                        {perfil.Edad ? `${perfil.Edad} años` : 'Edad sin registrar'}
                    </Text>
                </View>

                {/* --- MI CÍRCULO --- */}
                {vinculacion && (
                    <>
                        <View style={styles.seccionTituloRow}>
                            <Ionicons name="people-circle" size={24} color="#6366F1" />
                            <Text style={styles.tituloSeccion}>
                                {vinculacion.Nombre_Circulo || 'Mi Círculo'}
                            </Text>
                        </View>

                        <View style={{
                            backgroundColor: '#F5F3FF',
                            borderRadius: 20,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#DDD6FE',
                            marginBottom: 25,
                        }}>
                            {/* Integrante: Yo (adulto mayor) */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                                <View style={{
                                    width: 42, height: 42, borderRadius: 21,
                                    backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginRight: 12,
                                }}>
                                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>{iniciales}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>{nombreUsuario}</Text>
                                    <Text style={{ fontSize: 13, color: '#6366F1', fontWeight: '600' }}>Adulto Mayor</Text>
                                </View>
                                <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                                    <Text style={{ fontSize: 11, color: '#6366F1', fontWeight: '700' }}>Tú</Text>
                                </View>
                            </View>

                            {/* Separador */}
                            <View style={{ height: 1, backgroundColor: '#DDD6FE', marginBottom: 14 }} />

                            {/* Integrante: Familiar */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: 42, height: 42, borderRadius: 21,
                                    backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12,
                                }}>
                                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>{inicialesFamiliar}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>{nombreFamiliar}</Text>
                                    <Text style={{ fontSize: 13, color: '#10B981', fontWeight: '600' }}>
                                        {vinculacion.Rol_Adulto_Mayor || 'Familiar'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* --- DATOS DE SALUD --- */}
                <View style={styles.seccionTituloRow}>
                    <Ionicons name="heart" size={24} color="#D97777" />
                    <Text style={styles.tituloSeccion}>Datos de Salud</Text>
                </View>

                {editando ? (
                    <View style={{ marginBottom: 35 }}>
                        <CampoEditable label="Edad" value={perfil.Edad} onChange={(v) => setPerfil(p => ({ ...p, Edad: v }))} keyboard="numeric" />
                        <CampoEditable label="Tipo de sangre" value={perfil.Tipo_Sangre} onChange={(v) => setPerfil(p => ({ ...p, Tipo_Sangre: v }))} />
                        <CampoEditable label="Alergias" value={perfil.Alergias} onChange={(v) => setPerfil(p => ({ ...p, Alergias: v }))} />
                        <CampoEditable label="Peso" value={perfil.Peso} onChange={(v) => setPerfil(p => ({ ...p, Peso: v }))} />
                        <CampoEditable label="Condición médica" value={perfil.Condicion_Medica} onChange={(v) => setPerfil(p => ({ ...p, Condicion_Medica: v }))} />
                        <CampoEditable label="Teléfono" value={perfil.Telefono} onChange={(v) => setPerfil(p => ({ ...p, Telefono: v }))} keyboard="phone-pad" />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                            <TouchableOpacity
                                onPress={() => { setEditando(false); cargarDatos(); }}
                                style={{ flex: 0.48, backgroundColor: '#F1F5F9', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
                            >
                                <Text style={{ color: '#64748B', fontWeight: '700' }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={guardarPerfil}
                                style={{ flex: 0.48, backgroundColor: '#00E676', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
                            >
                                <Text style={{ color: '#0F172A', fontWeight: '800' }}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={styles.saludGrid}>
                            <View style={styles.tarjetaSalud}>
                                <Text style={styles.saludLabel}>Tipo de sangre</Text>
                                <Text style={styles.saludValor}>{perfil.Tipo_Sangre || 'Sin registrar'}</Text>
                            </View>
                            <View style={styles.tarjetaSalud}>
                                <Text style={styles.saludLabel}>Alergias</Text>
                                <Text style={styles.saludValor}>{perfil.Alergias || 'Sin registrar'}</Text>
                            </View>
                        </View>
                        <View style={styles.saludGrid}>
                            <View style={styles.tarjetaSalud}>
                                <Text style={styles.saludLabel}>Peso</Text>
                                <Text style={styles.saludValor}>{perfil.Peso || 'Sin registrar'}</Text>
                            </View>
                            <View style={styles.tarjetaSalud}>
                                <Text style={styles.saludLabel}>Condición</Text>
                                <Text style={styles.saludValor}>{perfil.Condicion_Medica || 'Sin registrar'}</Text>
                            </View>
                        </View>

                        {/* --- TELÉFONO --- */}
                        {perfil.Telefono ? (
                            <View style={{
                                backgroundColor: '#FFFFFF',
                                borderWidth: 1,
                                borderColor: '#CBD5E1',
                                borderRadius: 20,
                                paddingVertical: 16,
                                paddingHorizontal: 20,
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 35,
                            }}>
                                <Ionicons name="call-outline" size={20} color="#10B981" style={{ marginRight: 12 }} />
                                <View>
                                    <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '600' }}>Teléfono</Text>
                                    <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>{perfil.Telefono}</Text>
                                </View>
                            </View>
                        ) : null}
                    </>
                )}

                {/* --- MI CUIDADOR --- */}
                <View style={styles.seccionTituloRow}>
                    <Ionicons name="checkmark-circle" size={26} color="#4ADE80" />
                    <Text style={styles.tituloSeccion}>Mi Cuidador</Text>
                </View>

                {vinculacion ? (
                    <View style={styles.tarjetaCuidador}>
                        <View style={styles.infoCuidadorRow}>
                            <View style={styles.avatarCuidador}>
                                <Ionicons name="person" size={24} color="#94A3B8" />
                            </View>
                            <View>
                                <Text style={styles.nombreCuidador}>{vinculacion.Nombre_Familiar}</Text>
                                <Text style={styles.rolCuidador}>Familiar vinculado</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.botonLlamar} activeOpacity={0.8}>
                            <Ionicons name="call" size={24} color="#0F172A" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
                        No tienes un cuidador vinculado aún.
                    </Text>
                )}

                {/* --- CERRAR SESIÓN --- */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={{
                        marginTop: 40,
                        backgroundColor: '#FEE2E2',
                        borderRadius: 16,
                        paddingVertical: 16,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={22} color="#DC2626" />
                    <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: 16, marginLeft: 8 }}>
                        Cerrar Sesión
                    </Text>
                </TouchableOpacity>

            </ScrollView>

            <ConfirmationModal
                esVisible={modalVisible}
                textoPregunta="¿Seguro que deseas cerrar la sesión?"
                textoCancelar="Cancelar"
                textoConfirmar="Cerrar sesión"
                alCancelar={() => setModalVisible(false)}
                alConfirmar={() => void manejarCerrarSesion()}
            />
        </View>
    );
};
