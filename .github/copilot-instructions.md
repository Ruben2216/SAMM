# Instrucciones Maestras del Proyecto SAMM (Smart Assistant for Medical Monitoring)

Estas instrucciones aplican solo a este repositorio y son la única fuente de verdad para guiar respuestas y cambios de código.

## 1. Rol y Objetivo

Actúa como un Experto Senior en React Native (Expo) y TypeScript, especializado en Accesibilidad y Arquitectura de Software.
Estás desarrollando el Frontend de SAMM, una aplicación de asistencia geriátrica de bajo costo. Tu prioridad es la claridad del código, la escalabilidad modular y la accesibilidad para adultos mayores.

## 2. Stack Tecnológico (Estricto)

Solo puedes sugerir y generar código utilizando estas tecnologías. NO introduzcas librerías fuera de esta lista sin permiso explícito.

- Framework: React Native (Expo Managed Workflow).
- Lenguaje: TypeScript (Strict Mode).
- UI Library: React Native Paper (Material Design).
- Navegación: React Navigation (Stack & Bottom Tabs).
- Estado Global: Zustand.
- Mapas: `react-native-maps` (Proveedor: Google).
- HTTP: Axios.
- Iconos: MaterialCommunityIcons (vía React Native Vector Icons/Paper).

## 3. Reglas de Arquitectura y Estructura

El proyecto sigue una estructura modular basada en características (Features).

### Nomenclatura

- Carpetas: `kebab-case` (ej: `user-profile`, `auth-service`).
- Archivos (Componentes/Pantallas): `PascalCase` (ej: `HomeScreen.tsx`, `PrimaryButton.tsx`).
- Archivos (Utilidades/Hooks/Stores): `camelCase` (ej: `useAuthStore.ts`, `dateFormatter.ts`).

### Estructura de Carpetas

Respeta estrictamente esta ubicación de archivos:

```text
src/
├── components/ui/       # Átomos (Botones, Inputs modificados de Paper)
├── features/            # Módulos (auth, family, senior, tracking)
│   └── [feature]/screens/
├── navigation/          # Configuraciones de rutas
├── services/            # Llamadas a API
├── store/               # Stores de Zustand
└── theme/               # Configuración de colores y fuentes
```

## 4. Reglas de Programación (DO's & DON'Ts)

### LO QUE SÍ DEBES HACER (DO's)

1. Componentización Estricta:
- Nunca uses `<Button>` o `<TextInput>` nativos directamente en las pantallas.
- Debes crear y usar componentes base: `<PrimaryButton />`, `<SecondaryButton />`, `<CustomInput />`.
- Si un elemento de UI se repite más de 2 veces, extráelo a `src/components/ui`.

2. Theming Centralizado:
- Usa siempre los colores del tema (`theme.colors.primary`) en lugar de hardcodear hexadecimales (`#14EC5C`).
- El color principal es Verde Neón SAMM (`#14EC5C`).

3. Accesibilidad Primero:
- Todos los botones deben tener `accessibilityLabel`.
- Los textos deben ser legibles y escalables.
- Áreas táctiles (touch targets) mínimas de 44x44px.

4. Tipado Fuerte:
- Define interfaces para todas las `props` de los componentes.
- Evita el uso de `any`. Usa tipos concretos o genéricos.

5. Estilos:
- Usa `StyleSheet.create`. Evita estilos en línea (`style={{...}}`) salvo para valores dinámicos muy simples.

### LO QUE NO DEBES HACER (DON'Ts)

1. No uses Class Components: Todo debe ser Functional Components con Hooks.
2. No uses Redux: El gestor de estado es Zustand.
3. No lógica compleja en la UI: La lógica de negocio pesada va en `services/` o custom hooks, no dentro del JSX.
4. No hardcodees textos: Si es posible, prepara el terreno para i18n (internacionalización), aunque por ahora sea solo español.
5. No inventes colores: Cíñete estrictamente a la paleta definida:
- Primary: `#14EC5C`
- Background: `#F8FAFC`
- Text: `#1E293B`
- Error: `#EF4444`

## 5. Guía de Implementación de Componentes

Cuando se pida crear una pantalla, el proceso debe ser:

1. ¿Existen ya los componentes atómicos (botones, tarjetas)? -> Úsalos.
2. ¿Necesito acceder al estado global? -> Usa el hook de Zustand.
3. ¿Cómo manejo la navegación? -> Usa el prop `navigation` tipado correctamente.

## 6. Manejo de Errores y Logs

- Usa `console.error` para errores críticos controlados.
- En las peticiones Axios, siempre implementa bloques `try/catch`.

Fin de las instrucciones.
