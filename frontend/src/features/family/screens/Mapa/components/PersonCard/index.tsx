import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { styles } from './PersonCard.styles';

export const PersonCard = ({ person, isSelected, onPress, onAlert }) => {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    setExpanded(!expanded);
    onPress();
  };

  // ✅ Sin canOpenURL — llama directamente
  const handleLlamar = () => {
    Linking.openURL(`tel:${person.telefono}`).catch(() =>
      Alert.alert('Error', 'No se pudo abrir la app de teléfono.')
    );
  };

  // ✅ Sin canOpenURL — abre SMS directamente
  const handleSMS = () => {
    Linking.openURL(`sms:${person.telefono}`).catch(() =>
      Alert.alert('Error', 'No se pudo abrir la app de mensajes.')
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selected]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <Image source={{ uri: person.foto }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{person.nombre}</Text>
          <Text style={styles.status}>esta en casa</Text>
          <Text style={styles.time}>
            Último reporte a las {person.ultimaActualizacion}
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLlamar}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSMS}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>enviar msm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.alertButton} onPress={onAlert}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertText}>Alerta</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};