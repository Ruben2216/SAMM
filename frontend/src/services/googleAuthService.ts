/**
 * Servicio de Autenticación con Google
 * 
 * Usa @react-native-google-signin/google-signin (OAuth nativo)
 * Requiere un Development Build (no funciona en Expo Go)
 * 
 * Para desarrollo sin Google Auth, usar login manual con correo/contraseña.
 */
import Constants from 'expo-constants';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

console.log('[GoogleAuth] Web Client ID cargado:', GOOGLE_WEB_CLIENT_ID ? 'Sí' : 'NO — verificar .env');

/**
 * Verifica si estamos corriendo en Expo Go
 */
export function esExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
}

/**
 * Hook placeholder para Google Auth en Expo Go
 * Google Auth NO funciona en Expo Go (el proxy auth.expo.io fue deprecado).
 * Se necesita un Development Build para usar Google Auth.
 */
export function useGoogleAuthExpoGo() {
    // En Expo Go, retornamos valores nulos — Google Auth solo funciona en dev builds
    return {
        request: null,
        response: null,
        promptAsync: null,
    };
}

/**
 * Login con Google usando selector nativo.
 * Funciona en Development Builds (APK con expo-dev-client).
 * NO funciona en Expo Go.
 */
export async function signInWithGoogleNative(): Promise<string | null> {
    console.log('[GoogleAuth] Intentando login nativo...');

    if (esExpoGo()) {
        throw new Error(
            'Google Sign-In no está disponible en Expo Go. ' +
            'Usa un Development Build (npx expo run:android) o inicia sesión con correo/contraseña.'
        );
    }

    try {
        const { GoogleSignin } = await import(
            '@react-native-google-signin/google-signin'
        );

        GoogleSignin.configure({
            webClientId: GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
        });
        console.log('[GoogleAuth] GoogleSignin configurado con webClientId');

        await GoogleSignin.hasPlayServices();
        console.log('[GoogleAuth] Google Play Services disponible');

        const userInfo = await GoogleSignin.signIn();
        const idToken = userInfo.data?.idToken || null;

        if (idToken) {
            console.log('[GoogleAuth] id_token obtenido exitosamente (nativo)');
        } else {
            console.warn('[GoogleAuth] Login exitoso pero sin id_token');
        }

        return idToken;
    } catch (error: any) {
        console.error('[GoogleAuth] Error en login nativo:', error.message || error);
        throw error;
    }
}

/**
 * Cierra la sesión de Google (solo nativo)
 */
export async function signOutGoogle(): Promise<void> {
    console.log('[GoogleAuth] Cerrando sesión de Google...');

    if (!esExpoGo()) {
        try {
            const { GoogleSignin } = await import(
                '@react-native-google-signin/google-signin'
            );
            await GoogleSignin.signOut();
            console.log('[GoogleAuth] Sesión de Google cerrada');
        } catch (error: any) {
            console.warn('[GoogleAuth] Error cerrando sesión:', error.message);
        }
    }
}
