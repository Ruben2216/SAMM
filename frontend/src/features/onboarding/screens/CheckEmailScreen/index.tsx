import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { PrimaryButton } from '../../../../components/ui/primary-button';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';

export const CheckEmailScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.pantalla} accessibilityLabel="Pantalla de revisión de correo">
      <Text style={styles.titulo}>Revisa tu correo</Text>
      <Text style={styles.texto}>
        Si el correo existe y es una cuenta local, te llegará un enlace para restablecer tu contraseña.
        {'\n'}
        Revisa también la carpeta de <Text style={styles.textoResaltado}>spam</Text>.
      </Text>

      <PrimaryButton
        titulo="Volver a iniciar sesión"
        alPresionar={() => (navigation as any).navigate('IniciarSesion')}
        nombreIcono="login"
      />
    </View>
  );
};
