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
    justifyContent: 'space-between',
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
  encabezado__botonAgregar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  areaContenido: {
    paddingBottom: 30,
  },

  // --- Sección ---
  seccionGestionar: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  seccionEncabezadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  seccionConteo: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
  },

  // --- Tarjeta de Perfil (item de lista + expandible) ---
  tarjetaPerfil: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  tarjetaPerfil__encabezadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tarjetaPerfil__avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjetaPerfil__avatarTexto: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  tarjetaPerfil__info: {
    flex: 1,
  },
  tarjetaPerfil__nombre: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  tarjetaPerfil__meta: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 2,
  },
  botonLlamar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Sección Expandida ---
  seccionExpandida: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },

  // --- Estadísticas de Salud ---
  estadisticasSalud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  estadistica: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  estadistica__etiqueta: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  estadistica__valor: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  estadistica__valorBold: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  estadistica__valorAlerta: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.error,
  },
  estadistica__divisor: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },

  // --- Batería ---
  estadoBateria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  estadoBateria__texto: {
    fontSize: 12,
    fontWeight: '400',
    color: '#475569',
  },

  // --- Botones de Acción ---
  botonesAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  botonPrimario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  botonPrimario__texto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  botonSecundario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  botonSecundario__texto: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // --- Botón Editar ---
  botonEditar: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  botonEditar__texto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },

  // --- Campos Editables ---
  campoEditable: {
    marginBottom: 12,
  },
  campoEditable__etiqueta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  campoEditable__input: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  campoEditable__inputActivo: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },

  // --- Botones de Edición ---
  botonesEdicion: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  botonGuardar: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  botonGuardar__texto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  botonCancelar: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  botonCancelar__texto: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  // --- Indicador de expansión ---
  indicadorExpandir: {
    alignItems: 'center',
    marginTop: 8,
  },
});
