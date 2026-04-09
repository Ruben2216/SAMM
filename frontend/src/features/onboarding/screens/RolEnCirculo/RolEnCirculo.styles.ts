import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contenedorPantalla: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contenidoScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  filaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  botonRetroceder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8, 
  },
  textoHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },

  contenido: {
    flex: 1, 
  },

  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },

  listaOpciones: {
    gap: 10,
  },

  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 25, 
    height: 55, 
    paddingHorizontal: 18,
    backgroundColor: '#fff',
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
    borderColor: '#CBD5E1', 
    marginRight: 12,
  },
  radioSeleccionado: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },

  textoOpcion: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },

  botonContinuar: {
    width: '100%',
    height: 55,
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  textoBoton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
});