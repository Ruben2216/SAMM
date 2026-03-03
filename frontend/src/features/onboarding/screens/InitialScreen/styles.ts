import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../../../theme';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  // Sección del mapa
  heroSection: {
    flex: 1.2,
    position: 'relative',
    overflow: 'hidden',
  },

  map: {
    flex: 1,
  },

  // Bottom Sheet con glassmorphism
  bottomSheet: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Indicadores de progreso
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },

  dotActive: {
    width: 40,
    backgroundColor: theme.colors.primary,
  },

  // Textos
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 40,
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
    maxWidth: 280,
  },

  // Botón de inicio
  startButton: {
    width: '100%',
    height: 68,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },

  arrowIcon: {
    width: 26,
    height: 26,
    tintColor: theme.colors.text,
  },

  // Footer
  footerLinkContainer: {
    marginTop: 22,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
