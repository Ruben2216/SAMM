import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './PersonCard.styles';

// Mensaje predeterminado que se envía por SMS
const SMS_MENSAJE = '¿En dónde estás? Comunícate conmigo, me tienes preocupado/a.';

export const PersonCard = ({ person, isSelected, onPress, onAlert }) => {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    setExpanded(!expanded);
    onPress();
  };

  const handleLlamar = () => {
    const telefono = person.telefono?.trim();
    if (!telefono) {
      Alert.alert('Sin teléfono', 'Este usuario no tiene número de teléfono registrado.');
      return;
    }
    Linking.openURL(`tel:${telefono}`).catch(() =>
      Alert.alert('Error', 'No se pudo abrir la app de teléfono.')
    );
  };

  const handleSMS = () => {
    const telefono = person.telefono?.trim();
    if (!telefono) {
      Alert.alert('Sin teléfono', 'Este usuario no tiene número de teléfono registrado.');
      return;
    }

    // Android usa ?body=  /  iOS usa &body=
    const cuerpo = encodeURIComponent(SMS_MENSAJE);
    const url = Platform.OS === 'ios'
      ? `sms:${telefono}&body=${cuerpo}`
      : `sms:${telefono}?body=${cuerpo}`;

    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir la app de mensajes.')
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* ── Fila principal: foto + info ── */}
      <View style={styles.row}>
        <Image
          source={{ uri: person.foto }}
          style={styles.image}
         // defaultSource={require('../../../../../../assets/avatar_placeholder.png')}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{person.nombre}</Text>
          <Text style={styles.status}>
            {person.rastreoActivo ? 'rastreo activo' : 'esta en casa'}
          </Text>
          <Text style={styles.time}>
            Último reporte a las {person.ultimaActualizacion}
          </Text>
        </View>
      </View>

      {/* ── Acciones expandidas ── */}
      {expanded && (
        <View style={styles.actions}>

          {/* Llamar */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLlamar}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="call-outline" size={20} color="#1D9E75" />
            </View>
            <Text style={styles.actionText}>llamar</Text>
          </TouchableOpacity>

          {/* Enviar SMS */}
          <TouchableOpacity style={styles.actionButton} onPress={handleSMS}>
            <View style={styles.actionIconCircle}>
              <MaterialCommunityIcons name="message-outline" size={20} color="#1D9E75" />
            </View>
            <Text style={styles.actionText}>enviar msm</Text>
          </TouchableOpacity>

          {/* Alerta */}
          <TouchableOpacity style={styles.alertButton} onPress={onAlert}>
            <Ionicons name="warning-outline" size={16} color="#fff" />
            <Text style={styles.alertText}>Alerta</Text>
          </TouchableOpacity>

        </View>
      )}
    </TouchableOpacity>
  );
};