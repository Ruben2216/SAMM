import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';
import { theme } from '../../../../theme';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { UserRole } from '../WelcomeScreen/types';

export const CrearCuenta: React.FC = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const rol = (route.params as { rol: UserRole })?.rol;

    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');

    const [verContrasena, setVerContrasena] = useState(false);
    const [verConfirmar, setVerConfirmar] = useState(false);
    const [acepto, setAcepto] = useState(false);

    const [errores, setErrores] = useState({
        nombre: '',
        correo: '',
        contrasena: '',
        confirmar: ''
    });

    const validarEmail = (email: string) => {
        const regex = /\S+@\S+\.\S+/;
        return regex.test(email);
    };

    const validarContrasena = (pass: string) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        return regex.test(pass);
    };

    const manejarRegistro = () => {

        let nuevosErrores = {
            nombre: '',
            correo: '',
            contrasena: '',
            confirmar: ''
        };

        if (!nombre.trim()) {
            nuevosErrores.nombre = 'Ingresa tu nombre';
        }

        if (!correo.trim()) {
            nuevosErrores.correo = 'Ingresa un correo';
        } else if (!validarEmail(correo)) {
            nuevosErrores.correo = 'Correo inválido';
        }

        if (!contrasena) {
            nuevosErrores.contrasena = 'Ingresa una contraseña';
        } else if (!validarContrasena(contrasena)) {
            nuevosErrores.contrasena = 'Debe tener mínimo 6 caracteres, letra y número';
        }

        if (confirmarContrasena !== contrasena) {
            nuevosErrores.confirmar = 'Las contraseñas no coinciden';
        }

        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(e => e !== '');

        if (!hayErrores) {
            console.log("Registro correcto");
            
            if (rol === 'familiar') {
                navigation.navigate('VinculacionFamiliar' as never);
            } else if (rol === 'adulto_mayor') {
                navigation.navigate('VinculacionSenior' as never);
            }
        }
    };

    const manejarLogin = () => {
        navigation.navigate("IniciarSesion" as never);
    };

    const formularioValido =
        nombre &&
        correo &&
        contrasena &&
        confirmarContrasena &&
        acepto;

    return (
        <View style={styles.contenedor}>

            <ProgressBar pasoActual={2} pasosTotales={4} />

            <View style={styles.contenido}>

                <Text style={styles.titulo}>Crea tu cuenta</Text>

                <Text style={styles.subtitulo}>
                    Completa tus datos para empezar a cuidar de los tuyos.
                </Text>

                {/* Nombre */}
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej. Martin Perez"
                    placeholderTextColor="#94A3B8"
                    value={nombre}
                    onChangeText={setNombre}
                />
                {errores.nombre ? <Text style={styles.error}>{errores.nombre}</Text> : null}

                {/* Correo */}
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                    style={styles.input}
                    placeholder="nombre@gmail.com"
                    placeholderTextColor="#94A3B8"
                    value={correo}
                    onChangeText={setCorreo}
                />
                {errores.correo ? <Text style={styles.error}>{errores.correo}</Text> : null}

                {/* Contraseña */}
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Minimo 6 caracteres"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!verContrasena}
                        value={contrasena}
                        onChangeText={setContrasena}
                    />

                    <TouchableOpacity onPress={() => setVerContrasena(!verContrasena)}>
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
                {errores.contrasena ? <Text style={styles.error}>{errores.contrasena}</Text> : null}

                {/* Confirmar */}
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Repite la contraseña"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!verConfirmar}
                        value={confirmarContrasena}
                        onChangeText={setConfirmarContrasena}
                    />

                    <TouchableOpacity onPress={() => setVerConfirmar(!verConfirmar)}>
                        <Image
                            source={
                                verConfirmar
                                    ? require('../../../../../assets/icons/ojo-abierto.png')
                                    : require('../../../../../assets/icons/ojo-cerrado.png')
                            }
                            style={styles.iconoOjo}
                        />
                    </TouchableOpacity>
                </View>
                {errores.confirmar ? <Text style={styles.error}>{errores.confirmar}</Text> : null}

                {/* Terminos */}
                <TouchableOpacity
                    style={styles.terminosContainer}
                    onPress={() => setAcepto(!acepto)}
                >
                    <View style={[
                        styles.checkbox,
                        acepto && styles.checkboxActivo
                    ]} />

                    <Text style={styles.textoTerminos}>
                        He leído y acepto los
                        <Text style={styles.linkTerminos}> Términos y Condiciones </Text>
                        y la
                        <Text style={styles.linkTerminos}> Política de Privacidad.</Text>
                    </Text>
                </TouchableOpacity>

                {/* Botón */}
                <PrimaryButton
                    titulo="Registrarme y continuar"
                    alPresionar={manejarRegistro}
                    deshabilitado={!formularioValido}
                />

                {/* Login */}
                <TouchableOpacity onPress={manejarLogin}>
                    <Text style={styles.linkLogin}>
                        ¿Ya tienes cuenta?
                        <Text style={styles.link}> Inicia Sesión</Text>
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};