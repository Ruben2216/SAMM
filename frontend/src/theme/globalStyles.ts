import { StyleSheet } from 'react-native';
import { theme } from './index';

/**
 * Estilos globales reutilizables en toda la aplicación
 * Evita duplicación de estilos estructurales comunes
 */
export const globalStyles = StyleSheet.create({
  // Contenedores principales
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 8,
  },

  softShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8, 
  },

  // Textos comunes
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },

  body: {
    fontSize: 15,
    lineHeight: 21,
    color: '#555',
  },

  caption: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  // Espaciados
  mb16: {
    marginBottom: 16,
  },

  mb24: {
    marginBottom: 24,
  },

  mb32: {
    marginBottom: 32,
  },

  mt20: {
    marginTop: 20,
  },

  mt30: {
    marginTop: 30,
  },
});
