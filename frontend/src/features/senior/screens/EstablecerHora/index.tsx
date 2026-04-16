import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';
import { SuccessModal } from '../../../../components/ui/success-modal';

const ITEM_HEIGHT = 60; 
const HORAS = Array.from({ length: 12 }, (_, i) => (i + 1 < 10 ? `0${i + 1}` : `${i + 1}`));
const MINUTOS = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));

export const EstablecerHora = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const usuario = useAuthStore((s) => s.usuario);
    const datos = route.params?.medicamento || {};
    const esModoEditar = !!datos.id_medicamento;

    const [repetir, setRepetir] = useState(true);
    const [modalExito, setModalExito] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');

    const [hora, setHora] = useState(() => {
        if (datos.horaCruda) {
            let h = parseInt(datos.horaCruda.split(':')[0]);
            h = h % 12 || 12;
            return h < 10 ? `0${h}` : `${h}`;
        }
        return '09';
    });

    const [minuto, setMinuto] = useState(() => {
        return datos.horaCruda ? datos.horaCruda.split(':')[1] : '15';
    });

    const [esPM, setEsPM] = useState(() => {
        if (datos.horaCruda) {
            return parseInt(datos.horaCruda.split(':')[0]) >= 12;
        }
        return true;
    });

    const manejarConfirmacion = async () => {
        let horaNumerica = parseInt(hora);
        if (esPM && horaNumerica !== 12) horaNumerica += 12;
        if (!esPM && horaNumerica === 12) horaNumerica = 0;
        
        const horaFormateada = `${horaNumerica.toString().padStart(2, '0')}:${minuto}:00`;

        const payload = {
            Id_Usuario: usuario?.Id_Usuario || 1,
            Nombre: datos.nombre || "Medicamento",
            Dosis: datos.dosis || "Sin especificar",
            Frecuencia: datos.frecuencia || "una",
            Notas: datos.notas || "",
            horarios: [{ Hora_Toma: horaFormateada }]
        };

        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || "http://192.168.0.17:8001";
            
            const urlFinal = esModoEditar ? `${apiUrl}/medicamentos/${datos.id_medicamento}` : `${apiUrl}/medicamentos/`;
            const metodoRest = esModoEditar ? 'PUT' : 'POST';

            const respuesta = await fetch(urlFinal, {
                method: metodoRest,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                setMensajeExito(esModoEditar ? 'Medicamento actualizado con éxito' : 'Medicamento guardado con éxito');
                setModalExito(true);
            } else {
                Alert.alert("Error del Servidor", resultado.detail || "No se pudo procesar la solicitud.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            Alert.alert("Error de Red", "Revisa que el servicio de medicamentos esté encendido (puerto 8001).");
        }
    };

    const Ruleta = ({ datos, valorActual, alCambiar }: { datos: string[], valorActual: string, alCambiar: (v: string) => void }) => {
        const indexInicial = Math.max(0, datos.indexOf(valorActual));
        return (
            <View style={{ height: ITEM_HEIGHT * 3, width: 70 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentOffset={{ x: 0, y: indexInicial * ITEM_HEIGHT }}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                        if (datos[index]) alCambiar(datos[index]);
                    }}
                >
                    <View style={{ height: ITEM_HEIGHT }} />
                    {datos.map((item, idx) => (
                        <View key={idx} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={[styles.textoRuleta, item === valorActual && styles.textoRuletaActivo]}>{item}</Text>
                        </View>
                    ))}
                    <View style={{ height: ITEM_HEIGHT }} />
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.contenedor}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.tituloHeader}>{esModoEditar ? 'Actualizar hora' : 'Establecer hora'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.contenido}>
                <Text style={styles.tituloSecundario}>¿A qué hora deberías{'\n'}tomar esto?</Text>
                <Text style={styles.descripcion}>Desplace para seleccionar el{'\n'}horario de medicación</Text>

                <View style={styles.selectorContainer}>
                    <View style={styles.pillFondo} pointerEvents="none" />
                    <Ruleta datos={HORAS} valorActual={hora} alCambiar={setHora} />
                    <View style={styles.separadorContainer}><Text style={styles.separadorTexto}>:</Text></View>
                    <Ruleta datos={MINUTOS} valorActual={minuto} alCambiar={setMinuto} />
                    <TouchableOpacity style={styles.amPmSelector} onPress={() => setEsPM(!esPM)} activeOpacity={0.8}>
                        <Text style={styles.amPmTexto}>{esPM ? 'PM' : 'AM'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.switchContainer}>
                    <View>
                        <Text style={styles.switchTitulo}>Repetir diariamente</Text>
                        <Text style={styles.switchSub}>Recuérdamelo todos los días</Text>
                    </View>
                    <Switch trackColor={{ false: '#E2E8F0', true: '#00E676' }} thumbColor={'#FFFFFF'} onValueChange={() => setRepetir(!repetir)} value={repetir} />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.botonConfirmar} onPress={manejarConfirmacion} activeOpacity={0.8}>
                    <Ionicons name="checkmark" size={24} color="#0F172A" />
                    <Text style={styles.textoBoton}>{esModoEditar ? "Actualizar" : "Confirmar hora"}</Text>
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