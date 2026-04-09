import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const styles = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tecladoContenedor: {
    flex: 1,
  },
  contenedorPantalla: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contenidoScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  encabezado: {
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
  tituloEncabezado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },

  contenedorContenido: {
    flex: 1, 
    alignItems: 'center',
  },
  iconoCirculo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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

  inputContainer: {
    width: '100%',
    height: 55, 
    borderRadius: 25, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 24, 
    backgroundColor: '#fff',
  },
  textoInput: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
  },

  tituloSugerencias: {
    width: '100%',
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
  },

  itemSugerencia: {
    width: '100%',
    height: 55, 
    borderRadius: 25, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  iconoMas: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textoIconoMas: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  textoSugerencia: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
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