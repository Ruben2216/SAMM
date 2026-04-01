import { StyleSheet } from 'react-native';

const escala = (base: number, ancho: number) => {
  const factor = ancho / 390;
  return Math.max(base * 0.84, Math.min(base * factor, base * 1.16));
};

export const createStyles = (ancho: number, alto: number) => {
  const anchoTarjeta = Math.min(ancho - 20, 460);
  const altoMapa = Math.max(210, Math.min(alto * 0.5, 360));

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
      overflow: 'hidden',
      paddingTop: 4,
    },
    encabezado: {
      alignItems: 'center',
      paddingHorizontal: 12,
      marginBottom: 6,
      paddingTop: 38,
    },
    etiquetaAlerta: {
      backgroundColor: '#FF6A6A',
      borderRadius: 14,
      minHeight: 24,
      paddingHorizontal: 10,
      justifyContent: 'center',
      marginBottom: 4,
    },
    etiquetaAlertaTexto: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 10,
    },
    mainTitle: {
      fontSize: 16,
      fontWeight: '900',
      color: '#1E293B',
      textAlign: 'center',
      marginBottom: 1,
    },
    timeText: {
      fontSize: 12,
      color: '#64748B',
      fontWeight: '700',
    },
    mapaContenedor: {
      width: '100%',
      height: altoMapa,
      paddingHorizontal: 12,
      marginBottom: 8,
      marginTop: 4,
    },
    mapa: {
      flex: 1,
      borderRadius: 6,
    },
    panelInferior: {
      flex: 1,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 10,
      paddingTop: 12,
      paddingBottom: 14,
    },
    indicadorPanel: {
      alignSelf: 'center',
      width: 24,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: '#CBD5E1',
      marginBottom: 14,
    },
    actionsContainer: {
      flexDirection: 'row',
      columnGap: 8,
      marginBottom: 12,
      marginTop: 'auto',
    },
    actionButton: {
      flex: 1,
      minHeight: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#CBD5E1',
      backgroundColor: '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      columnGap: 6,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#1E293B',
    },
    mainActionButton: {
      minHeight: 48,
      borderRadius: 26,
      backgroundColor: '#14EC5C',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      flexDirection: 'row',
      columnGap: 6,
    },
    mainActionButtonText: {
      fontSize: 22,
      fontWeight: '900',
      color: '#0F172A',
    },
    resolveButton: {
      minHeight: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    resolveButtonText: {
      fontSize: 11,
      color: '#64748B',
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
};