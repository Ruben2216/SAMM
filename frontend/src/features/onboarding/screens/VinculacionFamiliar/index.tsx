import React, { useEffect, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Share, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { IconoCompartir } from '../../../../assets/iconos/iconos-vinculacion';
import { styles } from './VinculacionFamiliar.styles';
import { theme } from '../../../../theme';
import httpClient from '../../../../services/httpService';
import { useAuthStore } from '../../../auth/authStore';

export const VinculacionFamiliar: React.FC = () => {
  const navegacion = useNavigation();
  const usuario = useAuthStore((state) => state.usuario);
  const [codigoVinculacion, setCodigoVinculacion] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerCodigo = async () => {
      // Si el usuario ya tiene código guardado, usarlo directamente
      if (usuario?.Codigo_Vinculacion) {
        setCodigoVinculacion(usuario.Codigo_Vinculacion);
        setCargando(false);
        return;
      }

      try {
        const response = await httpClient.post('/vinculacion/generar');
        setCodigoVinculacion(response.data.codigo);
      } catch (err: any) {
        const mensaje = err.response?.data?.detail || 'Error al obtener el código';
        console.error('[VinculacionFamiliar] Error:', mensaje);
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    obtenerCodigo();
  }, []);

  const manejarCompartir = async () => {
    try {
      const mensaje = `Hola. Este es tu código de vinculación para la aplicación SAMM: ${codigoVinculacion}. Ingrésalo en la pantalla de vinculación de tu dispositivo para conectar nuestras cuentas.`;

      await Share.share({
        message: mensaje,
        title: 'Código de vinculación SAMM',
      });
    } catch (error) {
      console.error('[VinculacionFamiliar] Error al compartir el código:', error);
    }
  };

  const manejarRetroceder = () => {
    navegacion.goBack();
  };

  const manejarOmitir = () => {
    console.log('[VinculacionFamiliar] Omitir — navegando a FamilyTabs');
    (navegacion as any).navigate('FamilyTabs');
  };

  const codigoArray = codigoVinculacion ? codigoVinculacion.split('') : [];

  return (
    <ScrollView
      style={styles.contenedorPantalla}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filaEncabezado}>
        <TouchableOpacity
          onPress={manejarRetroceder}
          style={styles.botonRetroceder}
          accessibilityLabel="Retroceder a pantalla anterior"
          accessibilityRole="button"
        >
          <Icon
            name="arrow-left"
            size={24}
            color={theme.colors.primary}
            style={styles.iconoRetroceder}
          />
        </TouchableOpacity>

        <View style={styles.contenedorProgreso}>
          <ProgressBar pasoActual={3} pasosTotales={3} />
        </View>
      </View>

      <View style={styles.filaOmitir}>
        <TouchableOpacity
          onPress={manejarOmitir}
          activeOpacity={0.7}
          accessibilityLabel="Omitir vinculación y continuar a la pantalla principal"
          accessibilityRole="button"
        >
          <Text style={styles.textoOmitir}>Omitir</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.titulo}>Vincula el dispositivo</Text>

        <Text style={styles.descripcion}>
          Comparte este código con tu familiar para conectarlo a tu cuenta
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 32 }}>{error}</Text>
        ) : (
          <>
            <View style={styles.contenedorCodigos}>
              {codigoArray.map((caracter, indice) => (
                <View key={indice} style={styles.cajaCodigo}>
                  <Text style={styles.textoCodigoCaracter}>{caracter}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.botonCompartir}
              onPress={manejarCompartir}
              activeOpacity={0.8}
              accessibilityLabel="Compartir código de vinculación"
              accessibilityRole="button"
            >
              <IconoCompartir tamaño={36} color="#0f172a" />
              <Text style={styles.textoBotonCompartir}>Compartir código</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};
