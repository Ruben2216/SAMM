import { API_URLS } from '../config/api';

const NOTIFICATION_API_URL =
  process.env.EXPO_PUBLIC_API_URL_NOTIFICACIONES || 'http://192.168.0.17:8002';

const TRACKING_API_URL = API_URLS.tracking;

const mapaMinutosPorEtiqueta: Record<string, number> = {
  '15 minutos': 15,
  '30 minutos': 30,
  '45 minutos': 45,
  '1 hora': 60,
};

const convertirEtiquetaAMinutos = (etiqueta: string): number => {
  return mapaMinutosPorEtiqueta[etiqueta] ?? 15;
};

export const sincronizarConfiguracionSupervision = async (params: {
  idFamiliar: number;
  idsAdultosMayores: number[];
  frecuenciaEtiqueta: string;
  tiempoMaxEtiqueta: string;
}): Promise<void> => {
  const {
    idFamiliar,
    idsAdultosMayores,
    frecuenciaEtiqueta,
    tiempoMaxEtiqueta,
  } = params;

  const frecuenciaMinutos = convertirEtiquetaAMinutos(frecuenciaEtiqueta);
  const tiempoMaxSinReporteMinutos = convertirEtiquetaAMinutos(tiempoMaxEtiqueta);

  const promesasConfiguracionAdultos = idsAdultosMayores.map(async (idAdultoMayor) => {
    const respuesta = await fetch(`${TRACKING_API_URL}/rastreo/configuracion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Id_Familiar: idFamiliar,
        Id_Adulto_Mayor: idAdultoMayor,
        Frecuencia_Minutos: frecuenciaMinutos,
      }),
    });

    if (!respuesta.ok) {
      const errorTexto = await respuesta.text();
      throw new Error(
        `No se pudo guardar frecuencia para adulto ${idAdultoMayor}: ${respuesta.status} ${errorTexto}`,
      );
    }
  });

  const promesaConfigSupervision = fetch(`${NOTIFICATION_API_URL}/supervision/configuracion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_familiar: idFamiliar,
      frecuencia_minutos: frecuenciaMinutos,
      tiempo_max_sin_reporte_minutos: tiempoMaxSinReporteMinutos,
    }),
  }).then(async (respuesta) => {
    if (!respuesta.ok) {
      const errorTexto = await respuesta.text();
      throw new Error(
        `No se pudo guardar configuración de supervisión: ${respuesta.status} ${errorTexto}`,
      );
    }
  });

  await Promise.all([promesaConfigSupervision, ...promesasConfiguracionAdultos]);
};
