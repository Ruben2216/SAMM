import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../../../theme';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  seccionHero: {
    flex: 1.2,
    position: 'relative',
    overflow: 'hidden',
  },

  mapa: {
    flex: 1,
  },

  hojaInferior: {
    paddingHorizontal: 32,
    paddingTop: 32,
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

  contenedorPuntos: {
    flexDirection: 'row',
    margin:0,
    padding:0,
    gap: 10,
  },

  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },

  puntoActivo: {
    width: 40,
    backgroundColor: theme.colors.primary,
  },

  titulo: {
    fontSize: 34,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 40,
  },

  subtitulo: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
    maxWidth: 280,
  }, 

  botonInicio: {
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

  textoBotonInicio: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },

  iconoFlecha: {
    width: 26,
    height: 26,
    tintColor: theme.colors.text,
  },

  contenedorEnlacePie: {
    marginTop: 22,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  enlacePie: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
