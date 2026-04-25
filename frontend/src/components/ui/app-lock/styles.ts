import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
  appLock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backdrop,
    paddingHorizontal: 24,
  },

  appLock__contenedor: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  appLock__titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },

  appLock__descripcion: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    marginBottom: 18,
  },

  appLock__cargando: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },

  appLock__acciones: {
    width: '100%',
  },
});
