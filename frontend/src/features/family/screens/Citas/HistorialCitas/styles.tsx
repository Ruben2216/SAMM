import { StyleSheet } from 'react-native';

export const citasStyles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },

  botonAtras: {
    padding: 5,
  },

  tituloHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  textosTop: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  tituloSecundario: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  descripcion: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },

  estadoVacio: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },

  estadoVacio__texto: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
});