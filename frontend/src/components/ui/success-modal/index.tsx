import React, { useEffect } from 'react';
import { Modal, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './styles';

interface SuccessModalProps {
  esVisible: boolean;
  mensaje: string;
  alTerminar: () => void;
  duracion?: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  esVisible,
  mensaje,
  alTerminar,
  duracion = 2000,
}) => {
  useEffect(() => {
    if (!esVisible) return;
    const timer = setTimeout(() => {
      alTerminar();
    }, duracion);
    return () => clearTimeout(timer);
  }, [esVisible]);

  return (
    <Modal visible={esVisible} transparent animationType="fade">
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <View style={styles.iconoCirculo}>
            <Icon name="check" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.mensaje}>{mensaje}</Text>
        </View>
      </View>
    </Modal>
  );
};
