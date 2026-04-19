// frontend/src/features/family/screens/Mapa/index.tsx
import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import CustomBottomSheet from './components/BottomSheet';
import { PersonReport } from '../mapa.types';
import { getReports } from '../../../../services/reportService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MAPBOX_HTML } from '../../../../components/Map/MapboxHtml';

export const Mapa = () => {
  const webViewRef = useRef<WebView>(null);
  const [reports, setReports] = useState<PersonReport[]>([]);
  const [selected, setSelected] = useState<PersonReport | null>(null);
 //el handler del Alerta (que hace al ser preionado)
  const handleAlert = (persona: PersonReport) => {
    navigation.navigate('Alert', { persona });
};

  useEffect(() => {
    getReports().then((data) => {
      setReports(data);
    });
  }, []);

  // Enviar personas cuando el WebView ya esté listo
  const handleWebViewLoad = () => {
    if (reports.length > 0) {
      enviarPersonasAlMapa(reports);
    }
  };

  const enviarPersonasAlMapa = (personas: PersonReport[]) => {
    const js = `
      if (window.sammSetPersons) {
        window.sammSetPersons(${JSON.stringify(personas)});
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  const centrarMapa = (persona: PersonReport) => {
    const js = `
      if (window.__samm_mapa) {
        window.__samm_mapa.flyTo({
          center: [${persona.lng}, ${persona.lat}],
          zoom: 16
        });
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  const handleSelect = (persona: PersonReport) => {
    setSelected(persona);
    centrarMapa(persona);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* El WebView ocupa todo pero el BottomSheet flota encima */}
      <View style={StyleSheet.absoluteFillObject}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          source={{ html: MAPBOX_HTML }}
          style={{ flex: 1 }}
          onLoad={handleWebViewLoad} // Enviar datos cuando el mapa esté listo
        />
      </View>

      <CustomBottomSheet
        data={reports}
        selected={selected}
        onSelect={handleSelect}
        onAlert={handleAlert}
      />
    </GestureHandlerRootView>
  );
};