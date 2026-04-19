// C:\proyecto\SAMM\frontend\src\components\Map\MapboxHtml.ts
export const MAPBOX_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
  <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
  <style>
    body, html, #mapa { width: 100%; height: 100%; margin: 0; }
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
      zoom: 14
    });

    window.__samm_mapa = mapa;
    window.sammMarkers = [];

    window.sammSetPersons = function(personas) {
      window.sammMarkers.forEach(m => m.remove());
      window.sammMarkers = [];

      personas.forEach(p => {
        const marker = new mapboxgl.Marker()
          .setLngLat([p.lng, p.lat])
          .addTo(mapa);

        window.sammMarkers.push(marker);
      });
    };
  </script>
</body>
</html>
`;