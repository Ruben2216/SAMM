import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../../../theme';

export const themeColors = {
  primary: theme.colors.primary,
  background: '#FFFFFF',
  surface: theme.colors.surface,
  cardBg: theme.colors.surface,
  textDark: '#0F172A',
  text: theme.colors.text,
  textGray: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  error: theme.colors.error,
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

  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 10,
  },

  radioItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },

  radioItemActivo: {
    borderColor: '#00E676',
    backgroundColor: '#D1FAE5',
  },

  radioTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  textoActivo: {
    color: '#0F172A',
    fontWeight: '700',
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