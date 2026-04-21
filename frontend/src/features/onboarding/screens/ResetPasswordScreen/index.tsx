import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

import { CustomInput } from '../../../../components/ui/customInput';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { SuccessModal } from '../../../../components/ui/success-modal';
import { restablecerContrasena } from '../../../../services/passwordRecoveryService';
import { styles } from './styles';

type ResetPasswordRouteParams = {
  token?: string;
};

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const token = (route.params as ResetPasswordRouteParams | undefined)?.token || '';

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [modalExito, setModalExito] = useState(false);

  const contrasenasCoinciden = useMemo(() => {
    return nuevaContrasena.length > 0 && nuevaContrasena === confirmarContrasena;
  }, [nuevaContrasena, confirmarContrasena]);

  const cumpleLongitud = useMemo(() => {
    return nuevaContrasena.length >= 8;
  }, [nuevaContrasena]);

  const puedeEnviar = useMemo(() => {
    return Boolean(token) && contrasenasCoinciden && cumpleLongitud;
  }, [token, contrasenasCoinciden, cumpleLongitud]);

  const manejarEnviar = async () => {
    setMensajeError('');

    if (!token) {
      setMensajeError('Token no encontrado. Abre el enlace desde tu correo.');
      return;
    }

    if (!cumpleLongitud) {
      setMensajeError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!contrasenasCoinciden) {
      setMensajeError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    const resultado = await restablecerContrasena(token, nuevaContrasena);
    setCargando(false);

    if (!resultado.exito) {
      setMensajeError(resultado.mensaje);
      return;
    }

    setModalExito(true);
  };

  const alCerrarExito = () => {
    setModalExito(false);
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'IniciarSesion' }],
    });
  };

  return (
    <View style={styles.pantalla} accessibilityLabel="Pantalla para restablecer contraseña">
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Restablecer contraseña</Text>
        <Text style={styles.descripcion}>Ingresa tu nueva contraseña. El enlace es de un solo uso.</Text>
      </View>

      <View style={styles.formulario}>
        <CustomInput
          label="Nueva Contraseña"
          value={nuevaContrasena}
          onChangeText={setNuevaContrasena}
          secureTextEntry
          iconName="lock-outline"
          accessibilityLabel="Campo para nueva contraseña"
        />

        <CustomInput
          label="Confirmar Contraseña"
          value={confirmarContrasena}
          onChangeText={setConfirmarContrasena}
          secureTextEntry
          iconName="lock-check-outline"
          accessibilityLabel="Campo para confirmar contraseña"
        />

        <PrimaryButton
          titulo="Actualizar contraseña"
          alPresionar={manejarEnviar}
          cargando={cargando}
          deshabilitado={!puedeEnviar}
          nombreIcono="check"
        />

        {mensajeError ? <Text style={styles.mensajeError}>{mensajeError}</Text> : null}
      </View>

      <SuccessModal
        esVisible={modalExito}
        mensaje="Contraseña actualizada exitosamente."
        alTerminar={alCerrarExito}
      />
    </View>
  );
};
