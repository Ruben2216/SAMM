/**
 * Store de Autenticación — Zustand
 * Maneja el estado global de autenticación: login con Google, login manual, registro.
 * Persiste el JWT en expo-secure-store.
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { NativeModules, Platform } from 'react-native';
import httpClient, { setAuthToken } from '../../services/httpService';
import { signOutGoogle } from '../../services/googleAuthService';
import { registrarParaNotificaciones } from '../../services/notificationService';
import { useFamilyPreferencesStore } from '../../store/useFamilyPreferencesStore';

// ===================== Tipos =====================

export interface Usuario {
    Id_Usuario: number;
    Nombre: string;
    Correo: string;
    Proveedor_Auth: string;
    Rol: string | null;
    Codigo_Vinculacion?: string | null;
    Activo: boolean;
    url_Avatar?: string | null;
    sexo?: 'Hombre' | 'Mujer' | 'Otro';
}

export interface ResultadoLogin {
    exito: boolean;
    es_nuevo: boolean;
    mensaje?: string;
}

interface DatosRegistro {
    nombre: string;
    correo: string;
    contrasena: string;
    rol: string;
    sexo: 'Hombre' | 'Mujer' | 'Otro';
}

interface AuthState {
    usuario: Usuario | null;
    token: string | null;
    autenticado: boolean;
    cargando: boolean;

    loginConGoogle: (idToken: string) => Promise<ResultadoLogin>;
    loginConCredenciales: (correo: string, contrasena: string) => Promise<ResultadoLogin>;
    registrar: (datos: DatosRegistro) => Promise<ResultadoLogin>;
    asignarRol: (rol: 'familiar' | 'adulto_mayor') => Promise<ResultadoLogin>;
    actualizarAvatar: (imagenBase64: string, mimeType?: string) => Promise<{ exito: boolean; mensaje?: string }>;
    eliminarAvatar: () => Promise<{ exito: boolean; mensaje?: string }>;
    cerrarSesion: () => Promise<void>;
    cargarSesionGuardada: () => Promise<void>;
}

// Claves para SecureStore
const TOKEN_KEY = 'samm_auth_token';
const USUARIO_KEY = 'samm_auth_usuario';

const moduloDispositivo = NativeModules.SAMMDeviceToken;

async function prepararReporteBackgroundDeBateria(rolUsuario: string | null): Promise<void> {
    if (Platform.OS !== 'android') return;
    if (rolUsuario !== 'adulto_mayor') return;
    if (!moduloDispositivo?.obtenerTokenDispositivo || !moduloDispositivo?.guardarTokenDispositivo) return;

    try {
        const tokenExistente = (await moduloDispositivo.obtenerTokenDispositivo()) as string | null;
        if (tokenExistente) {
            if (moduloDispositivo?.iniciarServicioBateria) {
                await moduloDispositivo.iniciarServicioBateria();
            }
            return;
        }

        const response = await httpClient.post('/devices/registro');
        const tokenDispositivo = response.data?.token_dispositivo as string | undefined;
        if (!tokenDispositivo) return;

        await moduloDispositivo.guardarTokenDispositivo(tokenDispositivo);

        if (moduloDispositivo?.iniciarServicioBateria) {
            await moduloDispositivo.iniciarServicioBateria();
        }
    } catch (e: any) {
        console.error('[AuthStore] Error preparando reporte background de batería:', e?.message || e);
    }
}

// ===================== Store =====================

export const useAuthStore = create<AuthState>((set, get) => ({
    usuario: null,
    token: null,
    autenticado: false,
    cargando: false,

    /**
     * Login con Google — envía el id_token al backend
     */
    loginConGoogle: async (idToken: string): Promise<ResultadoLogin> => {
        console.log('[AuthStore] Iniciando loginConGoogle...');
        set({ cargando: true });

        try {
            console.log('[AuthStore] Enviando id_token al backend POST /auth/google');
            const response = await httpClient.post('/auth/google', {
                id_token: idToken,
            });

            const { token_sesion, usuario, es_nuevo } = response.data;
            console.log(`[AuthStore] Respuesta del backend — es_nuevo: ${es_nuevo}, Rol: ${usuario.Rol}`);

            // Guardar token y usuario
            await SecureStore.setItemAsync(TOKEN_KEY, token_sesion);
            await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));
            setAuthToken(token_sesion);
            await prepararReporteBackgroundDeBateria(usuario.Rol);

            set({
                usuario,
                token: token_sesion,
                autenticado: true,
                cargando: false,
            });

            useFamilyPreferencesStore.getState().setUsuarioActivo(usuario.Id_Usuario);

            console.log(`[AuthStore] Login con Google exitoso — Id_Usuario: ${usuario.Id_Usuario}`);

            void registrarParaNotificaciones(usuario.Id_Usuario);

            return { exito: true, es_nuevo };
        } catch (error: any) {
            const mensaje = error.response?.data?.detail || error.message || 'Error al iniciar sesión con Google';
            console.error('[AuthStore] Error en loginConGoogle:', mensaje);
            set({ cargando: false });
            return { exito: false, es_nuevo: false, mensaje };
        }
    },

    /**
     * Login manual con correo y contraseña
     */
    loginConCredenciales: async (correo: string, contrasena: string): Promise<ResultadoLogin> => {
        console.log('[AuthStore] Iniciando loginConCredenciales');
        set({ cargando: true });

        try {
            console.log('[AuthStore] Enviando credenciales al backend POST /auth/login');
            const response = await httpClient.post('/auth/login', {
                correo,
                contrasena,
            });

            const { token_sesion, usuario } = response.data;
            console.log(`[AuthStore] Login manual exitoso — Id_Usuario: ${usuario.Id_Usuario}, Rol: ${usuario.Rol}`);

            // Guardar token y usuario
            await SecureStore.setItemAsync(TOKEN_KEY, token_sesion);
            await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));
            setAuthToken(token_sesion);
            await prepararReporteBackgroundDeBateria(usuario.Rol);

            set({
                usuario,
                token: token_sesion,
                autenticado: true,
                cargando: false,
            });

            useFamilyPreferencesStore.getState().setUsuarioActivo(usuario.Id_Usuario);

            void registrarParaNotificaciones(usuario.Id_Usuario);

            return { exito: true, es_nuevo: false };
        } catch (error: any) {
            const mensaje = error.response?.data?.detail || error.message || 'Correo o contraseña incorrectos';
            console.error('[AuthStore] Error en loginConCredenciales:', mensaje);
            set({ cargando: false });
            return { exito: false, es_nuevo: false, mensaje };
        }
    },

    /**
     * Registro de nuevo usuario con correo, contraseña y rol
     */
    registrar: async (datos: DatosRegistro): Promise<ResultadoLogin> => {
        console.log(`[AuthStore] Iniciando registro — Correo: ${datos.correo}, Rol: ${datos.rol}`);
        set({ cargando: true });

        try {
            console.log('[AuthStore] Enviando datos al backend POST /auth/register');
            const response = await httpClient.post('/auth/register', datos);

            const { token_sesion, usuario } = response.data;
            console.log(`[AuthStore] Registro exitoso — Id_Usuario: ${usuario.Id_Usuario}`);

            // Guardar token y usuario
            await SecureStore.setItemAsync(TOKEN_KEY, token_sesion);
            await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));
            setAuthToken(token_sesion);
            await prepararReporteBackgroundDeBateria(usuario.Rol);

            set({
                usuario,
                token: token_sesion,
                autenticado: true,
                cargando: false,
            });

            useFamilyPreferencesStore.getState().setUsuarioActivo(usuario.Id_Usuario);

            void registrarParaNotificaciones(usuario.Id_Usuario);

            return { exito: true, es_nuevo: true };
        } catch (error: any) {
            const mensaje = error.response?.data?.detail || error.message || 'Error al registrar';
            console.error('[AuthStore] Error en registro:', mensaje);
            set({ cargando: false });
            return { exito: false, es_nuevo: false, mensaje };
        }
    },

    /**
     * Asignar rol a un usuario nuevo (después de Google Sign-In)
     */
    asignarRol: async (rol: 'familiar' | 'adulto_mayor'): Promise<ResultadoLogin> => {
        console.log(`[AuthStore] Asignando rol: ${rol}`);
        set({ cargando: true });

        try {
            console.log('[AuthStore] Enviando rol al backend PUT /auth/rol');
            const response = await httpClient.put('/auth/rol', { rol });

            const { token_sesion, usuario } = response.data;
            console.log(`[AuthStore] Rol asignado exitosamente — Rol: ${usuario.Rol}`);

            // Actualizar token y usuario con el nuevo rol
            await SecureStore.setItemAsync(TOKEN_KEY, token_sesion);
            await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));
            setAuthToken(token_sesion);
            await prepararReporteBackgroundDeBateria(usuario.Rol);

            set({
                usuario,
                token: token_sesion,
                cargando: false,
            });

            useFamilyPreferencesStore.getState().setUsuarioActivo(usuario.Id_Usuario);

            void registrarParaNotificaciones(usuario.Id_Usuario);

            return { exito: true, es_nuevo: false };
        } catch (error: any) {
            const mensaje = error.response?.data?.detail || error.message || 'Error al asignar rol';
            console.error('[AuthStore] Error asignando rol:', mensaje);
            set({ cargando: false });
            return { exito: false, es_nuevo: false, mensaje };
        }
    },

    actualizarAvatar: async (
        imagenBase64: string,
        mimeType?: string
    ): Promise<{ exito: boolean; mensaje?: string }> => {
        console.log('[AuthStore] Actualizando avatar...');
        set({ cargando: true });

        try {
            const response = await httpClient.put('/users/me/avatar', {
                imagen_base64: imagenBase64,
                mime_type: mimeType,
            });

            const usuario = response.data as Usuario;
            await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));

            set({ usuario, cargando: false });
            console.log('[AuthStore] Avatar actualizado exitosamente');

            return { exito: true };
        } catch (error: any) {
            const mensaje = error.response?.data?.detail || error.message || 'Error al actualizar avatar';
            console.error('[AuthStore] Error actualizando avatar:', mensaje);
            set({ cargando: false });
            return { exito: false, mensaje };
        }
    },

    eliminarAvatar: async (): Promise<{ exito: boolean; mensaje?: string }> => {
        console.log('[AuthStore] Eliminando avatar...');
        set({ cargando: true });

        try {
            const response = await httpClient.delete('/users/me/avatar');

            const usuario = response.data as Usuario;
            await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));

            set({ usuario, cargando: false });
            console.log('[AuthStore] Avatar eliminado exitosamente');

            return { exito: true };
        } catch (error: any) {
            const mensaje = error.response?.data?.detail || error.message || 'Error al eliminar avatar';
            console.error('[AuthStore] Error eliminando avatar:', mensaje);
            set({ cargando: false });
            return { exito: false, mensaje };
        }
    },

    /**
     * Cerrar sesión — limpia todo el estado
     */
    cerrarSesion: async (): Promise<void> => {
        console.log('[AuthStore] Cerrando sesión...');

        const usuarioActual = get().usuario;

        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USUARIO_KEY);
        setAuthToken(null);

        // El push token NO se borra al cerrar sesión: pertenece al usuario en este dispositivo.
        // Si otro usuario inicia sesión en este dispositivo, el upsert lo reasignará.

        if (usuarioActual?.Proveedor_Auth === 'google') {
            try {
                await signOutGoogle();
            } catch {
                // Silencioso
            }
        }

        if (Platform.OS === 'android' && moduloDispositivo) {
            try {
                if (moduloDispositivo?.detenerServicioBateria) {
                    await moduloDispositivo.detenerServicioBateria();
                }
                if (moduloDispositivo?.limpiarTokenDispositivo) {
                    await moduloDispositivo.limpiarTokenDispositivo();
                }
            } catch (e: any) {
                console.error('[AuthStore] Error deteniendo servicio de batería:', e?.message || e);
            }
        }

        set({
            usuario: null,
            token: null,
            autenticado: false,
            cargando: false,
        });

        useFamilyPreferencesStore.getState().setUsuarioActivo(null);

        console.log('[AuthStore] Sesión cerrada exitosamente');
    },

    /**
     * Cargar sesión guardada al iniciar la app
     */
    cargarSesionGuardada: async (): Promise<void> => {
        console.log('[AuthStore] Buscando sesión guardada...');
        set({ cargando: true });

        try {
            const tokenGuardado = await SecureStore.getItemAsync(TOKEN_KEY);
            const usuarioGuardado = await SecureStore.getItemAsync(USUARIO_KEY);

            if (tokenGuardado && usuarioGuardado) {
                const usuario = JSON.parse(usuarioGuardado) as Usuario;

                setAuthToken(tokenGuardado);
                await prepararReporteBackgroundDeBateria(usuario.Rol);

                console.log(`[AuthStore] Sesión restaurada — Id_Usuario: ${usuario.Id_Usuario}, Rol: ${usuario.Rol}`);

                set({
                    usuario,
                    token: tokenGuardado,
                    autenticado: true,
                    cargando: false,
                });

                useFamilyPreferencesStore.getState().setUsuarioActivo(usuario.Id_Usuario);

                // Re-crea canales Android y refresca el push token por si cambió la config.
                void registrarParaNotificaciones(usuario.Id_Usuario);
            } else {
                console.log('[AuthStore] No hay sesión guardada');
                useFamilyPreferencesStore.getState().setUsuarioActivo(null);
                set({ cargando: false });
            }
        } catch (error: any) {
            console.error('[AuthStore] Error cargando sesión:', error.message);
            useFamilyPreferencesStore.getState().setUsuarioActivo(null);
            set({ cargando: false });
        }
    },
}));