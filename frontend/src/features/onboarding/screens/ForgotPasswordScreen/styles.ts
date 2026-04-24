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
  mensajeError: {
    marginTop: 12,
    color: theme.colors.error,
    fontSize: 14,
  },
  link: {
    marginTop: 18,
    alignSelf: 'center',
  },
  textoLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
