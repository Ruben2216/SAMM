import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

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
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [modalExito, setModalExito] = useState(false);

  const [errores, setErrores] = useState({
    nueva: '',
    confirmar: '',
  });

  const validarContrasena = (pass: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return regex.test(pass);
  };

  const ejecutarValidaciones = (): boolean => {
    const nuevosErrores = { nueva: '', confirmar: '' };

    if (!nuevaContrasena) {
      nuevosErrores.nueva = 'Ingresa una contraseña';
    } else if (!validarContrasena(nuevaContrasena)) {
      nuevosErrores.nueva = 'Debe tener mínimo 6 caracteres, letra y número';
    }

    if (!confirmarContrasena) {
      nuevosErrores.confirmar = 'Confirma tu contraseña';
    } else if (confirmarContrasena !== nuevaContrasena) {
      nuevosErrores.confirmar = 'Las contraseñas no coinciden';
    }

    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some(e => e !== '');
  };

  const manejarEnviar = async () => {
    if (enviando) return;

    if (!token) {
      Alert.alert('Error', 'Token no encontrado. Abre el enlace desde tu correo.');
      return;
    }

    const esValido = ejecutarValidaciones();
    if (!esValido) return;

    setEnviando(true);

    try {
      const resultado = await restablecerContrasena(token, nuevaContrasena);

      if (!resultado.exito) {
        Alert.alert('Error', resultado.mensaje || 'No se pudo actualizar la contraseña.');
      } else {
        setModalExito(true);
      }
    } finally {
      setEnviando(false);
    }
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
        <Text style={styles.label}>Nueva Contraseña</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!verNueva}
            value={nuevaContrasena}
            onChangeText={setNuevaContrasena}
          />
          <TouchableOpacity onPress={() => setVerNueva(!verNueva)}>
            <Image
              source={
                verNueva
                  ? require('../../../../../assets/icons/ojo-abierto.png')
                  : require('../../../../../assets/icons/ojo-cerrado.png')
              }
              style={styles.iconoOjo}
            />
          </TouchableOpacity>
        </View>
        {errores.nueva ? <Text style={styles.mensajeError}>{errores.nueva}</Text> : null}

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
        {errores.confirmar ? <Text style={styles.mensajeError}>{errores.confirmar}</Text> : null}

        <PrimaryButton
          titulo={enviando ? "Actualizando..." : "Actualizar contraseña"}
          alPresionar={manejarEnviar}
          deshabilitado={enviando}
        />
      </View>

      <SuccessModal
        esVisible={modalExito}
        mensaje="Contraseña actualizada exitosamente."
        alTerminar={alCerrarExito}
      />
    </View>
  );
};
