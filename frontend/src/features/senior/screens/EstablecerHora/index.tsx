import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

// --- CONFIGURACIÓN DE LA RULETA ---
const ITEM_HEIGHT = 60; 
const HORAS = Array.from({ length: 12 }, (_, i) => (i + 1 < 10 ? `0${i + 1}` : `${i + 1}`));
const MINUTOS = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : `${i}`));

export const EstablecerHora = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [repetir, setRepetir] = useState(true);
    const [esPM, setEsPM] = useState(true);

    // Valores iniciales (09:15)
    const [hora, setHora] = useState('09');
    const [minuto, setMinuto] = useState('15');

    const manejarConfirmacion = () => {
        const datos = route.params?.medicamento || {};
        const horaFinal = `${hora}:${minuto} ${esPM ? 'PM' : 'AM'}`;
        
        console.log('Guardando:', { ...datos, repetir, hora: horaFinal });

        Alert.alert(
            "¡Éxito!",
            `El medicamento se programó para las ${horaFinal}.`,
            [{ text: "Entendido", onPress: () => navigation.navigate('SeniorTabs') }]
        );
    };

    // COMPONENTE DE RULETA DESLIZABLE 
    const Ruleta = ({ datos, valorActual, alCambiar }: { datos: string[], valorActual: string, alCambiar: (v: string) => void }) => {
        const indexInicial = Math.max(0, datos.indexOf(valorActual));
        
        return (
            <View style={{ height: ITEM_HEIGHT * 3, width: 70 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT} // Hace que se detenga exacto en el número
                    decelerationRate="fast"
                    contentOffset={{ x: 0, y: indexInicial * ITEM_HEIGHT }} // Empieza en la hora correcta
                    onMomentumScrollEnd={(e) => {
                        // Calcula en que numero se detuvo el usuario
                        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                        if (datos[index]) alCambiar(datos[index]);
                    }}
                >
                    {/* centrar el primer elemento */}
                    <View style={{ height: ITEM_HEIGHT }} />
                    
                    {datos.map((item, idx) => (
                        <View key={idx} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={[styles.textoRuleta, item === valorActual && styles.textoRuletaActivo]}>
                                {item}
                            </Text>
                        </View>
                    ))}
                    
                    {/* Espacio en blanco abajo */}
                    <View style={{ height: ITEM_HEIGHT }} />
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.contenedor}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.tituloHeader}>Establecer hora</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.contenido}>
                <Text style={styles.tituloSecundario}>¿A qué hora deberías{'\n'}tomar esto?</Text>
                <Text style={styles.descripcion}>
                    Desplace para seleccionar el{'\n'}horario de medicación
                </Text>

                {/* --- SELECTOR DE HORA (RULETA MANUAL) --- */}
                <View style={styles.selectorContainer}>
                    {/* Componente verde decorativa en el fondo */}
                    <View style={styles.pillFondo} pointerEvents="none" />

                    {/* Scroll de Horas */}
                    <Ruleta datos={HORAS} valorActual={hora} alCambiar={setHora} />

                    {/* Separador ( : ) */}
                    <View style={styles.separadorContainer}>
                        <Text style={styles.separadorTexto}>:</Text>
                    </View>

                    {/* Scroll de Minutos */}
                    <Ruleta datos={MINUTOS} valorActual={minuto} alCambiar={setMinuto} />

                    {/* Boton AM/PM */}
                    <TouchableOpacity style={styles.amPmSelector} onPress={() => setEsPM(!esPM)} activeOpacity={0.8}>
                        <Text style={styles.amPmTexto}>{esPM ? 'PM' : 'AM'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Switch de Repeticion */}
                <View style={styles.switchContainer}>
                    <View>
                        <Text style={styles.switchTitulo}>Repetir diariamente</Text>
                        <Text style={styles.switchSub}>Recuérdamelo todos los días</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E2E8F0', true: '#00E676' }}
                        thumbColor={'#FFFFFF'}
                        onValueChange={() => setRepetir(!repetir)}
                        value={repetir}
                    />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.botonConfirmar} onPress={manejarConfirmacion} activeOpacity={0.8}>
                    <Ionicons name="checkmark" size={24} color="#0F172A" />
                    <Text style={styles.textoBoton}>Confirmar hora</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};