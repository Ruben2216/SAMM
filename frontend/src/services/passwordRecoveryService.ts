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
    let mensaje = 'No se pudo solicitar la recuperación. Intenta de nuevo.';
    if (error?.response?.data?.detail) {
      mensaje = Array.isArray(error.response.data.detail) 
        ? error.response.data.detail[0].msg 
        : error.response.data.detail;
    } else if (error?.message) {
      mensaje = error.message;
    }
    return { exito: false, mensaje: String(mensaje) };
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
    let mensaje = 'No se pudo restablecer la contraseña. Intenta de nuevo.';
    if (error?.response?.data?.detail) {
      mensaje = Array.isArray(error.response.data.detail) 
        ? error.response.data.detail[0].msg 
        : error.response.data.detail;
    } else if (error?.message) {
      mensaje = error.message;
    }
    return { exito: false, mensaje: String(mensaje) };
  }
}
