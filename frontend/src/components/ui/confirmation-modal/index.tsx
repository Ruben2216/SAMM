import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';
import { ConfirmationModalProps } from './types';

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    esVisible,
    textoPregunta,
    textoCancelar = 'Cancelar',
    textoConfirmar = 'Confirmar',
    alCancelar,
    alConfirmar,
    accessibilityLabel,
}) => {
    return (
        <Modal
            visible={esVisible}
            transparent
            animationType="fade"
            onRequestClose={alCancelar}
            accessibilityViewIsModal
        >
            <View
                style={styles.modalConfirmacion}
                accessibilityLabel={accessibilityLabel ?? 'Ventana emergente de confirmación'}
            >
                <Pressable
                    style={styles.modalConfirmacion__fondoCerrable}
                    onPress={alCancelar}
                    accessibilityLabel="Cerrar confirmación"
                    accessibilityRole="button"
                />

                <View style={styles.modalConfirmacion__contenedor}>
                    <Text style={styles.modalConfirmacion__pregunta}>{textoPregunta}</Text>

                    <View style={styles.modalConfirmacion__acciones}>
                        <TouchableOpacity
                            style={[styles.modalConfirmacion__boton, styles.modalConfirmacion__botonCancelar]}
                            onPress={alCancelar}
                            accessibilityLabel={textoCancelar}
                            accessibilityRole="button"
                            activeOpacity={0.85}
                        >
                            <Text style={styles.modalConfirmacion__textoCancelar}>{textoCancelar}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalConfirmacion__boton, styles.modalConfirmacion__botonConfirmar]}
                            onPress={alConfirmar}
                            accessibilityLabel={textoConfirmar}
                            accessibilityRole="button"
                            activeOpacity={0.85}
                        >
                            <Text style={styles.modalConfirmacion__textoConfirmar}>{textoConfirmar}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
