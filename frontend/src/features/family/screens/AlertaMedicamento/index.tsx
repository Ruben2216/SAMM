import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles';

export const AlertaMedicamento: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params as {
    nombreAdulto: string;
    rolAdulto: string;
    nombreMedicamento: string;
    horaToma: string;
    tipo: 'tomado' | 'olvidado';
  }) || {};

  const { nombreAdulto, rolAdulto, nombreMedicamento, horaToma, tipo } = params;

  const esOlvidado = tipo === 'olvidado';

  const formatearHora = (hora: string) => {
    if (!hora) return '';
    const [hStr, mStr] = hora.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  };

  const manejarLlamar = () => {
    // Aquí se podría obtener el teléfono del adulto mayor
    Alert.alert('Llamar', 'Funcionalidad de llamada próximamente');
  };

  const manejarMensaje = () => {
    Alert.alert('Mensaje', 'Funcionalidad de mensaje próximamente');
  };

  return (
    <View style={styles.contenedor}>
      {/* Header */}
      <View style={styles.encabezado}>
        <TouchableOpacity style={styles.botonAtras} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>Notificación de alerta</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Icono de alerta */}
      <View style={[styles.iconoAlerta, { backgroundColor: esOlvidado ? '#FEE2E2' : '#D1FAE5' }]}>
        <Ionicons
          name={esOlvidado ? 'warning-outline' : 'checkmark-circle-outline'}
          size={36}
          color={esOlvidado ? '#EF4444' : '#10B981'}
        />
      </View>

      {/* Título principal */}
      <Text style={styles.titulo}>
        {esOlvidado ? 'Medicación olvidada' : 'Medicamento tomado'}
      </Text>

      {/* Descripción */}
      <Text style={styles.descripcion}>
        {esOlvidado
          ? `${rolAdulto || 'El adulto mayor'} no tomó su medicación programada para las `
          : `${rolAdulto || 'El adulto mayor'} ha tomado su medicación programada de las `}
        <Text style={{ fontWeight: '800' }}>{formatearHora(horaToma || '')}</Text>
      </Text>

      {/* Tarjeta de estado */}
      <View style={styles.tarjetaEstado}>
        <View style={styles.estadoRow}>
          <View style={[styles.estadoPunto, { backgroundColor: esOlvidado ? '#EF4444' : '#10B981' }]} />
          <Text style={styles.estadoTexto}>
            Estado: {esOlvidado ? 'No responde' : 'Tomado'}
          </Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.contenedorBotones}>
        <TouchableOpacity style={styles.botonLlamar} onPress={manejarLlamar} activeOpacity={0.8}>
          <Ionicons name="call-outline" size={22} color="#FFFFFF" />
          <Text style={styles.botonLlamarTexto}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonMensaje} onPress={manejarMensaje} activeOpacity={0.8}>
          <Ionicons name="chatbox-outline" size={22} color="#0F172A" />
          <Text style={styles.botonMensajeTexto}>Mensaje</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.textoVerDetalles}>Ver detalles del medicamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
