import { StyleSheet } from 'react-native';
import { globalStyles } from '../../../../theme/globalStyles';
import { theme } from '../../../../theme';

export const styles = StyleSheet.create({
  pantalla: {
    ...globalStyles.contenedorPantalla,
    paddingTop: 24,
    justifyContent: 'center',
  },
  titulo: {
    ...globalStyles.titulo,
    textAlign: 'center',
    marginBottom: 12,
  },
  texto: {
    ...globalStyles.leyenda,
    textAlign: 'center',
    marginBottom: 24,
  },
  textoResaltado: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});
