import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { IconoFlecha } from '../../../../assets/iconos/iconos-vinculacion';
import { styles } from './VinculacionSenior.styles';

export const VinculacionSenior: React.FC = () => {
  const navegacion = useNavigation();
  const [codigoIngresado, setCodigoIngresado] = useState<string[]>(['', '', '', '', '']);
  const [indiceFocus, setIndiceFocus] = useState<number>(0);

  const manejarCambioCaracter = (texto: string, indice: number) => {
    const nuevosCodigos = [...codigoIngresado];
    nuevosCodigos[indice] = texto.substring(texto.length - 1).toUpperCase();
    setCodigoIngresado(nuevosCodigos);

    if (texto && indice < 4) {
      setIndiceFocus(indice + 1);
    }
  };

  const manejarOmitir = () => {
    navegacion.navigate('Welcome' as never);
  };

  const manejarVincular = () => {
    const codigoCompleto = codigoIngresado.join('');
    if (codigoCompleto.length === 5) {
      console.log('Código ingresado:', codigoCompleto);
      navegacion.navigate('CreateCircleScreen' as never);
    }
  };

  const manejarDocumento = () => {
    console.log('Abrir documentación de dónde encontrar el código');
  };

  const esValidoVincular = codigoIngresado.every((car) => car !== '');

  return (
    <ScrollView
      style={styles.contenedorPantalla}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.seccionEncabezado}>
        <View style={styles.contenedorProgreso}>
          <ProgressBar pasoActual={3} pasosTotales={3} />
        </View>

        <TouchableOpacity onPress={manejarOmitir} activeOpacity={0.7}>
          <Text style={styles.textoOmitir}>Omitir</Text>
        </TouchableOpacity>
      </View>

      <View>
        <View style={styles.contenedorFlecha}>
          <IconoFlecha tamaño={23} />
        </View>

        <Text style={styles.titulo}>Ingresa el código de vinculacion</Text>

        <Text style={styles.descripcion}>
          Escribe el código de 5 caracteres que aparece en el dispositivo de tu
          familiar
        </Text>

        <View style={styles.contenedorCodigos}>
          {codigoIngresado.map((caracter, indice) => (
            <View key={indice} style={{ flex: 1 }}>
              <TextInput
                maxLength={1}
                value={caracter}
                onChangeText={(texto) => manejarCambioCaracter(texto, indice)}
                onFocus={() => setIndiceFocus(indice)}
                placeholder="-"
                placeholderTextColor="#0f172a"
                style={[
                  {
                    width: 55,
                    height: 72,
                    backgroundColor:
                      indiceFocus === indice ? '#b8e6c8' : '#d0fbde',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor:
                      indiceFocus === indice ? '#14EC5C' : '#f1f5f9',
                    fontSize: 40,
                    fontWeight: '700',
                    color: '#0f172a',
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  },
                ]}
                keyboardType="default"
                autoCapitalize="characters"
                selectTextOnFocus
                accessibilityLabel={`Campo de código ${indice + 1}`}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <PrimaryButton
        titulo="Vincular"
        alPresionar={manejarVincular}
        deshabilitado={!esValidoVincular}
      />

      <TouchableOpacity
        onPress={manejarDocumento}
        activeOpacity={0.7}
        style={{ marginBottom: 24 }}
      >
        <Text style={styles.enlaceDonde}>¿Dónde encuentro el código?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
