import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
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
  scrollContenido: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  descripcion: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  labelOpcional: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputArea: {
    height: 100,
    borderRadius: 20,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  botonGuardar: {
    height: 55,
    borderRadius: 28,
    backgroundColor: '#00E676',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  textoBoton: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 8,
  },
});