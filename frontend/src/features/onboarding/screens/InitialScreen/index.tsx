import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { theme } from '../../../../theme';

/**
 * HTML embebido con Mapbox GL JS - Edificios 3D y rotación automática
 */
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
    body, html, #map { width: 100%; height: 100%; overflow: hidden; }
    
    .marker-container {
      position: relative;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    
    .marker-halo {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 50%;
      background: rgba(20, 236, 92, 0.4);
      animation: haloPulse 3s ease-out infinite;
      border: 1px dashed rgba(128, 128, 128, 0.49);
    }
    
    .halo-1 { width: 90px; height: 90px; animation-delay: 0s; position: absolute; top: 25px; }
    .halo-2 { width: 150px; height: 150px; animation-delay: 0.9s; opacity: 0.2; position: absolute;  top: -5px; }
    .halo-3 { width: 220px; height: 220px; animation-delay: 1.5s; opacity: 0.1; position: absolute;  top: -45px; }
 
    
    @keyframes haloPulse {
      0% { transform: translateX(-50%) scale(0.8); opacity: 1; }
      100% { transform: translateX(-50%) scale(1.5); opacity: 0; }

    }
    
    .pin-shape {
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
    
    .pin-inner {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      transform: rotate(45deg);
      background: #fff;
      border: 3px solid #14EC5C;
    }
    
    .pin-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .pin-dot {
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
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zZTIyMSIsImEiOiJjbW1hMWJiOHAwOXNkMndvb2RlNTB6ZjZhIn0.tLiiTYUFfb_FFgEyfE52Nw';
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [2.2945, 48.8584], 
      zoom: 15.68,
      pitch: 40,
      bearing: -17.6,
      interactive: true,
      attributionControl: false
    });
    
    map.on('load', () => {
      map.addLayer({

        'id': '3d-buildings',
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


      
      // Agregar marcadores con pines personalizados
      const marker1El = document.createElement('div');
      marker1El.className = 'marker-container';
      marker1El.innerHTML = \`
        <div class="marker-halo halo-1"></div>
        <div class="marker-halo halo-2"></div>
        <div class="marker-halo halo-3"></div>
        <div class="pin-shape">
          <div class="pin-inner">
            <img src="https://cdn-p.smehost.net/sites/a8928da38df6414aae98564041b07ae0/wp-content/uploads/2022/08/JoseJose-Imagen.png" class="pin-image" alt="Usuario 1">
          </div>
        </div>
        <div class="pin-dot"></div>
      \`;
      new mapboxgl.Marker({ element: marker1El, anchor: 'bottom' })
        .setLngLat([2.2935, 48.8594]) // Usuario 1 - Norte de la Torre Eiffel
        .addTo(map);
      
      const marker2El = document.createElement('div');
      marker2El.className = 'marker-container';
      marker2El.innerHTML = \`
        <div class="marker-halo halo-1"></div>
        <div class="marker-halo halo-2"></div>
        <div class="marker-halo halo-3"></div>
        <div class="pin-shape">
          <div class="pin-inner">
            <img src="https://blob.tusbuenasnoticias.com/images/2025/12/19/cuantos-anos-tendria-chalino-sanchez-en-2025-ff235f36-focus-0-0-418-336.webp" class="pin-image" alt="Usuario 2">
          </div>
        </div>
        <div class="pin-dot"></div>
      \`;
      new mapboxgl.Marker({ element: marker2El, anchor: 'bottom' })
        .setLngLat([2.2955, 48.8574]) // Usuario 2 - Sur de la Torre Eiffel
        .addTo(map);
      
      // Sistema de rotación con pausa por interacción
      let rotationActive = true;
      let rotationAnimationId = null;
      let inactivityTimeout = null;
      
      function rotateCamera(timestamp) {
        if (rotationActive) {
          map.rotateTo((timestamp / 200) % 360, { duration: 600 });
          rotationAnimationId = requestAnimationFrame(rotateCamera);
        }
      }
      
      function pauseRotation() {
        rotationActive = false;
        if (rotationAnimationId) {
          cancelAnimationFrame(rotationAnimationId);
          rotationAnimationId = null;
        }
        
        // Limpiar timeout anterior
        if (inactivityTimeout) {
          clearTimeout(inactivityTimeout);
        }
        
        // Programar reanudación después de 4 segundos de inactividad
        inactivityTimeout = setTimeout(() => {
          rotationActive = true;
          rotateCamera(performance.now());
        }, 4000);
      }
      
      // Detectar interacción del usuario
      map.on('mousedown', pauseRotation);
      map.on('touchstart', pauseRotation);
      map.on('wheel', pauseRotation);
      map.on('drag', pauseRotation);
      
      // Iniciar rotación automática
      rotateCamera(0);
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
  const navigation = useNavigation();

  const handleStartNow = () => {
    navigation.navigate('Welcome' as never);
  };

  const handleLoginLink = () => {
    // TODO: Navegar a pantalla de login
    console.log('Navegar a login');
  };

  return (
    <View style={styles.container}>
      {/* Mapa Hero Section con Edificios 3D (HTML Mapbox) */}
      <View style={styles.heroSection}>
        <WebView
          source={{ html: MAPBOX_HTML }}
          style={styles.map}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          androidLayerType="hardware"
        />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Indicadores de progreso (dots) */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Título y Subtítulo */}
        <Text style={styles.title}>Bienvenido a{'\n'}SAMM</Text>
        <Text style={styles.subtitle}>
          Seguridad para tus seres queridos, tranquilidad para ti.
          {'\n'}Monitoreo inteligente en tiempo real.
        </Text>

        {/* Botón Comenzar Ahora */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartNow}
          activeOpacity={0.8}
          accessibilityLabel="Comenzar ahora con SAMM"
          accessibilityRole="button"
        >
          <Text style={styles.startButtonText}>Comenzar ahora</Text>
          <Image
            source={require('../../../../../assets/icons/flecha-derecha.png')}
            style={styles.arrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Footer Link */}
        <TouchableOpacity
          onPress={handleLoginLink}
          style={styles.footerLinkContainer}
          accessibilityLabel="Ir a iniciar sesión"
          accessibilityRole="button"
        >
          <Text style={styles.footerLink}>
            ¿Ya tienes cuenta? Iniciar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
