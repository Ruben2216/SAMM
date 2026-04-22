import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../../../../theme';

export const themeColors = {
  primary: theme.colors.primary,
  error: theme.colors.error,
  surface: theme.colors.surface,
  border: '#E2E8F0',
  textDark: '#0F172A',
  textGray: '#64748B',
};

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

  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },

  botonGuardar: {
    height: 55,
    borderRadius: 28,
    backgroundColor: '#00E676',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E676',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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

export const formStyles = StyleSheet.create({
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

  campoContenedor: {
    marginBottom: 20,
  },

  etiqueta: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },

  inputContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    height: 55,
  },

  inputContenedorMultilinea: {
    height: 100,
    borderRadius: 20,
    alignItems: 'flex-start',
    paddingTop: 15,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },

  inputMultilinea: {
    textAlignVertical: 'top',
    minHeight: 90,
  },

  textoError: {
    color: themeColors.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: -10,
    marginBottom: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContenido: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },

  modalTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },

  modalOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    marginBottom: 10,
  },

  modalOpcionActiva: {
    borderColor: '#00E676',
    backgroundColor: '#F0FDF4',
  },

  modalOpcionTexto: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },

  modalOpcionTextoActiva: {
    color: '#0F172A',
    fontWeight: '800',
  },

  modalCerrar: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: '#EF4444',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  modalCerrarTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  modalErrorContenido: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 32,
    borderRadius: 20,
    padding: 24,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
  },

  modalErrorIcono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  modalErrorTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },

  modalErrorMensaje: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },

  modalErrorBoton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },

  modalErrorBotonTexto: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14,
  },
});