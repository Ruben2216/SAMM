import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 30,
  },

  etiquetaPaso: {
    textAlign: 'right',
    fontSize: 13,
    color: '#666',
    marginTop: 34,
    marginBottom: 8,
    fontWeight: '500',
  },

  pistaProgreso: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  rellenoProgreso: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
});
