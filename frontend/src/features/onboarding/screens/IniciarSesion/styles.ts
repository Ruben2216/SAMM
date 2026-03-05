import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 28,
        paddingTop: 60,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },

    flecha: {
        fontSize: 22,
        marginRight: 16,
    },

    barraContenedor: {
        flex: 1,
    },

    barraFondo: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
    },

    barraProgreso: {
        width: '60%',
        height: 6,
        backgroundColor: theme.colors.primary,
        borderRadius: 6,
    },

    paso: {
        textAlign: 'right',
        fontSize: 13,
        color: '#64748B',
        marginTop: 6,
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
        marginBottom: 32,
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
        marginBottom: 20,
        backgroundColor: '#fff',
    },

    botonContinuar: {
        height: 58,
        backgroundColor: theme.colors.primary,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },

    textoBoton: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },

    link: {
        textAlign: 'center',
        color: theme.colors.primary,
        marginBottom: 6,
        fontWeight: '600',
    },

    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },

    linea: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },

    dividerText: {
        marginHorizontal: 10,
        color: '#64748B',
        fontSize: 13,
    },

    botonGoogle: {
        height: 55,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fff',
    },

    iconoGoogle: {
        width: 20,
        height: 20,
    },

    textoGoogle: {
        fontSize: 16,
        fontWeight: '600',
    },

    botonVolver: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },

    iconoVolver: {
        width: 22,
        height: 22,
        tintColor: '#000',
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
        marginBottom: 20,
    },

    inputPassword: {
        flex: 1,
    },

    iconoOjo: {
        width: 22,
        height: 22,
        tintColor: '#64748B',
    },

});