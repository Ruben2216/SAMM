import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';
import { SuccessModal } from '../../../../components/ui/success-modal';

export const RecordatorioMedicamento: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params as {
    idMedicamento: number;
    nombreMedicamento: string;
    dosis: string;
    notas: string;
    horaToma: string;
  }) || {};

  const { idMedicamento, nombreMedicamento, dosis, notas, horaToma } = params;
  const [cargando, setCargando] = useState(false);
  const [modalExito, setModalExito] = useState(false);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

  // Formatear hora para mostrar
  const formatearHora = (hora: string) => {
    if (!hora) return '';
    const [hStr, mStr] = hora.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };

  const manejarMarcarTomado = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch(`${apiUrl}/medicamentos/${idMedicamento}/tomar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hora_asignada: horaToma }),
      });

      if (respuesta.ok) {
        setModalExito(true);
      } else {
        Alert.alert('Error', 'No se pudo registrar la toma.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const manejarRecordar = () => {
    // Programar recordatorio en 10 minutos
    navigation.goBack();
  };

  const manejarOmitir = () => {
    navigation.goBack();
  };

  const manejarCerrar = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.contenedor}>
      {/* Botón cerrar */}
      <TouchableOpacity style={styles.botonCerrar} onPress={manejarCerrar}>
        <Ionicons name="close" size={28} color="#0F172A" />
      </TouchableOpacity>

      {/* Badge de hora */}
      <View style={styles.badgeHora}>
        <Text style={styles.badgeHoraTexto}>
          RECORDATORIO {formatearHora(horaToma || '')}
        </Text>
      </View>

      {/* Título */}
      <Text style={styles.titulo}>
        ¡Es hora de tomar{'\n'}tus medicamentos!
      </Text>

      {/* Tarjeta del medicamento */}
      <View style={styles.tarjetaMedicamento}>
        <Text style={styles.tarjetaNombre}>{nombreMedicamento || 'Medicamento'}</Text>
        <Text style={styles.tarjetaDosis}>
          {dosis || ''}
        </Text>
        {notas ? (
          <Text style={styles.tarjetaNotas}>{notas}</Text>
        ) : null}
      </View>

      {/* Botones de acción */}
      <View style={styles.contenedorBotones}>
        <TouchableOpacity
          style={styles.botonTomado}
          onPress={manejarMarcarTomado}
          activeOpacity={0.8}
          disabled={cargando}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.botonTomadoTexto}>Marcar como tomado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonRecordar}
          onPress={manejarRecordar}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={24} color="#0F172A" />
          <Text style={styles.botonRecordarTexto}>Recordar en 10 minutos</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={manejarOmitir} activeOpacity={0.7}>
          <Text style={styles.textoOmitir}>Omitir esta dosis</Text>
        </TouchableOpacity>
      </View>

      <SuccessModal
        esVisible={modalExito}
        mensaje="Medicamento registrado como tomado"
        alTerminar={() => {
          setModalExito(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};
