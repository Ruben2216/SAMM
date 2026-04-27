/**
 * frontend/src/features/family/screens/Mapa/index.tsx
 *
 * VERSIÓN ACTUALIZADA: consume el tracking-service en lugar de datos hardcodeados.
 * Cambios respecto al original:
 *   - getReports() ahora recibe el idFamiliar del store de auth
 *   - Se refresca la ubicación automáticamente cada 30 segundos
 *   - El BottomSheet muestra la hora del último reporte real
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import CustomBottomSheet from './components/BottomSheet';
import { PersonReport } from './mapa.types';
import { getReports } from '../../../../services/reportService';
import { MAPBOX_HTML } from '../../../../components/Map/MapboxHtml';
import { useAuthStore } from '../../../auth/authStore';

// Intervalo de refresco del mapa (ms). El familiar ve ubicaciones actualizadas
// sin tener que cerrar y abrir la pantalla.
const REFRESH_INTERVAL_MS = 30_000;

export const Mapa = () => {
  const navigation   = useNavigation<any>();
  const webViewRef   = useRef<WebView>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [reports,  setReports]  = useState<PersonReport[]>([]);
  const [selected, setSelected] = useState<PersonReport | null>(null);

  // Obtenemos el id del familiar logueado
  const usuario = useAuthStore((s) => s.usuario);

  // ── Cargar y actualizar ubicaciones ────────────────────────────────────────

  const cargarUbicaciones = useCallback(async () => {
    if (!usuario?.Id_Usuario) return;

    const data = await getReports(usuario.Id_Usuario);
    setReports(data);

    // Si el mapa ya está montado, actualizamos los pins sin recargar
    if (webViewRef.current && data.length > 0) {
      enviarPersonasAlMapa(data);
    }
  }, [usuario?.Id_Usuario]);

  useEffect(() => {
    // Carga inicial
    cargarUbicaciones();

    // Refresco automático cada 30 segundos
    intervalRef.current = setInterval(cargarUbicaciones, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cargarUbicaciones]);

  // ── WebView handlers ───────────────────────────────────────────────────────

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

  const handleAlert = (persona: PersonReport) => {
    navigation.navigate('Alert', { persona });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFillObject}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          source={{ html: MAPBOX_HTML }}
          style={{ flex: 1 }}
          onLoad={handleWebViewLoad}
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