import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Contenedor principal
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  botonAtras: {
    padding: 5,
  },
  tituloHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Contenido
  contenido: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  tituloSecundario: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },

  // Ruleta (selector de hora)
  selectorContainer: {
    width: '100%',
    height: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    position: 'relative',
  },

  pillFondo: {
    position: 'absolute',
    top: 60,
    width: '100%',
    height: 60,
    backgroundColor: '#D1FAE5',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  textoRuleta: {
    fontSize: 22,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  textoRuletaActivo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Separador ( :)
  separadorContainer: {
    width: 30,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separadorTexto: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    paddingBottom: 5,
  },

  // AM / PM
  amPmSelector: {
    position: 'absolute',
    right: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  amPmTexto: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Switch
  switchContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    padding: 20,
  },
  switchTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 12,
    color: '#64748B',
  },

  // Footer
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  botonConfirmar: {
    height: 55,
    borderRadius: 28,
    backgroundColor: '#00E676',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  textoBoton: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 8,
  },
});