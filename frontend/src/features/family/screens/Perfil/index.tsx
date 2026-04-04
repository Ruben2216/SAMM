import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './MiPerfil.styles';
import { PerfilFamiliarState } from './types';

export const MiPerfilFamiliar: React.FC = () => {
  const navigation = useNavigation();

  const [state, setState] = useState<PerfilFamiliarState>({
    nombre: 'Carlos Gómez',
    correo: 'carlos.gomez@email.com',
    rol: 'Administrador',
    familiares: [
      { id: '1', nombre: 'Carlos Gómez', rol: 'Administrador', esPrincipal: true },
      { id: '2', nombre: 'María Gómez', rol: 'Mi Hermana' },
    ],
    notificaciones: {
      tomaCorrecta: true,
      olvidoCritico: true,
      salidaZona: true,
      bateriaBaja: true,
    },
    supervision: {
      frecuenciaRastreo: '15 min',
      tiempoMaxSinReporte: '1 hora',
    },
    biometriaActiva: true,
  });

  const toggleNotificacion = (key: keyof typeof state.notificaciones) => {
    setState(prev => ({
      ...prev,
      notificaciones: {
        ...prev.notificaciones,
        [key]: !prev.notificaciones[key],
      },
    }));
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <TouchableOpacity>
          <Text style={styles.save}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* PERFIL */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>CG</Text>
        </View>

        <Text style={styles.name}>{state.nombre}</Text>
        <Text style={styles.email}>{state.correo}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{state.rol}</Text>
        </View>
      </View>

      {/* FAMILIA */}
      <Text style={styles.sectionTitle}>FAMILIA</Text>
      <View style={styles.card}>
        {state.familiares.map(f => (
          <View key={f.id} style={styles.row}>
            <View>
              <Text style={styles.nameSmall}>{f.nombre}</Text>
              <Text style={styles.subText}>{f.rol}</Text>
            </View>

            {f.esPrincipal && (
              <Text style={styles.principal}>Principal</Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate('VinculacionFamiliar' as never)}
        >
          <Text style={styles.add}>+ Agregar Familiar</Text>
        </TouchableOpacity>
      </View>

      {/* NOTIFICACIONES */}
      <Text style={styles.sectionTitle}>ALERTAS Y NOTIFICACIONES</Text>
      <View style={styles.card}>
        {[
          ['tomaCorrecta', 'Toma Correcta'],
          ['olvidoCritico', 'Olvido Crítico'],
          ['salidaZona', 'Salida Zona Segura'],
          ['bateriaBaja', 'Batería Baja'],
        ].map(([key, label]) => (
          <View key={key} style={styles.row}>
            <Text>{label}</Text>
            <Switch
              value={state.notificaciones[key as keyof typeof state.notificaciones]}
              onValueChange={() => toggleNotificacion(key as any)}
            />
          </View>
        ))}
      </View>

      {/* SUPERVISIÓN */}
      <Text style={styles.sectionTitle}>NIVEL DE SUPERVISIÓN</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text>Frecuencia de rastreo</Text>
          <Text>{state.supervision.frecuenciaRastreo}</Text>
        </View>

        <View style={styles.row}>
          <Text>Tiempo máx. sin reporte</Text>
          <Text>{state.supervision.tiempoMaxSinReporte}</Text>
        </View>
      </View>

      {/* SEGURIDAD */}
      <Text style={styles.sectionTitle}>SEGURIDAD</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text>Activar Biometría</Text>
          <Switch
            value={state.biometriaActiva}
            onValueChange={() =>
              setState(prev => ({
                ...prev,
                biometriaActiva: !prev.biometriaActiva,
              }))
            }
          />
        </View>

        <TouchableOpacity>
          <Text style={styles.link}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text>SAMM v1</Text>
        <TouchableOpacity>
          <Text style={styles.link}>Ayuda y soporte</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};