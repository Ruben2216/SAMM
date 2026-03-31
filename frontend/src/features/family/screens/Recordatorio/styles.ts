import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // --- Encabezado ---
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  encabezado__titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },

  // --- Filtros (pestañas) ---
  contenedorFiltros: {
    backgroundColor: theme.colors.surface,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  scrollFiltros: {
    paddingHorizontal: 24,
    gap: 10,
    flexDirection: 'row',
  },
  filtro: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filtro__activo: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  filtro__texto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filtro__textoActivo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // --- Contenido de agenda ---
  areaContenido: {
    paddingHorizontal: 24,
    paddingTop: 9,
    paddingBottom: 100,
  },

  // --- Encabezado de periodo ---
  periodoPerfil: {
    paddingTop: 10,
    paddingBottom: 5,
    marginBottom: 0,
  },
  periodoPerfil__texto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },

  // --- Tarjeta de recordatorio ---
  tarjetaRecordatorio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },

  // --- Icono del tipo ---
  iconoTipo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoTipo__verde: {
    backgroundColor: '#14EC5C26',
  },
  iconoTipo__azul: {
    backgroundColor: '#EFF6FF',
  },

  // --- Contenido del item ---
  itemContenido: {
    flex: 1,
    gap: 4,
  },
  itemContenido__titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  itemContenido__tituloAlerta: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B91C1C',
  },
  itemContenido__subtituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemContenido__subtituloVerde: {
    fontSize: 13,
    fontWeight: '500',
    color: '#13EC5B',
  },
  itemContenido__subtituloRojo: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.error,
  },
  itemContenido__subtituloGris: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },

  // --- Avatar badge ---
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarBadge__texto: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  // --- FAB (Botón flotante) ---
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
