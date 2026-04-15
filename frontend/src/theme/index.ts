import { MD3LightTheme } from 'react-native-paper';

/**
 * Tema principal de SAMM
 */
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#14EC5C', // Verde Neón SAMM
    secondary: '#10e968', // Variante del verde
    // MD3: `SegmentedButtons` usa `secondaryContainer` como fondo del segmento seleccionado.
    // Usamos la paleta verde definida por SAMM para evitar el morado por defecto.
    secondaryContainer: '#14EC5C',
    onSecondaryContainer: '#1E293B',
    background: '#F8FAFC', // Fondo general
    surface: '#FFFFFF', // Superficies (tarjetas, modales)
    text: '#1E293B', // Texto principal
    textSecondary: '#8a94a6', // Texto secundario
    error: '#EF4444', // Errores
    pinUbicacionUsuario: '#EF4444', // Color dedicado para el pin de ubicación del usuario
    border: '#f0f2f5', // Bordes sutiles
    disabled: '#CBD5E1', // Elementos deshabilitados
    placeholder: '#94A3B8', // Placeholders
  },
  roundness: 24, // Radio de bordes global
};

export type AppTheme = typeof theme;
