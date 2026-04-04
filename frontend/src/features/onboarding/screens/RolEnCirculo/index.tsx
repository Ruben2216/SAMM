import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './RolEnCirculo.styles';
import { theme } from '../../../../theme';

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
  const [rolSeleccionado, setRolSeleccionado] = useState<string | null>(null);

  const manejarContinuar = () => {
    if (!rolSeleccionado) return;

    console.log('Rol seleccionado:', rolSeleccionado);

    // 👉 Aquí navegas a la siguiente pantalla
    // navegacion.navigate('SiguientePantalla');
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
          !rolSeleccionado && styles.botonDeshabilitado,
        ]}
        onPress={manejarContinuar}
        disabled={!rolSeleccionado}
      >
        <Text style={styles.textoBoton}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};