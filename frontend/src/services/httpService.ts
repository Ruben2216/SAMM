/**
frontend/src/services/httpService.ts
 * Servicio HTTP — Cliente Axios preconfigurado
 * Base URL configurable, interceptor de Authorization, logging.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ;

console.log('[httpService] Base URL configurada:', BASE_URL);

const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Variable para almacenar el token actual
let tokenActual: string | null = null;

/**
 * Configura el token JWT para todas las requests siguientes
 */
export function setAuthToken(token: string | null): void {
    tokenActual = token;
    console.log('[httpService] Token de autenticación', token ? 'configurado' : 'eliminado');
}

// Interceptor de request — agrega Authorization header
httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (tokenActual && config.headers) {
            config.headers.Authorization = `Bearer ${tokenActual}`;
        }
        console.log(`[httpService] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[httpService] Error en request:', error.message);
        return Promise.reject(error);
    }
);

// Interceptor de response — logging
httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`[httpService] Respuesta ${response.status} de ${response.config.url}`);
        return response;
    },
    (error) => {
        // Requests canceladas (por navegación/logout) no deberían ensuciar la consola.
        if (error?.code === 'ERR_CANCELED' || axios.isCancel?.(error)) {
            return Promise.reject(error);
        }

        if (error.response) {
            const status = error.response.status;
            const detalle = error.response.data?.detail || error.message;

            // 401 suele ocurrir al cerrar sesión o cuando el token expira.
            // Evitamos `console.error` para que no aparezca LogBox.
            if (status === 401) {
                if (tokenActual) {
                    console.warn(`[httpService] Error 401:`, detalle);
                } else {
                    console.log('[httpService] 401 (sin sesión):', detalle);
                }
                return Promise.reject(error);
            }

            console.error(`[httpService] Error ${status}:`, detalle);
        } else {
            console.error('[httpService] Error de red:', error.message);
        }
        return Promise.reject(error);
    }
);

export default httpClient;
