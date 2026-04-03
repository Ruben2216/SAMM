import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';
import { globalStyles } from '../../../../theme/globalStyles';

export const styles = StyleSheet.create({
  contenedorPantalla: {
    ...globalStyles.contenedorPantalla,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
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
    margin:0,
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

  textoPaso: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    minWidth: 90,
    textAlign: 'right',
  },

  filaOmitir: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
    marginTop:-30
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
    marginTop: 16,
  },

  descripcion: {
    fontSize: 18,
    fontWeight: '400',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 27,
  },

  indicativoExpiracion: {
    fontSize: 16,
    fontWeight: '400',
    color: '#475569',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },

  botonCompartir: {
    width: '100%',
    height: 64,
    backgroundColor: theme.colors.primary,
    borderRadius: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  iconoCompartir: {
    width: 36,
    height: 36,
  },

  textoBotonCompartir: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },

  contenedorCodigos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    marginTop: 24,
  },

  cajaCodigo: {
    width: 60,
    height: 80,
    backgroundColor: '#d0fbde',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCodigoCaracter: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0f172a',
  },


  iconoFlecha: {
    width: 1,
    height: 23,
  },
});
