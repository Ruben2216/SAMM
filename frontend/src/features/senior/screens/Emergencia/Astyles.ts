import { StyleSheet, Platform } from 'react-native';

const escala = (base: number, ancho: number) => {
  const factor = ancho / 390;
  return Math.max(base * 0.88, Math.min(base * factor, base * 1.12));
};

export const createStyles = (ancho: number, alto: number) => {
  const anchoTarjeta = Math.min(ancho - 20, 460);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ECECEC',
      alignItems: 'center',
    },
    keyboardView: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
    },
    scrollContainer: {
      flexGrow: 1,
      minHeight: alto,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 0,
    },
    content: {
      width: anchoTarjeta,
      flex: 1,
      backgroundColor: '#ECECEC',
      borderRadius: 22,
      borderWidth: 1,
      borderColor: '#D8DDE5',
      paddingHorizontal: 14,
      paddingTop: Platform.OS === 'ios' ? 6 : 4,
      paddingBottom: 8,
    },
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      marginTop: 38,
    },
    botonVolver: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    espaciadorEncabezado: {
      width: 36,
      height: 36,
    },
    title: {
      fontSize: escala(16, ancho),
      fontWeight: '900',
      color: '#1E293B',
      textAlign: 'center',
      lineHeight: escala(18, ancho),
      maxWidth: 200,
    },
    formContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingBottom: 4,
      paddingTop: 14,
    },
    inputGroup: {
      marginBottom: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      color: '#1E293B',
      marginBottom: 4,
    },
    input: {
      minHeight: 44,
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 10 : 7,
      fontSize: 14,
      color: '#334155',
      backgroundColor: '#D3DAE5',
    },
    inputMultilinea: {
      minHeight: 74,
      textAlignVertical: 'top',
      paddingTop: 10,
    },
    guardarButton: {
      backgroundColor: '#14EC5C',
      borderRadius: 24,
      minHeight: 46,
      justifyContent: 'center',
      marginTop: 'auto',
      shadowColor: '#14EC5C',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 4,
    },
    guardarButtonText: {
      color: '#0F172A',
      fontSize: 21,
      fontWeight: '900',
      textAlign: 'center',
    },
  });
};