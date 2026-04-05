import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';
import { globalStyles } from '../../../../theme/globalStyles';
import { transparent } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

export const styles = StyleSheet.create({
  contenedorPantalla: {
    ...globalStyles.contenedorPantalla,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  contenidoScroll: {
    flexGrow: 1,
  },

  filaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  botonRetroceder: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    position: 'relative',
    top: 13,
    right: 10,
  },

  iconoRetroceder: {
    transform: [{ translateX: 1 }],
  },

  contenedorProgreso: {
    flex: 1,
  },

  filaOmitir: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
    marginTop: -30,
  },

  textoOmitir: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    textAlign: 'right',
  },

  titulo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 40,
    textAlign: 'center',
  },

  descripcion: {
    fontSize: 18,
    fontWeight: '400',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 27,
  },

  contenedorCodigos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },

  campoCodigo: {
    width: 55,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 40,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  campoCodigoActivo: {
    backgroundColor: '#b8e6c8',
    borderColor: theme.colors.primary,
  },

  campoCodigoInactivo: {
    backgroundColor: '#d0fbde',
    borderColor: '#f1f5f9',
  },

  enlaceDonde: {
    marginTop: 10,
    fontSize: 19.5,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },

  contenedorEnlaceDonde: {
    marginBottom: 24,
  },

  espaciadorFlexible: {
    height: 24,
  },
});
