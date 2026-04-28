import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contenidoScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  botonRetroceder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tituloEncabezado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  contenido: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  iconoCirculo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#d0fbde',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 34,
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 16,
    fontWeight: '400',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  contenedorCodigos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  campoCodigo: {
    width: 55,
    height: 72,
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 36,
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
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  espaciadorFlexible: {
    flex: 1,
    minHeight: 24,
  },
  textoError: {
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});
