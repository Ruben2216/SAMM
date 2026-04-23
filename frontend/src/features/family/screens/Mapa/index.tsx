// frontend/src/features/family/screens/Mapa/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native'; // 👈 Faltaba esta importación
import CustomBottomSheet from './components/BottomSheet';
import { PersonReport } from './mapa.type';
import { getReports } from '../../../../services/reportService';
import { MAPBOX_HTML } from '../../../../components/Map/MapboxHtml';

export const Mapa = () => {
  const navigation = useNavigation<any>();
  const webViewRef = useRef<WebView>(null);
  const [reports, setReports] = useState<PersonReport[]>([]);
  const [selected, setSelected] = useState<PersonReport | null>(null);

  // el handler del Alerta (que hace al ser presionado)
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
    // Cambiamos GestureHandlerRootView por un View normal
    <View style={{ flex: 1 }}> 
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
    </View>
  );
};