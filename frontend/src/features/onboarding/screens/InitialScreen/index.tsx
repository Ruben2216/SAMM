import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
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
    
    mapa.on('load', () => {
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
          source={{ html: MAPBOX_HTML }}
          style={styles.mapa}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          androidLayerType="hardware"
        />
      </View>

      <View style={styles.hojaInferior}>
        <View style={styles.contenedorPuntos}>
          <View style={[styles.punto, styles.puntoActivo]} />
          <View style={styles.punto} />
          <View style={styles.punto} />
          <View style={styles.punto} />
        </View>

        <Text style={styles.titulo}>Bienvenido a{'\n'}SAMM</Text>
        <Text style={styles.subtitulo}>
          Seguridad para tus seres queridos, tranquilidad para ti.
          {'\n'}Monitoreo inteligente en tiempo real.
        </Text>

        <TouchableOpacity
          style={styles.botonInicio}
          onPress={manejarInicioAhora}
          activeOpacity={0.8}
          accessibilityLabel="Comenzar ahora con SAMM"
          accessibilityRole="button"
        >
          <Text style={styles.textoBotonInicio}>Comenzar ahora</Text>
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
          <Text style={styles.enlacePie}>
            ¿Ya tienes cuenta? 
            <Text style={styles.subrayado}> Inicia Sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
