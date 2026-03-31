import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { useAuthStore } from '../../../auth/authStore';
import { signInWithGoogleNative, esExpoGo } from '../../../../services/googleAuthService';

export const IniciarSesion: React.FC = () => {
    const navigation = useNavigation();

    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [verContrasena, setVerContrasena] = useState(false);

    // Auth store
    const { loginConCredenciales, loginConGoogle, cargando } = useAuthStore();

    /**
     * Procesa el id_token de Google (desde cualquier estrategia)
     */
    const manejarGoogleToken = async (idToken: string) => {
        console.log('[IniciarSesion] Enviando id_token al backend...');
        const resultado = await loginConGoogle(idToken);

        if (resultado.exito) {
            if (resultado.es_nuevo) {
                console.log('[IniciarSesion] Usuario nuevo de Google — navegando a selección de rol');
                (navigation as any).navigate('Welcome');
            } else {
                const usuario = useAuthStore.getState().usuario;
                console.log(`[IniciarSesion] Usuario existente — Rol: ${usuario?.Rol}`);

                if (usuario?.Rol === 'adulto_mayor') {
                    console.log('[IniciarSesion] Navegando a SeniorTabs');
                    (navigation as any).navigate('SeniorTabs');
                } else if (usuario?.Rol === 'familiar') {
                    console.log('[IniciarSesion] Navegando a FamilyTabs');
                    (navigation as any).navigate('FamilyTabs');
                } else {
                    console.log('[IniciarSesion] Sin rol asignado — navegando a Welcome');
                    (navigation as any).navigate('Welcome');
                }
            }
        } else {
            Alert.alert('Error', resultado.mensaje || 'Error al iniciar sesión con Google');
        }
    };

    /**
     * Login manual con correo y contraseña
     */
    const manejarContinuar = async () => {
        const email = correo.trim().toLowerCase();
        console.log(`[IniciarSesion] Intentando login manual — Correo: ${email}`);

        // Validar que sea Gmail
        if (!email.endsWith('@gmail.com')) {
            console.warn('[IniciarSesion] Correo no es Gmail');
            Alert.alert('Error', 'Solo se permiten correos de Gmail (@gmail.com)');
            return;
        }

        if (!contrasena) {
            Alert.alert('Error', 'Ingresa tu contraseña');
            return;
        }

        const resultado = await loginConCredenciales(email, contrasena);

        if (resultado.exito) {
            const usuario = useAuthStore.getState().usuario;
            console.log(`[IniciarSesion] Login exitoso — Rol: ${usuario?.Rol}`);

            if (usuario?.Rol === 'adulto_mayor') {
                console.log('[IniciarSesion] Navegando a SeniorTabs');
                (navigation as any).navigate('SeniorTabs');
            } else if (usuario?.Rol === 'familiar') {
                console.log('[IniciarSesion] Navegando a FamilyTabs');
                (navigation as any).navigate('FamilyTabs');
            } else {
                console.log('[IniciarSesion] Sin rol — navegando a Welcome');
                (navigation as any).navigate('Welcome');
            }
        } else {
            console.error('[IniciarSesion] Login fallido:', resultado.mensaje);
            Alert.alert('Error', resultado.mensaje || 'Correo o contraseña incorrectos');
        }
    };

    /**
     * Botón de Google presionado
     */
    const manejarGoogleSignIn = async () => {
        console.log('[IniciarSesion] Botón de Google presionado');

        if (esExpoGo()) {
            console.log('[IniciarSesion] Expo Go detectado — Google Auth no disponible');
            Alert.alert(
                'No disponible en Expo Go',
                'Google Sign-In requiere un Development Build.\n\n' +
                'Para probar, usa el login con correo y contraseña.\n\n' +
                'Para habilitar Google Auth, ejecuta:\nnpx expo run:android',
            );
            return;
        }

        console.log('[IniciarSesion] Build nativo — usando selector nativo de Google');
        try {
            const idToken = await signInWithGoogleNative();
            if (idToken) {
                await manejarGoogleToken(idToken);
            } else {
                Alert.alert('Error', 'No se pudo obtener el token de Google');
            }
        } catch (error: any) {
            console.error('[IniciarSesion] Error en Google nativo:', error);
            
            // Mostrar error detallado en el celular para poder depurarlo
            let errorMessage = "Ocurrió un error desconocido";
            if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            // Agregamos el código de error nativo si existe, útil para debug de Google Play Services
            if (error?.code) {
                errorMessage += `\n(Código: ${error.code})`;
            }

            Alert.alert('Fallo Nativo de Autenticación', errorMessage);
        }
    };

    const manejarVolver = () => {
        navigation.goBack();
    };

    const manejarOlvidoContrasena = () => {
        console.log('[IniciarSesion] Olvidé mi contraseña presionado');
    };

    const manejarRegistro = () => {
        console.log('[IniciarSesion] Ir a crear cuenta');
    };

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
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={correo}
                    onChangeText={setCorreo}
                    editable={!cargando}
                />

                {/* contraseña */}
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputPassword}
                        placeholder="Tu contraseña"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!verContrasena}
                        value={contrasena}
                        onChangeText={setContrasena}
                        editable={!cargando}
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
                    style={[styles.botonContinuar, cargando && { opacity: 0.6 }]}
                    onPress={manejarContinuar}
                    activeOpacity={0.8}
                    disabled={cargando}
                >
                    {cargando ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.textoBoton}>Continuar</Text>
                    )}
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
                <TouchableOpacity
                    style={[styles.botonGoogle, cargando && { opacity: 0.6 }]}
                    onPress={manejarGoogleSignIn}
                    disabled={cargando}
                >
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