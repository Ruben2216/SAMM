import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  Linking, Alert, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './PersonCard.styles';

const SMS_MENSAJE = '¿En dónde estás? Comunícate conmigo, me tienes preocupado/a.';

const obtenerIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return (partes[0][0] ?? '').toUpperCase();
  return `${partes[0][0] ?? ''}${partes[partes.length - 1][0] ?? ''}`.toUpperCase();
};

interface AvatarProps {
  foto: string | null;
  nombre: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ foto, nombre, size = 52 }) => {
  const [error, setError] = useState(false);
  const mostrarImagen = foto && !error;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {mostrarImagen ? (
        <Image
          source={{ uri: foto }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setError(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: '#1D9E75' }}>
          {obtenerIniciales(nombre)}
        </Text>
      )}
    </View>
  );
};

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
    const cuerpo = encodeURIComponent(SMS_MENSAJE);
    const url = Platform.OS === 'ios'
      ? `sms:${telefono}&body=${cuerpo}`
      : `sms:${telefono}?body=${cuerpo}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir la app de mensajes.')
    );
  };

  // ── NUEVO ──────────────────────────────────────────
  const handleAlerta = () => {
    Alert.alert(
      '¿Llamar al 911?',
      `¿Deseas reportar una emergencia por ${person.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar al 911',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:911').catch(() =>
              Alert.alert('Error', 'No se pudo abrir la app de teléfono.')
            );
          },
        },
      ]
    );
    onAlert?.(); // sigue notificando al padre si lo necesita
  };
  // ───────────────────────────────────────────────────

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <Avatar foto={person.foto} nombre={person.nombre} size={52} />

        <View style={styles.info}>
          <Text style={styles.name}>{person.nombre}</Text>
          <Text style={styles.status}>
            {person.rastreoActivo ? 'rastreo activo' : 'Rastreo Inactivo'}
          </Text>
          <Text style={styles.time}>
            Último reporte a las {person.ultimaActualizacion}
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLlamar}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="call-outline" size={20} color="#1D9E75" />
            </View>
            <Text style={styles.actionText}>llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSMS}>
            <View style={styles.actionIconCircle}>
              <MaterialCommunityIcons name="message-outline" size={20} color="#1D9E75" />
            </View>
            <Text style={styles.actionText}>enviar msm</Text>
          </TouchableOpacity>

          {/* ── CAMBIO: onAlert → handleAlerta ── */}
          <TouchableOpacity style={styles.alertButton} onPress={handleAlerta}>
            <Ionicons name="warning-outline" size={16} color="#fff" />
            <Text style={styles.alertText}>Alerta</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};