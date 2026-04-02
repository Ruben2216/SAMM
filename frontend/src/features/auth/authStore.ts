/**
 * Store de Autenticación — Zustand
 * Maneja el estado global de autenticación: login con Google, login manual, registro.
 * Persiste el JWT en expo-secure-store.
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import httpClient, { setAuthToken } from '../../services/httpService';

// ===================== Tipos =====================

export interface Usuario {
    Id_Usuario: number;
    Nombre: string;
    Correo: string;
    Proveedor_Auth: string;
    Rol: string | null;
    Activo: boolean;
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
    cerrarSesion: () => Promise<void>;
    cargarSesionGuardada: () => Promise<void>;
}

// ===================== Acceso de prueba (solo Frontend) =====================

type RolPruebas = 'familiar' | 'adulto_mayor';

const construirContrasenaPruebas = (): string => ['123', '456'].join('');

const construirCorreoPruebasAdulto = (): string => ['adulto', '@gmail.com'].join('');
const construirCorreoPruebasFamiliar = (): string => ['familiar', '@gmail.com'].join('');

const obtenerUsuarioDePruebas = (correo: string, contrasena: string): Usuario | null => {
    const flagEntorno = process.env.EXPO_PUBLIC_HABILITAR_LOGIN_PRUEBAS;
    const habilitado = flagEntorno ? flagEntorno === 'true' : !!__DEV__;
    if (!habilitado) return null;

    const correoNormalizado = correo.trim().toLowerCase();
    if (contrasena !== construirContrasenaPruebas()) return null;

    let rol: RolPruebas | null = null;
    let idUsuario = 0;
    let nombre = 'Usuario de pruebas';

    if (correoNormalizado === construirCorreoPruebasAdulto()) {
        rol = 'adulto_mayor';
        idUsuario = 9000001;
        nombre = 'Usuario Adulto (Pruebas)';
    }

    if (correoNormalizado === construirCorreoPruebasFamiliar()) {
        rol = 'familiar';
        idUsuario = 9000002;
        nombre = 'Usuario Familiar (Pruebas)';
    }

    if (!rol) return null;

    return {
        Id_Usuario: idUsuario,
        Nombre: nombre,
        Correo: correoNormalizado,
        Proveedor_Auth: 'local_pruebas',
        Rol: rol,
        Activo: true,
    };
};

// Clave para SecureStore
const TOKEN_KEY = 'samm_auth_token';
const USUARIO_KEY = 'samm_auth_usuario';

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

            set({
                usuario,
                token: token_sesion,
                autenticado: true,
                cargando: false,
            });

            console.log(`[AuthStore] Login con Google exitoso — Id_Usuario: ${usuario.Id_Usuario}`);

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
            const usuarioDePruebas = obtenerUsuarioDePruebas(correo, contrasena);
            if (usuarioDePruebas) {
                const tokenSesion = 'samm_dev_session';

                await SecureStore.setItemAsync(TOKEN_KEY, tokenSesion);
                await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuarioDePruebas));
                setAuthToken(null);

                set({
                    usuario: usuarioDePruebas,
                    token: tokenSesion,
                    autenticado: true,
                    cargando: false,
                });

                return { exito: true, es_nuevo: false };
            }

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

            set({
                usuario,
                token: token_sesion,
                autenticado: true,
                cargando: false,
            });

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

            set({
                usuario,
                token: token_sesion,
                autenticado: true,
                cargando: false,
            });

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

            set({
                usuario,
                token: token_sesion,
                cargando: false,
            });

            return { exito: true, es_nuevo: false };
        } catch (error: any) {
            const mensaje = error.response?.data?.detail || error.message || 'Error al asignar rol';
            console.error('[AuthStore] Error asignando rol:', mensaje);
            set({ cargando: false });
            return { exito: false, es_nuevo: false, mensaje };
        }
    },

    /**
     * Cerrar sesión — limpia todo el estado
     */
    cerrarSesion: async (): Promise<void> => {
        console.log('[AuthStore] Cerrando sesión...');

        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USUARIO_KEY);
        setAuthToken(null);

        set({
            usuario: null,
            token: null,
            autenticado: false,
            cargando: false,
        });

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
                const esTokenDePruebas = tokenGuardado === 'samm_dev_session';
                setAuthToken(esTokenDePruebas ? null : tokenGuardado);

                console.log(`[AuthStore] Sesión restaurada — Id_Usuario: ${usuario.Id_Usuario}, Rol: ${usuario.Rol}`);

                set({
                    usuario,
                    token: tokenGuardado,
                    autenticado: true,
                    cargando: false,
                });
            } else {
                console.log('[AuthStore] No hay sesión guardada');
                set({ cargando: false });
            }
        } catch (error: any) {
            console.error('[AuthStore] Error cargando sesión:', error.message);
            set({ cargando: false });
        }
    },
}));
