import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';
import { globalStyles } from '../../../../theme/globalStyles';

export const styles = StyleSheet.create({
  contenedorPantalla: {
    ...globalStyles.contenedorPantalla,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  filaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  botonRetroceder: {
    marginRight: 12,
  },

  textoHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },

  contenido: {
    flex: 1,
  },

  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },

  descripcion: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },

  listaOpciones: {
    gap: 14,
  },

  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },

  opcionSeleccionada: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0FDF4',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5F5',
    marginRight: 12,
  },

  radioSeleccionado: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },

  textoOpcion: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },

  botonContinuar: {
    width: '100%',
    height: 56,
    backgroundColor: '#22C55E',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },

  botonDeshabilitado: {
    backgroundColor: '#A7F3D0',
  },

  textoBoton: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});