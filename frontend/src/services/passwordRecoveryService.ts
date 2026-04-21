/**
 * Servicio de recuperación de contraseña
 * Orquesta llamadas HTTP al backend (identity-service).
 */
import httpClient from './httpService';

export async function solicitarRecuperacion(correo: string): Promise<{ exito: boolean; mensaje: string }>{
  try {
    const response = await httpClient.post('/auth/forgot-password', { correo });
    const mensaje = (response.data?.mensaje as string) || 'Solicitud enviada.';
    return { exito: true, mensaje };
  } catch (error: any) {
    const mensaje =
      error?.response?.data?.detail ||
      error?.message ||
      'No se pudo solicitar la recuperación. Intenta de nuevo.';
    return { exito: false, mensaje };
  }
}

export async function restablecerContrasena(
  token: string,
  nueva_contrasena: string
): Promise<{ exito: boolean; mensaje: string }>{
  try {
    const response = await httpClient.post('/auth/reset-password', { token, nueva_contrasena });
    const mensaje = (response.data?.mensaje as string) || 'Contraseña actualizada.';
    return { exito: true, mensaje };
  } catch (error: any) {
    const mensaje =
      error?.response?.data?.detail ||
      error?.message ||
      'No se pudo restablecer la contraseña. Intenta de nuevo.';
    return { exito: false, mensaje };
  }
}
