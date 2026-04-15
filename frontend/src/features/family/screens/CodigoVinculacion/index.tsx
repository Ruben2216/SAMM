import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Share, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IconoCompartir } from '../../../../assets/iconos/iconos-vinculacion';
import { styles } from './styles';
import { theme } from '../../../../theme';
import httpClient from '../../../../services/httpService';
import { useAuthStore } from '../../../auth/authStore';

export const CodigoVinculacion: React.FC = () => {
  const navegacion = useNavigation<any>();
  const usuario = useAuthStore((state) => state.usuario);
  const [codigoVinculacion, setCodigoVinculacion] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerCodigo = async () => {
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
      await Share.share({ message: mensaje, title: 'Código de vinculación SAMM' });
    } catch (error) {
      console.error('[CodigoVinculacion] Error al compartir:', error);
    }
  };

  const codigoArray = codigoVinculacion ? codigoVinculacion.split('') : [];

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenidoScroll}>
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={() => navegacion.goBack()} style={styles.botonRetroceder}>
          <Icon name="arrow-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>Código de vinculación</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contenido}>
        <View style={styles.iconoCirculo}>
          <Icon name="link-variant" size={40} color={theme.colors.primary} />
        </View>

        <Text style={styles.titulo}>Tu código de vinculación</Text>
        <Text style={styles.descripcion}>
          Comparte este código con tu familiar para conectarlo a tu cuenta
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={styles.textoError}>{error}</Text>
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
            >
              <IconoCompartir tamaño={30} color="#0f172a" />
              <Text style={styles.textoBotonCompartir}>Compartir código</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};
