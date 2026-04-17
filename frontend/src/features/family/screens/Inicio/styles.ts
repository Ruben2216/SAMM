import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Fondo general claro
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
        marginBottom: 24,
    },
    saludo: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 4,
    },
    nombreUsuario: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0F172A',
    },
    botonVincular: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F2', // Fondo rosita claro
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    textoVincular: {
        color: '#10B981', // Verde
        fontWeight: '800',
        fontSize: 14,
        marginLeft: 4,
    },
    // --- Tarjeta Principal (Adulto Mayor) ---
    tarjetaSenior: {
        backgroundColor: '#00E676', // Verde brillante
        borderRadius: 24,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#00E676',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    tarjetaSeniorTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    perfilSeniorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarSenior: {
        width: 50,
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatarSenior__imagen: {
        ...StyleSheet.absoluteFillObject,
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarTexto: {
        color: '#00E676',
        fontWeight: '900',
        fontSize: 18,
    },
    nombreSenior: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
    },
    bateriaSenior: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.9,
    },
    estadoSenior: {
        alignItems: 'flex-end',
    },
    badgeEstable: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    textoEstable: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 4,
    },
    estadoSenior__bateriaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        minWidth: 74,
    },
    estadoSenior__bateriaTexto: {
        color: '#334155',
        fontWeight: '800',
        fontSize: 12,
    },
    ubicacionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    textoUbicacion: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    infoBotonesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    botonInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 16,
        flex: 0.48, // Toma casi la mitad del espacio
        justifyContent: 'center',
    },
    textoInfo: {
        color: '#0F172A',
        fontWeight: '800',
        fontSize: 14,
        marginLeft: 8,
    },
    // --- Paginación (Puntos) ---
    paginacionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    puntoActivo: {
        width: 20,
        height: 6,
        backgroundColor: '#334155',
        borderRadius: 3,
        marginHorizontal: 3,
    },
    puntoInactivo: {
        width: 6,
        height: 6,
        backgroundColor: '#CBD5E1',
        borderRadius: 3,
        marginHorizontal: 3,
    },
    // --- Sección Gestionar Salud ---
    tituloSeccion: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardGrid: {
        width: '47%', // Para que quepan dos por fila con espacio en medio
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    iconoFondoRosa: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: '#FFF1F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    textoCardGrid: {
        color: '#334155',
        fontWeight: '700',
        fontSize: 14,
    }
});