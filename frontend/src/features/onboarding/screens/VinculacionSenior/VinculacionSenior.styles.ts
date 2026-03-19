import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';
import { globalStyles } from '../../../../theme/globalStyles';

export const styles = StyleSheet.create({
  contenedorPantalla: {
    ...globalStyles.contenedorPantalla,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },

  seccionEncabezado: {
    marginTop: 20,
    marginBottom: 24,
  },

  contenedorProgreso: {
    marginBottom: 16,
  },

  textoOmitir: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    textAlign: 'right',
  },

  titulo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 40,
    textAlign: 'center',
  },

  descripcion: {
    fontSize: 18,
    fontWeight: '400',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 27,
  },

  contenedorCodigos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },

  contenedorFlecha: {
    marginBottom: 12,
  },

  iconoFlecha: {
    width: 23,
    height: 23,
  },

  enlaceDonde: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
