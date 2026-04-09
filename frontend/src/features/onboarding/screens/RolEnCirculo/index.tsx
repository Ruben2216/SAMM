import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './RolEnCirculo.styles';
import { theme } from '../../../../theme';
import httpClient from '../../../../services/httpService';

const roles = [
  'Mamá',
  'Papá',
  'Abuelo/a',
  'Hijo/Hija',
  'Pareja/Cónyuge',
  'Amistad',
  'Otros',
];

export const RolEnCirculo: React.FC = () => {
  const navegacion = useNavigation();
  const route = useRoute();
  const { idVinculacion } = (route.params as { idVinculacion: number }) || {};

  const [rolSeleccionado, setRolSeleccionado] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  const manejarContinuar = async () => {
    if (!rolSeleccionado) return;

    setCargando(true);
    try {
      await httpClient.put(`/vinculacion/circulo/${idVinculacion}`, {
        rol_adulto_mayor: rolSeleccionado,
      });
      console.log('[RolEnCirculo] Rol guardado:', rolSeleccionado);
      (navegacion as any).navigate('SeniorTabs');
    } catch (err: any) {
      const mensaje = err.response?.data?.detail || 'Error al guardar el rol';
      console.error('[RolEnCirculo] Error:', mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  const manejarRetroceder = () => {
    navegacion.goBack();
  };

  return (
    <ScrollView
      style={styles.contenedorPantalla}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.filaEncabezado}>
        <TouchableOpacity
          onPress={manejarRetroceder}
          style={styles.botonRetroceder}
        >
          <Icon
            name="arrow-left"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.textoHeader}>Mi rol</Text>
      </View>

      {/* Contenido */}
      <View style={styles.contenido}>
        <Text style={styles.titulo}>
          ¿Cuál es tu rol en el{'\n'}Círculo Familiar?
        </Text>

        <Text style={styles.descripcion}>
          Selecciona la opción que mejor te describa.
        </Text>

        {/* Lista de opciones */}
        <View style={styles.listaOpciones}>
          {roles.map((rol) => {
            const seleccionado = rolSeleccionado === rol;

            return (
              <TouchableOpacity
                key={rol}
                style={[
                  styles.opcion,
                  seleccionado && styles.opcionSeleccionada,
                ]}
                onPress={() => setRolSeleccionado(rol)}
                activeOpacity={0.7}
                disabled={cargando}
              >
                <View
                  style={[
                    styles.radio,
                    seleccionado && styles.radioSeleccionado,
                  ]}
                />

                <Text style={styles.textoOpcion}>{rol}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Botón */}
      <TouchableOpacity
        style={[
          styles.botonContinuar,
          (!rolSeleccionado || cargando) && styles.botonDeshabilitado,
        ]}
        onPress={manejarContinuar}
        disabled={!rolSeleccionado || cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBoton}>Continuar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};
