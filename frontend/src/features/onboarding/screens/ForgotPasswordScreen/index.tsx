import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { CustomInput } from '../../../../components/ui/customInput';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { solicitarRecuperacion } from '../../../../services/passwordRecoveryService';
import { styles } from './styles';

export const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation();

    const [correo, setCorreo] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState<string>('');

    const [enviando, setEnviando] = useState(false);
    const correoNormalizado = correo.trim().toLowerCase();

    const manejarEnviar = async () => {
        if (enviando || cargando) return;

        setMensajeError('');

        if (!correoNormalizado) {
            setMensajeError('Por favor, ingresa tu correo.');
            return;
        }

        const regexGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        if (!regexGmail.test(correoNormalizado)) {
            setMensajeError('Solo se permiten correos de Gmail (@gmail.com)');
            return;
        }

        setEnviando(true);
        setCargando(true);

        try {
            const resultado = await solicitarRecuperacion(correoNormalizado);

            if (!resultado.exito) {
                setMensajeError(resultado.mensaje);
            } else {
                (navigation as any).navigate('CheckEmail');
            }
        } finally {
            setCargando(false);
            setEnviando(false);
        }
    };

    return (
        <View style={styles.pantalla} accessibilityLabel="Pantalla de recuperación de contraseña">
            <View style={styles.encabezado}>
                <Text style={styles.titulo}>Recuperar contraseña</Text>
            </View>

            <View style={styles.formulario}>
                <CustomInput
                    label="Correo"
                    value={correo}
                    onChangeText={setCorreo}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    iconName="email-outline"
                    placeholder="tucorreo@gmail.com"
                    accessibilityLabel="Correo para recuperar contraseña"
                />

                <PrimaryButton
                    titulo={enviando ? "Enviando..." : "Enviar enlace"}
                    alPresionar={manejarEnviar}
                    cargando={cargando}
                    deshabilitado={enviando}
                />

                {mensajeError ? <Text style={styles.mensajeError}>{mensajeError}</Text> : null}

                <TouchableOpacity
                    style={styles.link}
                    onPress={() => (navigation as any).navigate('IniciarSesion')}
                    accessibilityRole="button"
                    accessibilityLabel="Volver a iniciar sesión"
                >
                    <Text style={styles.textoLink}>Volver a iniciar sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
