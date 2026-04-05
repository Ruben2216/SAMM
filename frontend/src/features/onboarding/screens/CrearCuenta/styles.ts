import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
    },

    contenido: {
        flex: 1,
    },

    titulo: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text,
        marginBottom: 8,
    },

    subtitulo: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 28,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: '#334155',
    },

    input: {
        height: 55,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 18,
        marginBottom: 6,
        backgroundColor: '#fff',
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 25,
        paddingHorizontal: 18,
        height: 55,
        backgroundColor: '#fff',
        marginBottom: 6,
    },

    inputPassword: {
        flex: 1,
        color: '#334155'
    },

    iconoOjo: {
        width: 22,
        height: 22,
        tintColor: '#64748B',
    },

    error: {
        color: '#EF4444',
        fontSize: 12,
        marginBottom: 10
    },

    linkLogin: {
        textAlign: 'center',
        fontSize: 14,
        color: '#64748B',
        marginTop: 14,
    },

    link: {
        color: theme.colors.primary,
        fontWeight: '700',
    },

    terminosContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 6,
        marginBottom: 20,
        gap: 8
    },

    checkbox: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        borderRadius: 4,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },

    textoTerminos: {
        flex: 1,
        fontSize: 12,
        color: '#64748B',
        lineHeight: 18
    },

    linkTerminos: {
        color: theme.colors.primary,
        fontWeight: '600'
    },

});