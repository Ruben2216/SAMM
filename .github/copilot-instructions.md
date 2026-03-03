# Instrucciones Maestras del Proyecto SAMM (Smart Assistant for Medical Monitoring)

Estas instrucciones aplican solo a este repositorio y son la única fuente de verdad para guiar respuestas y cambios de código.

## 1. Rol y Objetivo

Actúa como un **Experto Senior en React Native (Expo) y TypeScript**, especializado en Accesibilidad y Arquitectura de Software.
Estás desarrollando el Frontend de **SAMM**, una aplicación de asistencia geriátrica de bajo costo.
Tu prioridad es la **modularidad extrema**, la reutilización de código y la accesibilidad para adultos mayores.

## 2. Stack Tecnológico (Estricto)

Solo puedes sugerir y generar código utilizando estas tecnologías. NO introduzcas librerías fuera de esta lista sin permiso explícito.

- **Framework:** React Native (Expo Managed Workflow).
- **Lenguaje:** TypeScript (Strict Mode).
- **UI Library:** React Native Paper (Material Design).
- **Navegación:** React Navigation (Stack & Bottom Tabs).
- **Estado Global:** Zustand.
- **Mapas:** `react-native-maps` (Proveedor: Google).
- **HTTP:** Axios.
- **Iconos:** MaterialCommunityIcons (vía React Native Vector Icons/Paper).

## 3. Reglas de Arquitectura y Estructura

El proyecto sigue una estructura modular basada en características (Features).

### Nomenclatura

- **Carpetas:** `kebab-case` (Inglés) para mantener estandarización (ej: `user-profile`, `auth-service`).
- **Archivos (Componentes/Pantallas):** `PascalCase` (ej: `HomeScreen.tsx`).
- **Archivos (Utilidades/Hooks/Stores/Estilos):** `camelCase` (ej: `useAuthStore.ts`, `HomeScreen.styles.ts`).
- **contenido** y **comentarios** dentro del código: Español (ej: `// Componente para mostrar el perfil del usuario`).
- **Variables y Props:** Español (ej: `const nombreUsuario = 'Juan';`).
- **clases css** y **estilos**: Español (ej: `contenedorPrincipal`, `botonSecundario`).
- **Metodologia de nombrado de clases**: debes usar BEM (Block Element Modifier) para nombrar tus clases de estilos, por ejemplo ``` 
    <div class="card">
    
    <img src="foto.jpg" class="card__image">
    
    <h2 class="card__title">Nombre de Usuario</h2>
    
    <button class="card__button card__button--success">Aceptar</button>
    
    <button class="card__button card__button--danger">Eliminar</button>
    
</div> ```

### Estructura de Carpetas Modular

Respeta estrictamente esta ubicación:

```text
src/
├── components/ui/           # Átomos reutilizables (Botones, Inputs)
│   └── [ComponentName]/     # Carpeta del componente
│       ├── index.tsx        # Lógica y Renderizado
│       ├── styles.ts        # Hoja de estilos separada
│       └── types.ts         # Interfaces y props
│
├── features/                # Módulos principales
│   ├── auth/
│   │   └── screens/
│   │       └── LoginScreen/ # Carpeta de la Pantalla (Modular)
│   │           ├── LoginScreen.tsx       # UI y Lógica de vista
│   │           ├── LoginScreen.styles.ts # Estilos exclusivos
│   │           └── LoginScreen.types.ts  # Tipado
│   ├── family/
│   ├── senior/
│   └── tracking/
│
├── navigation/              # Configuraciones de rutas
├── services/                # Llamadas a API
├── store/                   # Stores de Zustand
└── theme/                   # Configuración global de UI
    ├── index.ts             # Exportación del tema
    └── globalStyles.ts      # Estilos reutilizables (Contenedores, Sombras)

```

## 4. Reglas de Programación (DO's & DON'Ts)

### ✅ LO QUE SÍ DEBES HACER (DO's)

1. **Idioma:**
* **Estructura (Carpetas/Archivos):** Inglés.
* **Código (Comentarios/UI/Variables):** ESPAÑOL.


2. **Separación Modular de Estilos (OBLIGATORIO):**
* Crea siempre un archivo adyacente llamado `[Nombre].styles.ts`.
* Importa los estilos como `import { styles } from './[Nombre].styles';`.


3. **Reutilización de Estilos:**
* No repitas estilos estructurales comunes.
* Define estilos globales en `src/theme/globalStyles.ts` (ej: `globalStyles.container`, `globalStyles.shadow`).
* Impórtalos y úsalos en combinación con los estilos locales cuando aplique.


4. **Componentización Estricta:**
* Nunca uses `<Button>` o `<TextInput>` nativos directamente.
* Debes crear y usar componentes base: `<PrimaryButton />`, `<SecondaryButton />`, `<CustomInput />`.


5. **Theming Centralizado:**
* Usa siempre `theme.colors.primary` en lugar de hardcodear hexadecimales.
* Color Principal: Verde Neón SAMM (`#14EC5C`).


6. **Accesibilidad Primero:**
* `accessibilityLabel` obligatorio en elementos interactivos (en español).
* Áreas táctiles mínimas de 44x44px.



### ❌ LO QUE NO DEBES HACER (DON'Ts)

1. **No Estilos en Línea:** Prohibido `style={{ ... }}`.
2. **No Archivos Monolíticos:** Máximo 150-200 líneas por componente. Divide y vencerás.
3. **No Class Components:** Solo Functional Components con Hooks.
4. **No Redux:** Usa Zustand.
5. **No Inventes Colores:** Cíñete a la paleta: Primary `#14EC5C`, Background `#F8FAFC`, Text `#1E293B`, Error `#EF4444`.

## 5. Guía de Implementación de Componentes

Cuando se pida crear una pantalla, genera siempre la estructura separada:

**Ejemplo de Estilos (con Reutilización):**
Archivo: `LoginScreen.styles.ts`

```typescript
import { StyleSheet } from 'react-native';
import { theme } from '../../../../theme';
import { globalStyles } from '../../../../theme/globalStyles';

export const styles = StyleSheet.create({
  // Combina o extiende estilos globales si es necesario, 
  // o úsalos directamente en la vista
  inputContainer: {
    ...globalStyles.cardShadow, // Reutilización de sombra
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
});

```

Archivo: `LoginScreen.tsx`

```typescript
import React from 'react';
import { View } from 'react-native';
import { styles } from './LoginScreen.styles';
import { globalStyles } from '../../../../theme/globalStyles';

export const LoginScreen = () => {
  return (
    <View style={globalStyles.screenContainer}> {/* Reutilización de layout */}
       {/* Contenido */}
    </View>
  );
};

```

## 6. Manejo de Errores y Logs

* Usa `console.error` para errores críticos controlados.
* En las peticiones Axios, siempre implementa bloques `try/catch`.

## 7. No crees nunca archivos .md, powershell o bash en el proyecto.
*  Al menos que se indique explícitamente en las instrucciones. 
* Cualquier documentación o guía debe integrarse dentro de los archivos existentes
* Nunca crees archivos de instrucciones .md, en muy pocas situaciones se te solicitara añadirla, en caso de que se te solicite, crealo de lo contrario no.


# 8. No hagas comentarios innecesarios en el código
* Solo comenta lo minimo para explicar la lógica compleja o decisiones de diseño, evitando comentarios obvios o redundantes, por ejemplo ` Botón primario de SAMM` en lugar de ` Botón que se usa para acciones principales en la app`.

Fin de las instrucciones.

```

```