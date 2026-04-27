import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

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

  contenido: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  tituloSecundario: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  // Tarjetas de hora
  tarjetaHora: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  tarjetaHoraIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tarjetaHoraLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tarjetaHoraValor: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Sección días de la semana
  seccionDias: {
    marginTop: 10,
  },
  seccionDiasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  seccionDiasTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  seccionDiasTodos: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  seccionDiasSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipDia: {
    minWidth: 52,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  chipDiaActivo: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  chipDiaTexto: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  chipDiaTextoActivo: {
    color: '#0F172A',
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
