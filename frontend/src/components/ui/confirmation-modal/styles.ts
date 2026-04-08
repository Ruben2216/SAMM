import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
    modalConfirmacion: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.backdrop,
    },
    modalConfirmacion__fondoCerrable: {
        ...StyleSheet.absoluteFillObject,
    },
    modalConfirmacion__contenedor: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        paddingVertical: 28,
        paddingHorizontal: 28,
        width: '86%',
        maxWidth: 520,
        elevation: 6,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    modalConfirmacion__pregunta: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
        lineHeight: 30,
        marginBottom: 22,
    },
    modalConfirmacion__acciones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 14,
    },
    modalConfirmacion__boton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 14,
    },
    modalConfirmacion__botonCancelar: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalConfirmacion__textoCancelar: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.text,
    },
    modalConfirmacion__botonConfirmar: {
        backgroundColor: theme.colors.primary,
    },
    modalConfirmacion__textoConfirmar: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.surface,
    },
});
