import React, { useMemo, useState } from 'react';
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

    const correoNormalizado = useMemo(() => correo.trim().toLowerCase(), [correo]);

    const puedeEnviar = useMemo(() => {
        return correoNormalizado.length > 0;
    }, [correoNormalizado]);

    const manejarEnviar = async () => {
        setMensajeError('');

        if (!puedeEnviar) {
            setMensajeError('Por favor, ingresa tu correo.');
            return;
        }

        setCargando(true);
        const resultado = await solicitarRecuperacion(correoNormalizado);
        setCargando(false);

        if (!resultado.exito) {
            setMensajeError(resultado.mensaje);
            return;
        }

        (navigation as any).navigate('CheckEmail');
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
                    titulo="Enviar enlace"
                    alPresionar={manejarEnviar}
                    cargando={cargando}
                    deshabilitado={!puedeEnviar}
                    nombreIcono="send"
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
