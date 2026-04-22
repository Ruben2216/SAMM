import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 1. Definición del modelo de configuración por Familiar
export interface ConfiguracionFamiliar {
  notificacionesGenerales: boolean;
  alertaTomaCorrecta: boolean;
  alertaOlvidoCritico: boolean;
  alertaSalidaZona: boolean;
  alertaBateriaBaja: boolean;
  biometriaFaceId: boolean;

  // Nivel de supervisión (perfil del familiar)
  frecuenciaRastreo: string;
  tiempoMaxSinReporte: string;
}

// 2. Estado por defecto para nuevos inicios de sesión
const defaultConfig: ConfiguracionFamiliar = {
  notificacionesGenerales: true,
  alertaTomaCorrecta: true,
  alertaOlvidoCritico: true,
  alertaSalidaZona: true,
  alertaBateriaBaja: true,
  biometriaFaceId: false,

  frecuenciaRastreo: '15 minutos',
  tiempoMaxSinReporte: '1 hora',
};

// 3. Contrato del Store Global
interface FamilyPreferencesState {
  usuarios: Record<string, ConfiguracionFamiliar>;
  idUsuarioActivo: string | null;
  estaHidratado: boolean;

  // Mutadores
  togglePreferencia: (idUsuario: string | number, clave: keyof ConfiguracionFamiliar) => void;
  actualizarPreferencia: <K extends keyof ConfiguracionFamiliar>(
    idUsuario: string | number,
    clave: K,
    valor: ConfiguracionFamiliar[K]
  ) => void;
  setUsuarioActivo: (idUsuario: string | number | null) => void;

  // Consultas
  obtenerConfiguracion: (idUsuario: string | number) => ConfiguracionFamiliar;
  obtenerConfiguracionActiva: () => ConfiguracionFamiliar;

  // Soporte de hidratación: útil para servicios que arrancan antes que la UI.
  rehidratar: () => Promise<void>;
  setEstaHidratado: (valor: boolean) => void;
}

const normalizarIdUsuario = (idUsuario: string | number): string => String(idUsuario);

const normalizarUsuariosConDefaults = (
  usuarios: Record<string, Partial<ConfiguracionFamiliar>>
): Record<string, ConfiguracionFamiliar> => {
  const resultado: Record<string, ConfiguracionFamiliar> = {};

  for (const [idUsuario, configParcial] of Object.entries(usuarios)) {
    resultado[idUsuario] = {
      ...defaultConfig,
      ...(configParcial ?? {}),
    };
  }

  return resultado;
};

export const useFamilyPreferencesStore = create<FamilyPreferencesState>()(
  persist(
    (set, get) => ({
      usuarios: {},
      idUsuarioActivo: null,
      estaHidratado: false,

      togglePreferencia: (idUsuario, clave) =>
        set((state) => {
          const idNormalizado = normalizarIdUsuario(idUsuario);
          const configActual = {
            ...defaultConfig,
            ...(state.usuarios[idNormalizado] ?? {}),
          };

          return {
            usuarios: {
              ...state.usuarios,
              [idNormalizado]: {
                ...configActual,
                [clave]: !configActual[clave],
              },
            },
          };
        }),

      actualizarPreferencia: (idUsuario, clave, valor) =>
        set((state) => {
          const idNormalizado = normalizarIdUsuario(idUsuario);
          const configActual = {
            ...defaultConfig,
            ...(state.usuarios[idNormalizado] ?? {}),
          };

          return {
            usuarios: {
              ...state.usuarios,
              [idNormalizado]: {
                ...configActual,
                [clave]: valor,
              },
            },
          };
        }),

      setUsuarioActivo: (idUsuario) =>
        set({ idUsuarioActivo: idUsuario === null ? null : normalizarIdUsuario(idUsuario) }),

      obtenerConfiguracion: (idUsuario) => {
        const idNormalizado = normalizarIdUsuario(idUsuario);
        return get().usuarios[idNormalizado] ?? defaultConfig;
      },

      obtenerConfiguracionActiva: () => {
        const idUsuarioActivo = get().idUsuarioActivo;
        if (!idUsuarioActivo) return defaultConfig;
        return get().usuarios[idUsuarioActivo] ?? defaultConfig;
      },

      rehidratar: async () => {
        await useFamilyPreferencesStore.persist.rehydrate();
      },

      setEstaHidratado: (valor) => set({ estaHidratado: valor }),
    }),
    {
      name: 'samm-family-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error(
            '[FamilyPreferencesStore] Error rehidratando preferencias:',
            (error as any)?.message || error
          );
        }

        // Normaliza valores persistidos antiguos para evitar `undefined` en nuevas claves
        // y para que los selectores no generen objetos nuevos en cada render.
        try {
          const estadoActual = useFamilyPreferencesStore.getState();
          const usuariosNormalizados = normalizarUsuariosConDefaults(estadoActual.usuarios);
          useFamilyPreferencesStore.setState({ usuarios: usuariosNormalizados });
        } catch (e) {
          console.error('[FamilyPreferencesStore] Error normalizando preferencias:', e);
        }

        state?.setEstaHidratado(true);
      },
      version: 1,
    }
  )
);
