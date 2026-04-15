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
    paddingBottom: 30,
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
  tarjetaPerfil__avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colorErrorSuave,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
    position: 'relative',
    marginBottom: 8,
  },
  tarjetaPerfil__bordeAvatar: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  tarjetaPerfil__textoAvatar: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
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
  filaFamilia__avatarYo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  filaFamilia__textoAvatarYo: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  filaFamilia__textoAvatar: {
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
    color: theme.colors.textSecondary,
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
  filaSupervision: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  filaSupervision__texto: {
    flex: 1,
  },
  filaSupervision__titulo: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filaSupervision__descripcion: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  inputStyle: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  filaAccion: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  filaAccion__texto: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.error,
  },
  pie: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 10,
  },
  pie__version: {
    fontSize: 11,
    color: theme.colors.placeholder,
  },
});