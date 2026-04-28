import React, { useRef, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { ModalAyudaCodigo } from '../../../../components/ui/modal-ayuda-codigo';
import { SuccessModal } from '../../../../components/ui/success-modal';
import { styles } from './styles';
import { theme } from '../../../../theme';
import httpClient from '../../../../services/httpService';

export const VincularFamiliar: React.FC = () => {
  const hitSlopGrande = { top: 12, bottom: 12, left: 12, right: 12 };
  const navegacion = useNavigation<any>();
  const entradasRef = useRef<Array<TextInput | null>>([]);
  const [codigoIngresado, setCodigoIngresado] = useState<string[]>(['', '', '', '', '']);
  const [indiceFocus, setIndiceFocus] = useState<number>(0);
  const [esVisibleModalAyuda, setEsVisibleModalAyuda] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalExito, setModalExito] = useState<boolean>(false);

  const enfocarIndice = (nuevoIndice: number) => {
    setIndiceFocus(nuevoIndice);
    entradasRef.current[nuevoIndice]?.focus();
  };

  const manejarCambioCaracter = (texto: string, indice: number) => {
    if (error) setError(null);
    const textoLimpio = texto.replace(/\s/g, '').toUpperCase();

    if (!textoLimpio) {
      setCodigoIngresado((anterior) => {
        const nuevosCodigos = [...anterior];
        nuevosCodigos[indice] = '';
        return nuevosCodigos;
      });
      return;
    }

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

    if (indice > 0) {
      setCodigoIngresado((anterior) => {
        const nuevosCodigos = [...anterior];
        nuevosCodigos[indice - 1] = '';
        return nuevosCodigos;
      });
      requestAnimationFrame(() => enfocarIndice(indice - 1));
    }
  };

  const manejarRetroceder = () => {
    navegacion.goBack();
  };

  const manejarVincular = async () => {
    const codigoCompleto = codigoIngresado.join('');
    if (codigoCompleto.length !== 5) return;

    setCargando(true);
    setError(null);
    try {
      await httpClient.post('/vinculacion/validar', { codigo: codigoCompleto });
      setModalExito(true);
    } catch (err: any) {
      const mensaje = err.response?.data?.detail || 'Error al vincular';
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const manejarCierreExito = () => {
    setModalExito(false);
    navegacion.goBack();
  };

  const manejarAbrirAyudaCodigo = () => {
    setEsVisibleModalAyuda(true);
  };

  const manejarCerrarAyudaCodigo = () => {
    setEsVisibleModalAyuda(false);
  };

  const esValidoVincular = codigoIngresado.every((car) => car !== '') && !cargando;

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenidoScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ModalAyudaCodigo
        esVisible={esVisibleModalAyuda}
        alCerrar={manejarCerrarAyudaCodigo}
      />

      <SuccessModal
        esVisible={modalExito}
        mensaje="¡Vinculación exitosa!"
        alTerminar={manejarCierreExito}
      />

      <View style={styles.encabezado}>
        <TouchableOpacity
          onPress={manejarRetroceder}
          style={styles.botonRetroceder}
          hitSlop={hitSlopGrande}
          accessibilityLabel="Retroceder a pantalla anterior"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>Vincular familiar</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contenido}>
        <View style={styles.iconoCirculo}>
          <Icon name="link-variant" size={40} color={theme.colors.primary} />
        </View>

        <Text style={styles.titulo}>Ingresa el código de vinculación</Text>

        <Text style={styles.descripcion}>
          Escribe el código de 5 caracteres que aparece en el dispositivo de tu familiar
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
              editable={!cargando}
              accessibilityLabel={`Campo de código ${indice + 1}`}
            />
          ))}
        </View>

        {error && <Text style={styles.textoError}>{error}</Text>}

        <TouchableOpacity
          onPress={manejarAbrirAyudaCodigo}
          activeOpacity={0.7}
          accessibilityLabel="Abrir ayuda para encontrar el código de vinculación"
          accessibilityRole="button"
        >
          <Text style={styles.enlaceDonde}>¿Dónde encuentro el código?</Text>
        </TouchableOpacity>

        <View style={styles.espaciadorFlexible} />

        <PrimaryButton
          titulo={cargando ? 'Vinculando...' : 'Vincular'}
          alPresionar={manejarVincular}
          deshabilitado={!esValidoVincular}
          nombreIcono="link-variant"
          tamanoIcono={28}
        />
      </View>
    </ScrollView>
  );
};
