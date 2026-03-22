import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './CreateCircleScreen.styles';

export const CreateCircleScreen: React.FC = () => {
  const navegacion = useNavigation();
  const [nombreCirculo, setNombreCirculo] = useState<string>('');

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

  const manejarContinuar = () => {
    console.log('Nombre del círculo:', nombreCirculo);
    // 🔜 Aquí irá navegación o llamada a backend
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

        <Text style={styles.tituloEncabezado}>
          Indica el nombre de tu Círculo
        </Text>
      </View>

      {/* Contenido */}
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
          />
        </View>

        {/* Sugerencias */}
        <Text style={styles.tituloSugerencias}>SUGERENCIAS</Text>

        {sugerencias.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemSugerencia}
            onPress={() => manejarSeleccionSugerencia(item)}
            accessibilityLabel={`Seleccionar ${item}`}
            accessibilityRole="button"
          >
            <View style={styles.iconoMas}>
              <Text>+</Text>
            </View>

            <Text style={styles.textoSugerencia}>{item}</Text>
          </TouchableOpacity>
        ))}

        {/* Botón */}
        <TouchableOpacity
          style={styles.botonContinuar}
          onPress={manejarContinuar}
          accessibilityLabel="Continuar"
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <Text style={styles.textoBoton}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};