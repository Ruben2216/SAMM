import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

const convertirHexArgb = (colorHex: string, alpha: number) => {
  if (!colorHex.startsWith('#') || colorHex.length !== 7) {
    return colorHex;
  }

  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const colorSeparador = convertirHexArgb(theme.colors.error, 0.12);
const colorErrorSuave = convertirHexArgb(theme.colors.error, 0.12);
const colorPrimarioSuave = convertirHexArgb(theme.colors.primary, 0.18);
const colorErrorMuySuave = convertirHexArgb(theme.colors.error, 0.08);

export const styles = StyleSheet.create({
  perfil: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  perfil__contenido: {
    paddingBottom: 20,
  },

  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },

  encabezado__titulo: {
    fontSize: 23,
    fontWeight: '800',
    color: theme.colors.text,
  },

  encabezado__accion: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary,
  },

  contenido: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  tarjetaPerfil: {
    marginTop: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: 24,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },

  tarjetaPerfil__contenedorAvatar: {
    position: 'relative',
    marginBottom: 8,
  },

  tarjetaPerfil__avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colorErrorSuave,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
    overflow: 'hidden',
  },

  tarjetaPerfil__bordeAvatar: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },

  tarjetaPerfil__imagenAvatar: {
    ...StyleSheet.absoluteFillObject,
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  tarjetaPerfil__textoAvatar: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
  },

  tarjetaPerfil__botonEditar: {
    position: 'absolute',
    right: -6,
    bottom: 6,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tarjetaPerfil__nombre: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 6,
  },

  tarjetaPerfil__correo: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 6,
  },

  tarjetaPerfil__badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  tarjetaPerfil__badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: 0.8,
  },

  tituloSeccion: {
    marginTop: 28,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },

  tarjetaSeccion: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },

  fila__separador: {
    borderBottomWidth: 2,
    borderBottomColor: colorSeparador,
  },

  filaFamilia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  filaFamilia__izquierda: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  filaFamilia__avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  filaFamilia__avatarYo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  filaFamilia__textoAvatar: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },

  filaFamilia__textoAvatarYo: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },

  filaFamilia__texto: {
    flexDirection: 'column',
  },

  filaFamilia__nombre: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  filaFamilia__rol: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  filaFamilia__badgePrincipal: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colorPrimarioSuave,
  },

  filaFamilia__badgePrincipalTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
  },

  filaFamilia__badgeColaborador: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colorErrorMuySuave,
  },

  filaFamilia__badgeColaboradorTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  filaAccion: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filaAccion__texto: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },

  filaNotificacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  filaNotificacion__texto: {
    flex: 1,
    paddingRight: 12,
  },

  filaNotificacion__titulo: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },

  filaNotificacion__descripcion: {
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  filaSupervision: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  filaSupervision__texto: {
    flex: 1,
    paddingRight: 12,
  },

  filaSupervision__titulo: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },

  filaSupervision__descripcion: {
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  filaSupervision__selector: {
    width: 130,
    height: 60,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  menuSupervision: {
    width: 130,
  },

  menuSupervision__contenido: {
    backgroundColor: theme.colors.background,
    width: 130,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    paddingVertical: 0,
  },

  menuSupervision__item: {
    minHeight: 44,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },

  menuSupervision__itemSeparador: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },

  menuSupervision__itemTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },

  filaSupervision__selectorTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },

  filaSeguridad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  filaSeguridad__titulo: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  filaBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  filaBoton__texto: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  pie: {
    marginTop: 28,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },

  pie__version: {
    fontSize: 11,
    fontWeight: '400',
    color: theme.colors.placeholder,
  },

  pie__enlace: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.text,
    textDecorationLine: 'underline',
  },
});