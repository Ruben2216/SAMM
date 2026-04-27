import React from 'react';
import { BackHandler, Modal, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { PrimaryButton } from '../primary-button';
import { theme } from '../../../theme';
import { styles } from './styles';
import { AppLockProps } from './types';

export const AppLock: React.FC<AppLockProps> = ({
  esVisible,
  cargando = false,
  titulo = 'Protección de acceso',
  descripcion = 'Desbloquea SAMM para continuar.',
  textoBoton = 'Desbloquear',
  alReintentar,
  alSalir,
}) => {
  const manejarCerrar = () => {
    if (alSalir) {
      alSalir();
      return;
    }

    BackHandler.exitApp();
  };

  return (
    <Modal
      visible={esVisible}
      transparent
      animationType="fade"
      onRequestClose={manejarCerrar}
      accessibilityViewIsModal
    >
      <View style={styles.appLock} accessibilityLabel="Bloqueo de la aplicación">
        <View style={styles.appLock__contenedor}>
          <Text style={styles.appLock__titulo}>{titulo}</Text>
          <Text style={styles.appLock__descripcion}>{descripcion}</Text>

          {cargando ? (
            <ActivityIndicator
              animating
              color={theme.colors.primary}
              style={styles.appLock__cargando}
            />
          ) : null}

          <View style={styles.appLock__acciones}>
            <PrimaryButton
              titulo={textoBoton}
              alPresionar={alReintentar}
              cargando={cargando}
              deshabilitado={cargando}
              nombreIcono="lock"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
