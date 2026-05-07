import { API_URLS } from '../config/api';

export function construirUrlAvatar(urlAvatar?: string | null, baseUrl: string = API_URLS.identity): string {
  const ruta = (urlAvatar ?? '').trim();
  if (!ruta) return '';
  if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;

  const baseNormalizada = (baseUrl ?? '').trim().replace(/\/$/, '');
  if (!baseNormalizada) return ruta;

  return `${baseNormalizada}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}