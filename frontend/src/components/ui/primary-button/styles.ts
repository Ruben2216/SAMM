import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
  boton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },

  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icono: {
    marginRight: 12,
  },

  botonAnchoCompleto: {
    width: '100%',
  },

  botonDeshabilitado: {
    backgroundColor: theme.colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  textoBoton: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },

  textoBotonDeshabilitado: {
    color: '#666',
  },
});
