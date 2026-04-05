import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.backdrop,
    },

    modal__fondoCerrable: {
        ...StyleSheet.absoluteFillObject,
    },

    modal__contenedor: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    modal__titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 20,
    },

    modal__encabezado: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'center',
    },

    modal__iconoInfo: {
        marginRight: 12,
    },

    modal__textoIntroduccion: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 24,
    },

    modal__lista: {
        marginBottom: 32,
    },

    modal__itemLista: {
        flexDirection: 'row',
        marginBottom: 16,
    },

    modal__numeroItem: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginRight: 12,
        width: 20,
    },

    modal__textoItem: {
        fontSize: 16,
        color: theme.colors.text,
        flex: 1,
        lineHeight: 24,
    },

    modal__boton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 48,
        gap: 1,
    },

    modal__textoBoton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginRight: 8,
    },
});
