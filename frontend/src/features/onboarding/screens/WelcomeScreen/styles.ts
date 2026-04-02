import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  vistaDesplazable: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  contenedor: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 12,
  },

  seccionEncabezado: {
    marginBottom: 30,
  },

  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },

  descripcion: {
    fontSize: 15,
    lineHeight: 21,
    color: '#555',
  },

  contenedorTarjetas: {
    gap: 30,
    marginBottom: 50,
    overflow: 'visible',
  },

  contenedorBotonSafeArea: {
    marginTop: 'auto',
    paddingBottom: 12,
  },

  contenedorBoton: {
    marginBottom: 16,
  },
});
