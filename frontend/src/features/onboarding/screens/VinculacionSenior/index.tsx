import React, { useRef, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { ModalAyudaCodigo } from '../../../../components/ui/modal-ayuda-codigo';
import { styles } from './VinculacionSenior.styles';
import { theme } from '../../../../theme';

export const VinculacionSenior: React.FC = () => {
  const hitSlopGrande = { top: 12, bottom: 12, left: 12, right: 12 };
  const navegacion = useNavigation();
  const entradasRef = useRef<Array<TextInput | null>>([]);
  const [codigoIngresado, setCodigoIngresado] = useState<string[]>(['', '', '', '', '']);
  const [indiceFocus, setIndiceFocus] = useState<number>(0);
  const [esVisibleModalAyuda, setEsVisibleModalAyuda] = useState<boolean>(false);

  const enfocarIndice = (nuevoIndice: number) => {
    setIndiceFocus(nuevoIndice);
    entradasRef.current[nuevoIndice]?.focus();
  };

  const manejarCambioCaracter = (texto: string, indice: number) => {
    const textoLimpio = texto.replace(/\s/g, '').toUpperCase();

    if (!textoLimpio) {
      setCodigoIngresado((anterior) => {
        const nuevosCodigos = [...anterior];
        nuevosCodigos[indice] = '';
        return nuevosCodigos;
      });
      return;
    }

    // Soporta pegado de varios caracteres
    const caracteres = textoLimpio.split('');
    setCodigoIngresado((anterior) => {
      const nuevosCodigos = [...anterior];
      for (let desplazamiento = 0; desplazamiento < caracteres.length; desplazamiento += 1) {
        const indiceDestino = indice + desplazamiento;
        if (indiceDestino > 4) break;
        nuevosCodigos[indiceDestino] = caracteres[desplazamiento];
      }
      return nuevosCodigos;
    });

    const indiceSiguiente = Math.min(indice + caracteres.length, 4);
    if (indiceSiguiente !== indice) {
      requestAnimationFrame(() => enfocarIndice(indiceSiguiente));
    }
  };

  const manejarTeclaPresionada = (tecla: string, indice: number) => {
    if (tecla !== 'Backspace') return;

    // Si la casilla actual tiene valor, bórrala y enfoca la anterior.
    if (codigoIngresado[indice] !== '') {
      setCodigoIngresado((anterior) => {
        const nuevosCodigos = [...anterior];
        nuevosCodigos[indice] = '';
        return nuevosCodigos;
      });

      if (indice > 0) {
        requestAnimationFrame(() => enfocarIndice(indice - 1));
      }
      return;
    }

    // Si está vacía, borra la anterior y muévete a la izquierda.
    if (indice > 0) {
      setCodigoIngresado((anterior) => {
        const nuevosCodigos = [...anterior];
        nuevosCodigos[indice - 1] = '';
        return nuevosCodigos;
      });
      requestAnimationFrame(() => enfocarIndice(indice - 1));
    }
  };

  const manejarOmitir = () => {
    console.log('[VinculacionSenior] Omitir — navegando a SeniorTabs');
    (navegacion as any).navigate('SeniorTabs');
  };

  const manejarRetroceder = () => {
    navegacion.goBack();
  };

  const manejarVincular = () => {
    const codigoCompleto = codigoIngresado.join('');
    if (codigoCompleto.length === 5) {
      console.log('Código ingresado:', codigoCompleto);
      navegacion.navigate('CreateCircleScreen' as never);
    }
  };

  const manejarAbrirAyudaCodigo = () => {
    setEsVisibleModalAyuda(true);
  };

  const manejarCerrarAyudaCodigo = () => {
    setEsVisibleModalAyuda(false);
  };

  const esValidoVincular = codigoIngresado.every((car) => car !== '');

  return (
    <ScrollView
      style={styles.contenedorPantalla}
      contentContainerStyle={styles.contenidoScroll}
      showsVerticalScrollIndicator={false}
    >
      <ModalAyudaCodigo
        esVisible={esVisibleModalAyuda}
        alCerrar={manejarCerrarAyudaCodigo}
      />

      <View style={styles.filaEncabezado}>
        <TouchableOpacity
          onPress={manejarRetroceder}
          style={styles.botonRetroceder}
          hitSlop={hitSlopGrande}
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
        <Text style={styles.titulo}>Ingresa el código de vinculacion</Text>

        <Text style={styles.descripcion}>
          Escribe el código de 5 caracteres que aparece en el dispositivo de tu
          familiar
        </Text>

        <View style={styles.contenedorCodigos}>
          {codigoIngresado.map((caracter, indice) => (
            <TextInput
              key={indice}
              ref={(referencia) => {
                entradasRef.current[indice] = referencia;
              }}
              maxLength={1}
              value={caracter}
              onChangeText={(texto) => manejarCambioCaracter(texto, indice)}
              onKeyPress={(evento) =>
                manejarTeclaPresionada(evento.nativeEvent.key, indice)
              }
              onFocus={() => setIndiceFocus(indice)}
              placeholder="-"
              placeholderTextColor="#0f172a"
              style={[
                styles.campoCodigo,
                indiceFocus === indice
                  ? styles.campoCodigoActivo
                  : styles.campoCodigoInactivo,
              ]}
              keyboardType="default"
              autoCapitalize="characters"
              autoCorrect={false}
              selectTextOnFocus
              accessibilityLabel={`Campo de código ${indice + 1}`}
            />
          ))}
        </View>
      </View>

      <View style={styles.espaciadorFlexible} />

      <PrimaryButton
        titulo="Vincular"
        alPresionar={manejarVincular}
        deshabilitado={!esValidoVincular}
        nombreIcono="link-variant"
        tamanoIcono={36}
      />

      <TouchableOpacity
        onPress={manejarAbrirAyudaCodigo}
        activeOpacity={0.7}
        style={styles.contenedorEnlaceDonde}
        accessibilityLabel="Abrir ayuda para encontrar el código de vinculación"
        accessibilityRole="button"
      >
        <Text style={styles.enlaceDonde}>¿Dónde encuentro el código?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
