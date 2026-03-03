import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import { globalStyles } from '../../../theme/globalStyles';

export const styles = StyleSheet.create({
  tarjeta: {
    ...globalStyles.sombraTarjeta,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 140,
    overflow: 'visible',
  },

  tarjetaSeleccionada: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },

  circuloIcono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagenIcono: {
    width: 50,
    height: 50,
  },

  contenidoTarjeta: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },

  tituloTarjeta: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },

  descripcionTarjeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
