import { StyleSheet } from 'react-native';

const escala = (base: number, ancho: number) => {
  const factor = ancho / 390;
  return Math.max(base * 0.84, Math.min(base * factor, base * 1.16));
};

export const createStyles = (ancho: number, alto: number) => {
  const anchoTarjeta = Math.min(ancho - 20, 460);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ECECEC',
      alignItems: 'center',
    },
    screen: {
      width: anchoTarjeta,
      flex: 1,
      backgroundColor: '#ECECEC',
      borderRadius: 22,
      borderWidth: 1,
      borderColor: '#D8DDE5',
      paddingHorizontal: 12,
      paddingVertical: 12,
      justifyContent: 'space-between',
    },
    centroContenido: {
      alignItems: 'center',
      paddingTop: Math.max(14, alto * 0.06),
    },
    anilloExterior: {
      width: 130,
      height: 130,
      borderRadius: 65,
      borderWidth: 1,
      borderColor: '#F7BAC0',
      backgroundColor: '#F4DFE2',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    anilloInterior: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#FF5A5A',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FF5A5A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    alertText: {
      fontSize: 16,
      fontWeight: '900',
      color: '#1E293B',
      textAlign: 'center',
      marginBottom: 6,
    },
    notificationText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#64748B',
      textAlign: 'center',
      marginBottom: 10,
    },
    locationContainer: {
      backgroundColor: '#F2DEE3',
      borderRadius: 14,
      paddingHorizontal: 12,
      minHeight: 28,
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 4,
    },
    locationText: {
      fontSize: 10,
      color: '#64748B',
      fontWeight: '700',
    },
    pieAcciones: {
      width: '100%',
      paddingBottom: 4,
    },
    contactContainer: {
      width: '100%',
      minHeight: 64,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#CBD5E1',
      backgroundColor: '#F3F4F6',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    avatarContainer: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#D8DDE5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    avatarText: {
      fontSize: 14,
      fontWeight: '900',
      color: '#64748B',
    },
    contactInfo: {
      flex: 1,
    },
    contactName: {
      fontSize: 16,
      fontWeight: '900',
      color: '#1E293B',
      marginBottom: 1,
    },
    contactStatus: {
      fontSize: 12,
      color: '#1DB954',
      fontWeight: '700',
    },
    callButton: {
      minHeight: 48,
      borderRadius: 26,
      backgroundColor: '#14EC5C',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      flexDirection: 'row',
      columnGap: 6,
      shadowColor: '#14EC5C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    callButtonText: {
      fontSize: 22,
      fontWeight: '900',
      color: '#0F172A',
    },
    cancelButton: {
      minHeight: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#64748B',
      textDecorationLine: 'underline',
    },
    enlaceSeguimiento: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      minHeight: 26,
    },
    enlaceSeguimientoTexto: {
      fontSize: 10,
      color: '#94A3B8',
      fontWeight: '700',
    },
  });
};