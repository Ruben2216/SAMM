import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Image, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './styles';
import { theme } from '../../../../theme';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

const MAPBOX_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
  <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
  <style>
    * { margin: 0; padding: 0; }
    body, html, #mapa { width: 100%; height: 100%; overflow: hidden; }
    
    .contenedor-marcador {
      position: relative;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    
    .halo-marcador {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 50%;
      background: rgba(20, 236, 92, 0.4);
      animation: pulsarHalo 3s ease-out infinite;
      border: 1px dashed rgba(128, 128, 128, 0.49);
    }
    
    .halo-1 { width: 90px; height: 90px; animation-delay: 0s; position: absolute; top: 25px; }
    .halo-2 { width: 150px; height: 150px; animation-delay: 0.9s; opacity: 0.2; position: absolute;  top: -5px; }
    .halo-3 { width: 220px; height: 220px; animation-delay: 1.5s; opacity: 0.1; position: absolute;  top: -45px; }
 
    
    @keyframes pulsarHalo {
      0% { transform: translateX(-50%) scale(0.8); opacity: 1; }
      100% { transform: translateX(-50%) scale(1.5); opacity: 0; }

    }
    
    .forma-pin {
      position: relative;
      width:60px;
      height: 60px;
      background: #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 15px 25px rgba(0,0,0,0.2);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
    }
    
    .pin-interno {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      transform: rotate(45deg);
      background: #fff;
      border: 3px solid #14EC5C;
    }
    
    .imagen-pin {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .punto-pin {
      width: 15px;
      height: 15px;
      background: #ffffff90;
      border-radius: 50%;
      position: absolute;
      bottom: -20px;
      left: 22.7px;
      box-shadow: 0 5px 10px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div id="mapa"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_TOKEN}';
    
    const mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [2.2945, 48.8584], 
      zoom: 15.68,
      pitch: 40,
      bearing: -17.6,
      interactive: true,
      attributionControl: false
    });

    // Exponer API para React Native: fijar ubicación y centrar mapa
    window.__samm_mapa = mapa;
    window.__samm_marcador_usuario = null;
    window.__samm_ubicacion_pendiente = null;

    function crearElementoMarcadorUsuario() {
      const contenedor = document.createElement('div');
      contenedor.className = 'samm-marcador-usuario';
      const svg =
        '<svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />' +
        '</svg>';
      contenedor.innerHTML = svg;
      return contenedor;
    }

    window.sammActualizarUbicacionUsuario = function(lng, lat) {
      try {
        if (!window.__samm_mapa) {
          window.__samm_ubicacion_pendiente = { lng, lat };
          return;
        }

        const coordenada = [lng, lat];

        if (!window.__samm_marcador_usuario) {
          const elemento = crearElementoMarcadorUsuario();
          window.__samm_marcador_usuario = new mapboxgl.Marker({ element: elemento, anchor: 'bottom' })
            .setLngLat(coordenada)
            .addTo(window.__samm_mapa);
        } else {
          window.__samm_marcador_usuario.setLngLat(coordenada);
        }

        // Nota: la rotación automática usa rotateTo() en loop y cancela transiciones.
        // jumpTo() aplica el centro instantáneamente y la rotación continúa alrededor del nuevo centro.
        window.__samm_mapa.jumpTo({ center: coordenada });
      } catch (e) {
        // Silencioso para evitar romper el WebView
      }
    };
    
    mapa.on('load', () => {
      if (window.__samm_ubicacion_pendiente) {
        const { lng, lat } = window.__samm_ubicacion_pendiente;
        window.__samm_ubicacion_pendiente = null;
        window.sammActualizarUbicacionUsuario(lng, lat);
      }

      mapa.addLayer({

        'id': 'edificios-3d',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#f5f0e5',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6,
          
        }
      });


      
      const elementoMarcador1 = document.createElement('div');
      elementoMarcador1.className = 'contenedor-marcador';
      elementoMarcador1.innerHTML = \`
        <div class="halo-marcador halo-1"></div>
        <div class="halo-marcador halo-2"></div>
        <div class="halo-marcador halo-3"></div>
        <div class="forma-pin">
          <div class="pin-interno">
            <img src="https://cdn-p.smehost.net/sites/a8928da38df6414aae98564041b07ae0/wp-content/uploads/2022/08/JoseJose-Imagen.png" class="imagen-pin" alt="Usuario 1">
          </div>
        </div>
        <div class="punto-pin"></div>
      \`;
      new mapboxgl.Marker({ element: elementoMarcador1, anchor: 'bottom' })
        .setLngLat([2.2935, 48.8594])
        .addTo(mapa);
      
      const elementoMarcador2 = document.createElement('div');
      elementoMarcador2.className = 'contenedor-marcador';
      elementoMarcador2.innerHTML = \`
        <div class="halo-marcador halo-1"></div>
        <div class="halo-marcador halo-2"></div>
        <div class="halo-marcador halo-3"></div>
        <div class="forma-pin">
          <div class="pin-interno">
            <img src="https://blob.tusbuenasnoticias.com/images/2025/12/19/cuantos-anos-tendria-chalino-sanchez-en-2025-ff235f36-focus-0-0-418-336.webp" class="imagen-pin" alt="Usuario 2">
          </div>
        </div>
        <div class="punto-pin"></div>
      \`;
      new mapboxgl.Marker({ element: elementoMarcador2, anchor: 'bottom' })
        .setLngLat([2.2955, 48.8574])
        .addTo(mapa);
      
      let rotacionActiva = true;
      let idAnimacionRotacion = null;
      let tiempoInactividad = null;
      
      function rotarCamara(marcaTiempo) {
        if (rotacionActiva) {
          mapa.rotateTo((marcaTiempo / 200) % 360, { duration: 600 });
          idAnimacionRotacion = requestAnimationFrame(rotarCamara);
        }
      }
      
      function pausarRotacion() {
        rotacionActiva = false;
        if (idAnimacionRotacion) {
          cancelAnimationFrame(idAnimacionRotacion);
          idAnimacionRotacion = null;
        }
        
        if (tiempoInactividad) {
          clearTimeout(tiempoInactividad);
        }
        
        tiempoInactividad = setTimeout(() => {
          rotacionActiva = true;
          rotarCamara(performance.now());
        }, 4000);
      }
      
      mapa.on('mousedown', pausarRotacion);
      mapa.on('touchstart', pausarRotacion);
      mapa.on('wheel', pausarRotacion);
      mapa.on('drag', pausarRotacion);
      
      rotarCamara(0);
    });
  </script>
</body>
</html>
`;

/**
 * Pantalla Inicial - Página de presentación con mapa 3D
 * Introduce al usuario a SAMM antes del onboarding
 */
export const InitialScreen: React.FC = () => {
  const navegacion = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const [webViewLista, setWebViewLista] = useState(false);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const ubicacionPendienteRef = useRef<{ latitud: number; longitud: number } | null>(null);
  const ultimaUbicacionValidaRef = useRef<{ latitud: number; longitud: number; precisionMetros?: number } | null>(null);

  const obtenerDistanciaMetros = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const conTimeout = useCallback(async <T,>(promesa: Promise<T>, ms: number): Promise<T> => {
    return await new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => reject(new Error('timeout')), ms);
      promesa
        .then((valor) => {
          clearTimeout(id);
          resolve(valor);
        })
        .catch((error) => {
          clearTimeout(id);
          reject(error);
        });
    });
  }, []);

  const inyectarUbicacionEnMapa = useCallback(
    (latitud: number, longitud: number) => {
      if (!webViewRef.current || !webViewLista) {
        ubicacionPendienteRef.current = { latitud, longitud };
        return;
      }

      const js = `window.sammActualizarUbicacionUsuario(${Number(longitud)}, ${Number(latitud)}); true;`;
      webViewRef.current.injectJavaScript(js);
    },
    [webViewLista]
  );

  const manejarMostrarMiUbicacion = useCallback(async () => {
    if (cargandoUbicacion) return;
    setCargandoUbicacion(true);
    try {
      const permisos = await Location.requestForegroundPermissionsAsync();
      if (permisos.status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos tu ubicación para mostrarla en el mapa. Puedes habilitarla desde Ajustes.'
        );
        return;
      }

      const serviciosActivos = await Location.hasServicesEnabledAsync();
      if (!serviciosActivos) {
        Alert.alert('Ubicación desactivada', 'Activa la ubicación del dispositivo para poder mostrar tu posición.');
        return;
      }

      const evaluarYAplicarUbicacion = (latitud: number, longitud: number, precisionMetros?: number) => {
        const anterior = ultimaUbicacionValidaRef.current;

        const precision = typeof precisionMetros === 'number' ? precisionMetros : Number.POSITIVE_INFINITY;
        const precisionAceptableInicial = 150;
        const precisionAceptable = 80;

        if (!anterior) {
          if (precision <= precisionAceptableInicial) {
            ultimaUbicacionValidaRef.current = { latitud, longitud, precisionMetros: precisionMetros };
            inyectarUbicacionEnMapa(latitud, longitud);
            return true;
          }
          return false;
        }

        const distancia = obtenerDistanciaMetros(anterior.latitud, anterior.longitud, latitud, longitud);

        // Evita “saltos” enormes cuando la lectura es imprecisa.
        if (distancia > 2000 && precision > precisionAceptable) return false;

        // Acepta si es suficientemente precisa o si el cambio es pequeño.
        if (precision <= precisionAceptable || distancia <= 200) {
          ultimaUbicacionValidaRef.current = { latitud, longitud, precisionMetros: precisionMetros };
          inyectarUbicacionEnMapa(latitud, longitud);
          return true;
        }

        return false;
      };

      // Intento 1 (rápido): suele responder en ~1-2s
      try {
        const posicionRapida = await conTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          2200
        );

        const { latitude, longitude, accuracy } = posicionRapida.coords;
        if (
          typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          evaluarYAplicarUbicacion(latitude, longitude, typeof accuracy === 'number' ? accuracy : undefined)
        ) {
          return;
        }
      } catch {
        // Ignora y prueba un intento más preciso
      }

      // Intento 2 (preciso pero corto): reduce casos de ubicación errónea
      try {
        const posicionPrecisa = await conTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
          2600
        );

        const { latitude, longitude, accuracy } = posicionPrecisa.coords;
        if (
          typeof latitude === 'number' &&
          typeof longitude === 'number' &&
          evaluarYAplicarUbicacion(latitude, longitude, typeof accuracy === 'number' ? accuracy : undefined)
        ) {
          return;
        }
      } catch {
        // continúa al fallback
      }

      // Fallback: usa la última conocida solo si es bastante buena
      try {
        const ultima = await Location.getLastKnownPositionAsync();
        if (ultima?.coords) {
          const ahora = Date.now();
          const esReciente = typeof ultima.timestamp === 'number' && ahora - ultima.timestamp <= 60_000;
          if (!esReciente) return;

          const { latitude, longitude, accuracy } = ultima.coords;
          const ok =
            typeof latitude === 'number' &&
            typeof longitude === 'number' &&
            evaluarYAplicarUbicacion(latitude, longitude, typeof accuracy === 'number' ? accuracy : undefined);
          if (ok) return;
        }
      } catch {
        // nada
      }

      // Si ya había una ubicación válida, la mantenemos sin molestar.
      if (!ultimaUbicacionValidaRef.current) {
        Alert.alert('Ubicación no precisa', 'No se pudo obtener una ubicación confiable. Intenta de nuevo en un área abierta.');
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación en este momento.');
    } finally {
      setCargandoUbicacion(false);
    }
  }, [cargandoUbicacion, conTimeout, inyectarUbicacionEnMapa, obtenerDistanciaMetros]);

  const htmlMapbox = useMemo(() => {
    return MAPBOX_HTML.replace(
      '</style>',
      `\n    .samm-marcador-usuario { width: 34px; height: 34px; }\n    .samm-marcador-usuario svg { display: block; width: 34px; height: 34px; fill: ${theme.colors.pinUbicacionUsuario}; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.25)); }\n  </style>`
    );
  }, []);

  const manejarInicioAhora = () => {
    navegacion.navigate('Welcome' as never);
  };

  const manejarEnlaceLogin = () => {
    navegacion.navigate('IniciarSesion' as never);
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.seccionHero}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlMapbox }}
          style={styles.mapa}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          androidLayerType="hardware"
          onLoadEnd={() => {
            setWebViewLista(true);
            const pendiente = ubicacionPendienteRef.current;
            if (pendiente) {
              ubicacionPendienteRef.current = null;
              inyectarUbicacionEnMapa(pendiente.latitud, pendiente.longitud);
            }
          }}
        />

        <TouchableOpacity
          style={styles.botonMiUbicacion}
          onPress={manejarMostrarMiUbicacion}
          activeOpacity={0.85}
          disabled={cargandoUbicacion}
          accessibilityRole="button"
          accessibilityLabel="Mostrar mi ubicación en el mapa"
          accessibilityState={{ busy: cargandoUbicacion, disabled: cargandoUbicacion }}
        >
          <Icon name="crosshairs-gps" size={26} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.hojaInferior} edges={['bottom']}>
        <View style={styles.contenedorPuntos}>
          <View style={[styles.punto, styles.puntoActivo]} />
          <View style={styles.punto} />
          <View style={styles.punto} />
          <View style={styles.punto} />
        </View>

        <Text style={styles.titulo} children={'Bienvenido a\nSAMM'} />
        <Text
          style={styles.subtitulo}
          children={
            'Seguridad para tus seres queridos, tranquilidad para ti.\n' +
            'Monitoreo inteligente en tiempo real.'
          }
        />

        <TouchableOpacity
          style={styles.botonInicio}
          onPress={manejarInicioAhora}
          activeOpacity={0.8}
          accessibilityLabel="Comenzar ahora con SAMM"
          accessibilityRole="button"
        >
          <Text style={styles.textoBotonInicio} children="Comenzar ahora" />
          <Image
            source={require('../../../../../assets/icons/flecha-derecha.png')}
            style={styles.iconoFlecha}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={manejarEnlaceLogin}
          style={styles.contenedorEnlacePie}
          accessibilityLabel="Ir a iniciar sesión"
          accessibilityRole="button"
        >
          <Text
            style={styles.enlacePie}
            children={
              <>
                ¿Ya tienes cuenta?
                <Text style={styles.subrayado} children=" Inicia Sesión" />
              </>
            }
          />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};
