// C:\proyecto\SAMM\frontend\src\components\Map\MapboxHtml.ts
export const MAPBOX_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
  <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: #f8f9fa;
      touch-action: none;
    }
    #mapa {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="mapa"></div>
  <script>
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9zZTIyMSIsImEiOiJjbW1hMWJiOHAwOXNkMndvb2RlNTB6ZjZhIn0.tLiiTYUFfb_FFgEyfE52Nw';

    const mapa = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-77.09, 38.98],
      zoom: 14,
      dragRotate: false,
      pitchWithRotate: false
    });

    mapa.doubleClickZoom.disable();

    window.__samm_mapa = mapa;
    window.sammMarkers = {};

    window.sammSetPersons = function(personas) {
      const idsRecibidos = new Set();

      personas.forEach(p => {
        const lat = Number(p.lat);
        const lng = Number(p.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return;
        }

        idsRecibidos.add(String(p.id));

        if (window.sammMarkers[p.id]) {
          window.sammMarkers[p.id].setLngLat([lng, lat]);
          return;
        }

        const marker = new mapboxgl.Marker({ color: '#1D9E75' })
          .setLngLat([lng, lat])
          .addTo(mapa);

        window.sammMarkers[p.id] = marker;
      });

      Object.keys(window.sammMarkers).forEach(id => {
        if (!idsRecibidos.has(String(id))) {
          window.sammMarkers[id].remove();
          delete window.sammMarkers[id];
        }
      });
    };
  </script>
</body>
</html>
`;