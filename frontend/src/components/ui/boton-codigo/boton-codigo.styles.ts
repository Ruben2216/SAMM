import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
  contenedorBoton: {
    width: 55,
    height: 72,
    backgroundColor: '#d0fbde',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  contenedorBoton__activo: {
    backgroundColor: '#b8e6c8',
    borderColor: theme.colors.primary,
  },

  contenedorInterior: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoValor: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
});
