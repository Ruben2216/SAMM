import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './styles';
import { theme } from '../../../../theme';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { UserRole } from '../WelcomeScreen/types';
import { useAuthStore } from '../../../auth/authStore';

export const CrearCuenta: React.FC = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const rol = (route.params as { rol: UserRole })?.rol;

    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');

    const [sexoSeleccionado, setSexoSeleccionado] = useState<'Hombre' | 'Mujer' | 'Otro'>(
        'Otro'
    );

    const [verContrasena, setVerContrasena] = useState(false);
    const [verConfirmar, setVerConfirmar] = useState(false);
    const [acepto, setAcepto] = useState(false);

    const [errores, setErrores] = useState({
        nombre: '',
        correo: '',
        contrasena: '',
        confirmar: ''
    });

    const { registrar, cargando } = useAuthStore();
    const [enviando, setEnviando] = useState(false);

    const validarEmail = (email: string) => {
        const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        return regex.test(email);
    };

    const validarContrasena = (pass: string) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        return regex.test(pass);
    };

    const ejecutarValidaciones = (): boolean => {
        const nuevosErrores = {
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
            nuevosErrores.correo = 'Solo se permiten correos de Gmail (@gmail.com)';
        }

        if (!contrasena) {
            nuevosErrores.contrasena = 'Ingresa una contraseña';
        } else if (!validarContrasena(contrasena)) {
            nuevosErrores.contrasena = 'Debe tener mínimo 6 caracteres, letra y número';
        }

        if (!confirmarContrasena) {
            nuevosErrores.confirmar = 'Confirma tu contraseña';
        } else if (confirmarContrasena !== contrasena) {
            nuevosErrores.confirmar = 'Las contraseñas no coinciden';
        }

        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(e => e !== '');

        if (!hayErrores && !acepto) {
            Alert.alert('Términos requeridos', 'Debes aceptar los Términos y Condiciones para continuar.');
            return false;
        }

        return !hayErrores && acepto;
    };

    const manejarRegistro = async () => {
        if (enviando || cargando) return;

        console.log('[CrearCuenta] Iniciando validación de formulario...');

        if (!rol) {
            Alert.alert('Error', 'No se pudo determinar tu perfil. Vuelve a intentarlo.');
            return;
        }
        const esFormularioValido = ejecutarValidaciones();
        if (!esFormularioValido) {
            console.warn('[CrearCuenta] Validación falló — NO se envía al backend');
            return;
        }

        setEnviando(true);
        console.log(`[CrearCuenta] Validación exitosa — enviando al backend (Rol: ${rol})`);

        try {
            const resultado = await registrar({
                nombre: nombre.trim(),
                correo: correo.trim().toLowerCase(),
                contrasena,
                rol,
                sexo: sexoSeleccionado,
            });

            if (resultado.exito) {
                console.log('[CrearCuenta] Registro exitoso — navegando a vinculación');
                if (rol === 'familiar') {
                    navigation.navigate('VinculacionFamiliar' as never);
                } else if (rol === 'adulto_mayor') {
                    navigation.navigate('VinculacionSenior' as never);
                }
            } else {
                console.error('[CrearCuenta] Error en registro:', resultado.mensaje);
                Alert.alert('Error', resultado.mensaje || 'No se pudo crear la cuenta');
            }
        } finally {
            setEnviando(false);
        }
    };

    const manejarLogin = () => {
        navigation.navigate("IniciarSesion" as never);
    };



    return (
        <View style={styles.contenedor}>

            <ProgressBar pasoActual={2} pasosTotales={3} />

            <View style={styles.contenido}>

                <Text style={styles.titulo} children="Crea tu cuenta" />

                <Text
                    style={styles.subtitulo}
                    children="Completa tus datos para empezar a cuidar de los tuyos."
                />

                {/* Nombre */}
                <Text style={styles.label} children="Nombre completo" />
                <TextInput
                    style={styles.input}
                    placeholder="Ej. Martin Perez"
                    placeholderTextColor="#94A3B8"
                    value={nombre}
                    onChangeText={setNombre}
                />
                {errores.nombre ? <Text style={styles.error} children={errores.nombre} /> : null}

                {/* Correo */}
                <Text style={styles.label} children="Correo Electrónico" />
                <TextInput
                    style={styles.input}
                    placeholder="nombre@gmail.com"
                    placeholderTextColor="#94A3B8"
                    value={correo}
                    onChangeText={setCorreo}
                />
                {errores.correo ? <Text style={styles.error} children={errores.correo} /> : null}

                {/* Sexo */}
                <View >
                    <Text
                        style={styles.etiquetaSexo}
                        accessibilityLabel="Selecciona tu sexo"
                    >
                        Sexo
                    </Text>
                    <SegmentedButtons
                        value={sexoSeleccionado}
                        onValueChange={(valor) =>
                            setSexoSeleccionado(valor as 'Hombre' | 'Mujer' | 'Otro')
                        }
                        style={styles.botonesSegmentados}
                        buttons={[
                            { value: 'Mujer', label: 'Mujer', accessibilityLabel: 'Seleccionar sexo mujer' },
                            { value: 'Hombre', label: 'Hombre', accessibilityLabel: 'Seleccionar sexo hombre' },
                            { value: 'Otro', label: 'Otro', accessibilityLabel: 'Seleccionar sexo otro' },
                        ]}
                    />
                </View>

                {/* Contraseña */}
                <Text style={styles.label} children="Contraseña" />
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
                {errores.contrasena ? <Text style={styles.error} children={errores.contrasena} /> : null}

                {/* Confirmar */}
                <Text style={styles.label} children="Confirmar Contraseña" />
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
                {errores.confirmar ? <Text style={styles.error} children={errores.confirmar} /> : null}

                {/* Terminos */}
                <TouchableOpacity
                    style={styles.terminosContainer}
                    onPress={() => setAcepto(!acepto)}
                    accessibilityRole="checkbox"
                    accessibilityLabel="He leído y acepto los términos y condiciones y la política de privacidad"
                    accessibilityState={{ checked: acepto }}
                >
                    <View style={styles.checkbox}>
                        {acepto ? <Icon name="check" size={14} color={theme.colors.text} /> : null}
                    </View>

                    <Text
                        style={styles.textoTerminos}
                        children={
                            <>
                                He leído y acepto los
                                <Text style={styles.linkTerminos} children=" Términos y Condiciones " />
                                y la
                                <Text style={styles.linkTerminos} children=" Política de Privacidad." />
                            </>
                        }
                    />
                </TouchableOpacity>

                {/* Botón */}
                <View style={{ opacity: acepto ? 1 : 0.5 }}>
                    <PrimaryButton
                        titulo={enviando ? "Registrando..." : "Registrarme y continuar"}
                        alPresionar={manejarRegistro}
                        deshabilitado={enviando || cargando || !acepto} 
                    />
                </View>

                {/* Login */}
                <TouchableOpacity onPress={manejarLogin}>
                    <Text
                        style={styles.linkLogin}
                        children={
                            <>
                                ¿Ya tienes cuenta?
                                <Text style={styles.link} children=" Inicia Sesión" />
                            </>
                        }
                    />
                </TouchableOpacity>

            </View>
        </View>
    );
};