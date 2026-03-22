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

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  botonRetroceder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tituloEncabezado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },

  contenedorContenido: {
    alignItems: 'center',
    marginTop: 16,
  },

  iconoCirculo: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
  },

  descripcion: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  inputContainer: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
  },

  textoInput: {
    fontSize: 16,
    color: '#1E293B',
  },

  tituloSugerencias: {
    width: '100%',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 1,
  },

  itemSugerencia: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },

  iconoMas: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  textoSugerencia: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },

  botonContinuar: {
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  textoBoton: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});