import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './CreateCircleScreen.styles';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import httpClient from '../../../../services/httpService';

export const CreateCircleScreen: React.FC = () => {
  const navegacion = useNavigation();
  const route = useRoute();
  const { idVinculacion } = (route.params as { idVinculacion: number }) || {};

  const insets = useSafeAreaInsets();

  const [nombreCirculo, setNombreCirculo] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  const sugerencias = [
    'Familia',
    'Amigos',
    'Familia extendida',
    'Cuidadores',
    'Seres queridos',
    'Herman@s',
  ];

  const manejarSeleccionSugerencia = (nombre: string) => {
    setNombreCirculo(nombre);
  };

  const manejarContinuar = async () => {
    if (!nombreCirculo.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para tu círculo');
      return;
    }

    setCargando(true);
    try {
      await httpClient.put(`/vinculacion/circulo/${idVinculacion}`, {
        nombre_circulo: nombreCirculo.trim(),
      });
      console.log('[CreateCircle] Nombre guardado:', nombreCirculo);
      (navegacion as any).navigate('RolEnCirculo', { idVinculacion });
    } catch (err: any) {
      const mensaje = err.response?.data?.detail || 'Error al guardar el círculo';
      console.error('[CreateCircle] Error:', mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  const manejarRetroceder = () => {
    navegacion.goBack();
  };

  return (
    <View style={styles.areaSegura}>
      <KeyboardAvoidingView 
        style={styles.tecladoContenedor}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.contenedorPantalla}
          contentContainerStyle={[
            styles.contenidoScroll,
            {
              paddingTop: Math.max(insets.top, 20) + 10, 
              paddingBottom: Math.max(insets.bottom, 20) + 20,
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Encabezado */}
          <View style={styles.encabezado}>
            <TouchableOpacity
              onPress={manejarRetroceder}
              style={styles.botonRetroceder}
              accessibilityLabel="Regresar"
              accessibilityRole="button"
            >
              <Icon name="arrow-left" size={24} color="#14EC5C" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <ProgressBar pasoActual={4} pasosTotales={5} />
            </View>
          </View>

          {/* Contenido principal */}
          <View style={styles.contenedorContenido}>
            <View style={styles.iconoCirculo}>
              <Icon name="circle-outline" size={30} color="#0f172a" />
            </View>

            <Text style={styles.titulo}>
              Elige un nombre para tu nuevo Círculo
            </Text>

            <Text style={styles.descripcion}>
              Esto te ayuda a identificar quién está en este grupo
            </Text>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Escriba un nombre personalizado..."
                value={nombreCirculo}
                onChangeText={setNombreCirculo}
                style={styles.textoInput}
                editable={!cargando}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Sugerencias */}
            <Text style={styles.tituloSugerencias}>SUGERENCIAS</Text>

            {sugerencias.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.itemSugerencia}
                onPress={() => manejarSeleccionSugerencia(item)}
                disabled={cargando}
                accessibilityLabel={`Seleccionar ${item}`}
                accessibilityRole="button"
              >
                <View style={styles.iconoMas}>
                  <Text style={styles.textoIconoMas}>+</Text>
                </View>

                <Text style={styles.textoSugerencia}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón */}
          <TouchableOpacity
            style={[styles.botonContinuar, (!nombreCirculo.trim() || cargando) && { opacity: 0.5 }]}
            onPress={manejarContinuar}
            disabled={!nombreCirculo.trim() || cargando}
            accessibilityLabel="Continuar"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            {cargando ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.textoBoton}>Continuar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};