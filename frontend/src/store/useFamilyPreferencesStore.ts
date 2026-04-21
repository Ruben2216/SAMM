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
}

// 2. Estado por defecto para nuevos inicios de sesión
const defaultConfig: ConfiguracionFamiliar = {
  notificacionesGenerales: true,
  alertaTomaCorrecta: true,
  alertaOlvidoCritico: true,
  alertaSalidaZona: true,
  alertaBateriaBaja: true,
  biometriaFaceId: false,
};

// 3. Contrato del Store Global
interface FamilyPreferencesState {
  usuarios: Record<string, ConfiguracionFamiliar>;
  idUsuarioActivo: string | null;
  estaHidratado: boolean;

  // Mutadores
  togglePreferencia: (idUsuario: string | number, clave: keyof ConfiguracionFamiliar) => void;
  setUsuarioActivo: (idUsuario: string | number | null) => void;

  // Consultas
  obtenerConfiguracion: (idUsuario: string | number) => ConfiguracionFamiliar;
  obtenerConfiguracionActiva: () => ConfiguracionFamiliar;

  // Soporte de hidratación: útil para servicios que arrancan antes que la UI.
  rehidratar: () => Promise<void>;
  setEstaHidratado: (valor: boolean) => void;
}

const normalizarIdUsuario = (idUsuario: string | number): string => String(idUsuario);

export const useFamilyPreferencesStore = create<FamilyPreferencesState>()(
  persist(
    (set, get) => ({
      usuarios: {},
      idUsuarioActivo: null,
      estaHidratado: false,

      togglePreferencia: (idUsuario, clave) =>
        set((state) => {
          const idNormalizado = normalizarIdUsuario(idUsuario);
          const configActual = state.usuarios[idNormalizado] ?? defaultConfig;

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

      setUsuarioActivo: (idUsuario) =>
        set({ idUsuarioActivo: idUsuario === null ? null : normalizarIdUsuario(idUsuario) }),

      obtenerConfiguracion: (idUsuario) => {
        const idNormalizado = normalizarIdUsuario(idUsuario);
        const config = get().usuarios[idNormalizado];
        return config ? { ...config } : { ...defaultConfig };
      },

      obtenerConfiguracionActiva: () => {
        const idUsuarioActivo = get().idUsuarioActivo;
        if (!idUsuarioActivo) return { ...defaultConfig };
        const config = get().usuarios[idUsuarioActivo];
        return config ? { ...config } : { ...defaultConfig };
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

        state?.setEstaHidratado(true);
      },
      version: 1,
    }
  )
);
