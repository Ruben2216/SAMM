import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Switch,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { theme } from '../../../../theme';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';
import { ConfirmationModal } from '../../../../components/ui/confirmation-modal';

interface PerfilSaludData {
  Tipo_Sangre: string;
  Alergias: string;
  Peso: string;
  Edad: string;
  Condicion_Medica: string;
  Telefono: string;
}

export const Perfil = () => {
  const navigation = useNavigation<any>();
  const usuario = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  const apiMedicamentos = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

  const [vinculacion, setVinculacion] = useState<any>(null);
  const [perfil, setPerfil] = useState<PerfilSaludData>({
    Tipo_Sangre: '',
    Alergias: '',
    Peso: '',
    Edad: '',
    Condicion_Medica: '',
    Telefono: '',
  });
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const userId = usuario?.Id_Usuario;
      if (!userId) return;

      try {
        const res = await fetch(`${apiMedicamentos}/perfil-salud/usuario/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPerfil({
            Tipo_Sangre: data.Tipo_Sangre || '',
            Alergias: data.Alergias || '',
            Peso: data.Peso || '',
            Edad: data.Edad ? String(data.Edad) : '',
            Condicion_Medica: data.Condicion_Medica || '',
            Telefono: data.Telefono || '',
          });
        }
      } catch (err) {
        console.log('Sin perfil de salud aún');
      }

      try {
        const resVinc = await httpClient.get('/vinculacion/mis-vinculaciones');
        if (resVinc.data.length > 0) {
          setVinculacion(resVinc.data[0]);
        }
      } catch (err) {
        console.log('Sin vinculación');
      }
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const guardarPerfil = async () => {
    try {
      setGuardando(true);
      const userId = usuario?.Id_Usuario;
      if (!userId) return;

      const res = await fetch(`${apiMedicamentos}/perfil-salud/usuario/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Tipo_Sangre: perfil.Tipo_Sangre || null,
          Alergias: perfil.Alergias || null,
          Peso: perfil.Peso || null,
          Edad: perfil.Edad ? parseInt(perfil.Edad) : null,
          Condicion_Medica: perfil.Condicion_Medica || null,
          Telefono: perfil.Telefono || null,
        }),
      });

      if (res.ok) {
        setEditando(false);
        Alert.alert('Guardado', 'Tu perfil de salud se actualizó correctamente.');
      } else {
        Alert.alert('Error', 'No se pudo guardar el perfil.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const manejarCerrarSesion = async () => {
    try {
      await cerrarSesion();
      setModalVisible(false);
      navigation.reset({ index: 0, routes: [{ name: 'Initial' }] });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  const nombreUsuario = usuario?.Nombre || 'Usuario';
  const iniciales = nombreUsuario.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2);

  if (cargando) {
    return (
      <View style={[styles.perfil, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.perfil} showsVerticalScrollIndicator={false}>
      {/* --- ENCABEZADO --- */}
      <View style={styles.encabezado}>
        <Text style={styles.encabezado__titulo}>Mi Perfil</Text>
        <TouchableOpacity onPress={() => editando ? guardarPerfil() : setEditando(true)}>
          {guardando ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.encabezado__accion}>{editando ? 'Guardar' : 'Editar'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contenido}>
        {/* --- TARJETA PERFIL --- */}
        <View style={styles.tarjetaPerfil}>
          <View style={styles.tarjetaPerfil__avatar}>
            <Text style={styles.tarjetaPerfil__textoAvatar}>{iniciales}</Text>
            <View style={styles.tarjetaPerfil__bordeAvatar} />
          </View>
          <Text style={styles.tarjetaPerfil__nombre}>{nombreUsuario}</Text>
          <Text style={styles.tarjetaPerfil__correo}>{usuario?.Correo}</Text>
          <View style={styles.tarjetaPerfil__badge}>
            <Text style={styles.tarjetaPerfil__badgeTexto}>
              {perfil.Edad ? `${perfil.Edad} AÑOS` : 'EDAD NO REGISTRADA'}
            </Text>
          </View>
        </View>

        {/* --- MI CÍRCULO --- */}
        <Text style={styles.tituloSeccion}>
          {vinculacion?.Nombre_Circulo ? vinculacion.Nombre_Circulo.toUpperCase() : 'MI CÍRCULO'}
        </Text>
        <View style={styles.tarjetaSeccion}>
          {/* Fila: YO */}
          <View style={[styles.filaFamilia, styles.fila__separador]}>
            <View style={styles.filaFamilia__izquierda}>
              <View style={styles.filaFamilia__avatarYo}>
                <Text style={styles.filaFamilia__textoAvatarYo}>YO</Text>
              </View>
              <View style={styles.filaFamilia__texto}>
                <Text style={styles.filaFamilia__nombre}>{nombreUsuario}</Text>
                <Text style={styles.filaFamilia__rol}>Adulto Mayor</Text>
              </View>
            </View>
            <View style={styles.filaFamilia__badgePrincipal}>
              <Text style={styles.filaFamilia__badgePrincipalTexto}>Tú</Text>
            </View>
          </View>

          {/* Fila: CUIDADOR */}
          {vinculacion && (
            <View style={styles.filaFamilia}>
              <View style={styles.filaFamilia__izquierda}>
                <View style={styles.filaFamilia__avatar}>
                  <Text style={styles.filaFamilia__textoAvatar}>
                    {vinculacion.Nombre_Familiar?.substring(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.filaFamilia__texto}>
                  <Text style={styles.filaFamilia__nombre}>{vinculacion.Nombre_Familiar}</Text>
                  <Text style={styles.filaFamilia__rol}>{vinculacion.Rol_Adulto_Mayor || 'Familiar'}</Text>
                </View>
              </View>
              <View style={styles.filaFamilia__badgeColaborador}>
                <Text style={styles.filaFamilia__badgeColaboradorTexto}>Cuidador</Text>
              </View>
            </View>
          )}
        </View>

        {/* --- DATOS DE SALUD --- */}
        <Text style={styles.tituloSeccion}>DATOS DE SALUD</Text>
        <View style={styles.tarjetaSeccion}>
          {editando ? (
            <View style={{ padding: 16 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Edad</Text>
                <TextInput
                  style={styles.inputStyle}
                  value={perfil.Edad}
                  onChangeText={(v) => setPerfil(p => ({ ...p, Edad: v }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de Sangre</Text>
                <TextInput
                  style={styles.inputStyle}
                  value={perfil.Tipo_Sangre}
                  onChangeText={(v) => setPerfil(p => ({ ...p, Tipo_Sangre: v }))}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Alergias</Text>
                <TextInput
                  style={styles.inputStyle}
                  value={perfil.Alergias}
                  onChangeText={(v) => setPerfil(p => ({ ...p, Alergias: v }))}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Peso</Text>
                <TextInput
                  style={styles.inputStyle}
                  value={perfil.Peso}
                  onChangeText={(v) => setPerfil(p => ({ ...p, Peso: v }))}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Condición Médica</Text>
                <TextInput
                  style={styles.inputStyle}
                  value={perfil.Condicion_Medica}
                  onChangeText={(v) => setPerfil(p => ({ ...p, Condicion_Medica: v }))}
                />
              </View>
              <TouchableOpacity
                onPress={() => setEditando(false)}
                style={styles.filaAccion}
              >
                <Text style={styles.filaAccion__texto}>Cancelar Edición</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={[styles.filaSupervision, styles.fila__separador]}>
                <View style={styles.filaSupervision__texto}>
                  <Text style={styles.filaSupervision__titulo}>Tipo de Sangre</Text>
                  <Text style={styles.filaSupervision__descripcion}>{perfil.Tipo_Sangre || 'No registrado'}</Text>
                </View>
                <Icon name="heart-pulse" size={24} color={theme.colors.error} />
              </View>
              <View style={[styles.filaSupervision, styles.fila__separador]}>
                <View style={styles.filaSupervision__texto}>
                  <Text style={styles.filaSupervision__titulo}>Alergias</Text>
                  <Text style={styles.filaSupervision__descripcion}>{perfil.Alergias || 'Ninguna'}</Text>
                </View>
                <Icon name="alert-circle-outline" size={24} color="#F59E0B" />
              </View>
              <View style={[styles.filaSupervision, styles.fila__separador]}>
                <View style={styles.filaSupervision__texto}>
                  <Text style={styles.filaSupervision__titulo}>Peso</Text>
                  <Text style={styles.filaSupervision__descripcion}>{perfil.Peso || 'No registrado'}</Text>
                </View>
                <Icon name="scale-bathroom" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.filaSupervision}>
                <View style={styles.filaSupervision__texto}>
                  <Text style={styles.filaSupervision__titulo}>Condición</Text>
                  <Text style={styles.filaSupervision__descripcion}>{perfil.Condicion_Medica || 'Estable'}</Text>
                </View>
                <Icon name="medical-bag" size={24} color="#6366F1" />
              </View>
            </>
          )}
        </View>

        {/* --- CONTACTO Y SEGURIDAD --- */}
        <Text style={styles.tituloSeccion}>SEGURIDAD</Text>
        <View style={styles.tarjetaSeccion}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.filaBoton}
          >
            <Text style={styles.filaBoton__texto}>Cerrar Sesión</Text>
            <Icon name="logout" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.pie}>
          <Text style={styles.pie__version}>SAMM v1 - Adulto Mayor</Text>
        </View>
      </View>

      <ConfirmationModal
        esVisible={modalVisible}
        textoPregunta="¿Seguro que deseas cerrar la sesión?"
        textoCancelar="Cancelar"
        textoConfirmar="Cerrar sesión"
        alCancelar={() => setModalVisible(false)}
        alConfirmar={() => void manejarCerrarSesion()}
      />
    </ScrollView>
  );
};