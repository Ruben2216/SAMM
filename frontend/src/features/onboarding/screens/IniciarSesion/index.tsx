import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { theme } from '../../../../theme';


export const IniciarSesion: React.FC = () => {
    const navigation = useNavigation();

    const manejarContinuar = () => {
        console.log('Continuar login');
    };

    const manejarVolver = () => {
        navigation.goBack();
    };

    const manejarOlvidoContrasena = () => {
        console.log('Olvidé mi contraseña');
    };

    const manejarRegistro = () => {
        console.log('Ir a crear cuenta');
    };

    const [verContrasena, setVerContrasena] = useState(false);

    return (
        <View style={styles.contenedor}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={manejarVolver}
                    style={styles.botonVolver}
                >
                    <Image
                        source={require('../../../../../assets/icons/flecha-izquierda.png')}
                        style={styles.iconoVolver}
                    />
                </TouchableOpacity>
            </View>

            {/* Contenido */}
            <View style={styles.contenido}>
                <Text style={styles.titulo}>Inicia Sesión</Text>

                <Text style={styles.subtitulo}>
                    Si ya tienes una cuenta iniciarás sesión.
                    {'\n'}
                    Si no, te ayudaremos a crearla
                </Text>

                {/* correo */}
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: correo@gmail.com"
                    placeholderTextColor="#94A3B8"
                />

                {/* contraseña */}
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Tu contraseña"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!verContrasena}
                    />

                    <TouchableOpacity
                        onPress={() => setVerContrasena(!verContrasena)}
                    >
                        <Image
                            source={
                                verContrasena
                                    ? require('../../../../../assets/icons/ojo-abierto.png')
                                    : require('../../../../../assets/icons/ojo-cerrado.png')
                            }
                            style={styles.iconoOjo}
                        />
                    </TouchableOpacity>
                </View>

                {/* Botón */}
                <TouchableOpacity
                    style={styles.botonContinuar}
                    onPress={manejarContinuar}
                    activeOpacity={0.8}
                >
                    <Text style={styles.textoBoton}>Continuar</Text>
                </TouchableOpacity>

                {/* Links */}
                <TouchableOpacity onPress={manejarOlvidoContrasena}>
                    <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={manejarRegistro}>
                    <Text style={styles.link}>¿No tienes cuenta?</Text>
                </TouchableOpacity>

                {/* Divisor */}
                <View style={styles.dividerContainer}>
                    <View style={styles.linea} />
                    <Text style={styles.dividerText}>o accede con</Text>
                    <View style={styles.linea} />
                </View>

                {/* Google */}
                <TouchableOpacity style={styles.botonGoogle}>
                    <Image
                        source={require('../../../../../assets/icons/google.png')}
                        style={styles.iconoGoogle}
                    />
                    <Text style={styles.textoGoogle}>Google</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};