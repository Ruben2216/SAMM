import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Contenedor principal
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
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

  // Contenido
  scrollContenido: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    marginBottom: 24,
  },

  // Inputs
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

  // Radios personalizados
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },

  // Estados de radio
  radioItemActivoUna: {
    borderColor: '#00E676',
    backgroundColor: '#F0FDF4',
  },
  radioItemActivoDos: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  radioItemActivoNecesario: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },

  radioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  radioSub: {
    fontSize: 12,
    color: '#64748B',
  },
  textoActivo: {
    color: '#0F172A',
  },
  circuloExterior: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },

  // Footer
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