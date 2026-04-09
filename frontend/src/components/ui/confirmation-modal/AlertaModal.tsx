import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { theme } from '../../../theme'; 

interface AlertaModalProps {
    esVisible: boolean;
    titulo: string;
    mensaje: string;
    textoBoton?: string;
    alCerrar: () => void;
}

export const AlertaModal: React.FC<AlertaModalProps> = ({
    esVisible,
    titulo,
    mensaje,
    textoBoton = 'Entendido',
    alCerrar,
}) => {
    return (
        <Modal
            visible={esVisible}
            transparent
            animationType="fade"
            onRequestClose={alCerrar}
            accessibilityViewIsModal
        >
            <View style={styles.modalOverlay} accessibilityLabel="Ventana de alerta">
                <Pressable
                    style={styles.modalFondoCerrable}
                    onPress={alCerrar}
                    accessibilityLabel="Cerrar alerta"
                />

                <View style={styles.modalContenedor}>
                    {titulo ? <Text style={styles.modalTitulo}>{titulo}</Text> : null}
                    
                    <Text style={styles.modalMensaje}>{mensaje}</Text>

                    <TouchableOpacity
                        style={styles.modalBoton}
                        onPress={alCerrar}
                        accessibilityLabel={textoBoton}
                        accessibilityRole="button"
                        activeOpacity={0.85}
                    >
                        <Text style={styles.modalTextoBoton}>{textoBoton}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.backdrop,
    },
    modalFondoCerrable: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContenedor: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        paddingVertical: 28,
        paddingHorizontal: 28,
        width: '86%',
        maxWidth: 400,
        elevation: 6,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        alignItems: 'center',
    },
    modalTitulo: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    modalMensaje: {
        fontSize: 16,
        fontWeight: '400',
        color: '#475569',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    modalBoton: {
        width: '100%',
        minHeight: 52,
        backgroundColor: theme.colors.primary,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 14,
    },
    modalTextoBoton: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0f172a',
    },
});