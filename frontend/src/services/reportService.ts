/**
 * frontend/src/services/reportService.ts
 *
 * CORRECCION: el campo telefono ya no usa correo como fallback.
 * El identity-service no expone telefono directamente, asi que
 * se deja vacio y PersonCard lo maneja con un Alert informativo.
 * Cuando el identity-service agregue el campo telefono, solo hay
 * que leerlo aqui: data.Telefono ?? ''
 */

import { PersonReport } from '../features/family/screens/Mapa/mapa.types';
import { API_URLS } from '../config/api';

const TRACKING_API_URL = API_URLS.tracking;
const IDENTITY_API_URL = API_URLS.identity;

const _perfilCache: Record<number, { nombre: string; foto: string; telefono: string }> = {};

async function obtenerPerfilAdulto(
  idAdultoMayor: number
): Promise<{ nombre: string; foto: string; telefono: string }> {

  if (_perfilCache[idAdultoMayor]) {
    return _perfilCache[idAdultoMayor];
  }

  try {
    const res = await fetch(
      `${IDENTITY_API_URL}/users/internal/perfil/${idAdultoMayor}`
    );

    if (res.ok) {
      const data = await res.json();

      let fotoUrl: string | null = data.url_Avatar ?? null;
      if (fotoUrl) {
        if (!fotoUrl.startsWith('http://') && !fotoUrl.startsWith('https://')) {
          // Relativa → prependemos IDENTITY_API_URL (igual que httpClient.baseURL en Perfil)
          fotoUrl = `${IDENTITY_API_URL}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`;
        }
      }

      const perfil = {
        nombre:   data.Nombre   ?? `Usuario ${idAdultoMayor}`,
        foto:     fotoUrl ?? null,   // null en vez de pravatar
        telefono: data.Telefono ?? '',
      };

      _perfilCache[idAdultoMayor] = perfil;
      return perfil;
    }
  } catch (err: any) {
    console.warn(`[Mapa] No se pudo obtener perfil de usuario ${idAdultoMayor}:`, err?.message);
  }

  return {
    nombre:   `Usuario ${idAdultoMayor}`,
    foto:     `https://i.pravatar.cc/150?u=${idAdultoMayor}`,
    telefono: '',
  };
}

export async function getReports(idFamiliar: number): Promise<PersonReport[]> {
  const url = `${TRACKING_API_URL}/rastreo/familiar/${idFamiliar}/mapa`;
  console.log('[Mapa] Consultando:', url);

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.warn('[Mapa] Backend respondio con error:', res.status);
      return [];
    }

    const data = await res.json();
    const adultos: any[] = data.adultos_mayores ?? [];
    const conUbicacion = adultos.filter((a) => a.ultima_ubicacion !== null);

    const reportes = await Promise.all(
      conUbicacion.map(async (adulto) => {
        const ultima = adulto.ultima_ubicacion;
        const perfil = await obtenerPerfilAdulto(adulto.Id_Adulto_Mayor);

        return {
          id:       String(adulto.Id_Adulto_Mayor),
          nombre:   perfil.nombre,
          foto:     perfil.foto,
          telefono: perfil.telefono,
          estado:   adulto.Activo ? 'activo' : 'inactivo',
          direccion: 'Ultima ubicacion registrada',
          lat: ultima ? parseFloat(ultima.Latitud)  : 0,
          lng: ultima ? parseFloat(ultima.Longitud) : 0,
          ultimaActualizacion: ultima
            ? new Date(ultima.Fecha_Hora).toLocaleTimeString('es-MX', {
                hour: '2-digit', minute: '2-digit',
              })
            : 'Sin reporte aun',
          rastreoActivo: adulto.Activo ?? false,
        } as PersonReport;
      })
    );

    return reportes;

  } catch (error: any) {
    console.error('[Mapa] Error de red:', error?.message);
    return [];
  }
}

export async function getHistorialUbicaciones(
  idAdultoMayor: number
): Promise<Array<{ lat: number; lng: number; fecha: string }>> {
  try {
    const res = await fetch(
      `${TRACKING_API_URL}/rastreo/adulto/${idAdultoMayor}/ubicaciones`
    );
    if (!res.ok) return [];
    const lista: any[] = await res.json();
    return lista.map((u) => ({
      lat:   parseFloat(u.Latitud),
      lng:   parseFloat(u.Longitud),
      fecha: u.Fecha_Hora,
    }));
  } catch {
    return [];
  }
}