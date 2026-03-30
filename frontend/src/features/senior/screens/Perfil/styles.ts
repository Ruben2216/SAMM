import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#F8FAFC', 
    },
    scrollContenido: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    // --- Header ---
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    botonIcono: {
        padding: 5,
    },
    tituloHeader: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },
    // --- Tarjeta de Perfil Principal ---
    tarjetaPerfil: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 10,
        marginBottom: 35,
    },
    avatarContenedor: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#68E180', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    nombreUsuario: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 6,
    },
    edadUsuario: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    // --- Seccion Títulos ---
    seccionTituloRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    tituloSeccion: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginLeft: 10,
    },
    // --- Datos de Salud ---
    saludGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 35,
    },
    tarjetaSalud: {
        flex: 0.48, 
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 30,
        paddingVertical: 20,
        alignItems: 'center',
    },
    saludLabel: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '600',
        marginBottom: 8,
    },
    saludValor: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0F172A',
    },
    // --- Tarjeta Cuidador ---
    tarjetaCuidador: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ECFDF5', 
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 30,
        padding: 20,
    },
    infoCuidadorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCuidador: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    nombreCuidador: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    rolCuidador: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    botonLlamar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#68E180',
        justifyContent: 'center',
        alignItems: 'center',
    }
});