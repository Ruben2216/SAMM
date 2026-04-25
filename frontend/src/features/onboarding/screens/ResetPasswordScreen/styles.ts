import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';
import { globalStyles } from '../../../../theme/globalStyles';

export const styles = StyleSheet.create({
  pantalla: {
    ...globalStyles.contenedorPantalla,
    paddingTop: 60,
  },
  encabezado: {
    ...globalStyles.mb16,
  },
  titulo: {
    ...globalStyles.titulo,
  },
  descripcion: {
    ...globalStyles.leyenda,
    marginTop: 8,
  },
  formulario: {
    ...globalStyles.mt20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1E293B',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 20,
    minHeight: 55,
    marginBottom: 6,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  iconoOjo: {
    width: 24,
    height: 24,
    tintColor: '#94A3B8',
    marginLeft: 10,
  },
  mensajeError: {
    marginBottom: 12,
    color: theme.colors.error,
    fontSize: 14,
    paddingLeft: 8,
  },
});
