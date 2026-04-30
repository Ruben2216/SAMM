//frontend/src/features/senior/screens/Perfil/index.tsx
import React, { useState, useCallback, useRef } from 'react';
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
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { styles } from './styles';
import { theme } from '../../../../theme';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';
import { ConfirmationModal } from '../../../../components/ui/confirmation-modal';
import { SuccessModal } from '../../../../components/ui/success-modal';
import * as ImagePicker from 'expo-image-picker';
import {
  registrarParaNotificaciones,
} from '../../../../services/notificationService';

import { manejarToggleRastreo, obtenerEstadoRastreo } from '../../../../services/locationService';

interface PerfilSaludData {
  Tipo_Sangre: string;
  Alergias: string;
  Peso: string;
  Edad: string;
  Condicion_Medica: string;
}

export const Perfil = () => {
  const navigation = useNavigation<any>();
  const usuario = useAuthStore((s) => s.usuario);
  const actualizarAvatar = useAuthStore((s) => s.actualizarAvatar);
  const eliminarAvatar = useAuthStore((s) => s.eliminarAvatar);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  const apiMedicamentos = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

  const [vinculacion, setVinculacion] = useState<any>(null);
  const [perfil, setPerfil] = useState<PerfilSaludData>({
    Tipo_Sangre: '',
    Alergias: '',
    Peso: '',
    Edad: '',
    Condicion_Medica: '',
  });
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalExitoVisible, setModalExitoVisible] = useState(false);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const [cargandoNotif, setCargandoNotif] = useState(false);
  const [menuSangreVisible, setMenuSangreVisible] = useState(false);
  {/*constante de ubicacion */}
  const [rastreoActivo, setRastreoActivo]       = useState(false);
  const [cargandoRastreo, setCargandoRastreo]   = useState(false);

  const ultimaCargaMsRef = useRef<number>(0);
  const TIEMPO_CACHE_MS = 20000;
  const yaCargoUnaVezRef = useRef(false);

  const cargarDatos = useCallback(async () => {
    const esPrimerCarga = !yaCargoUnaVezRef.current;

    try {
      if (esPrimerCarga) {
        setCargando(true);
      }
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
          });
        }
      } catch (err) {
        console.log('Sin perfil de salud aún');
      }

      try {
        const resUser = await httpClient.get('/users/me');
        setTelefonoContacto(resUser.data?.Telefono || '');
      } catch (err) {
        console.log('No se pudo cargar el teléfono de contacto');
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
      if (esPrimerCarga) {
        setCargando(false);
      }
      yaCargoUnaVezRef.current = true;
    }
  }, [apiMedicamentos, usuario?.Id_Usuario]);

  useFocusEffect(
    useCallback(() => {
      const ahora = Date.now();
      if (ahora - ultimaCargaMsRef.current < TIEMPO_CACHE_MS) {
        return;
      }
      ultimaCargaMsRef.current = ahora;
      cargarDatos();
    }, [cargarDatos])
  );

  // Sincroniza el Switch con el permiso real del SO al entrar y al volver de Ajustes.
  useFocusEffect(
    useCallback(() => {
      Notifications.getPermissionsAsync().then(({ status }) => {
        setNotificacionesActivas(status === 'granted');
      });
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      obtenerEstadoRastreo().then((activo) => {
        setRastreoActivo(activo);
      });
    }, [])
  );

  const manejarToggleNotificaciones = async (valor: boolean) => {
    setCargandoNotif(true);
    try {
      if (valor) {
        const token = await registrarParaNotificaciones(usuario?.Id_Usuario);
        setNotificacionesActivas(Boolean(token));
        if (!token) {
          Alert.alert(
            'Permiso denegado',
            'Ve a Ajustes del sistema > SAMM > Notificaciones para activarlas.',
            [
              { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() },
              { text: 'Cancelar', style: 'cancel' },
            ],
          );
        }
      } else {
        Alert.alert(
          'Desactivar notificaciones',
          'Para desactivarlas, ve a Ajustes del sistema > SAMM > Notificaciones.',
          [
            { text: 'Ir a Ajustes', onPress: () => Linking.openSettings() },
            { text: 'Cancelar', style: 'cancel' },
          ],
        );
      }
    } finally {
      setCargandoNotif(false);
    }
  };

  const manejarToggleRastreoLocal = async (valor: boolean) => {
    setCargandoRastreo(true);
    try {
      const resultado = await manejarToggleRastreo(valor, usuario?.Id_Usuario);
      setRastreoActivo(resultado);
    } finally {
      setCargandoRastreo(false);
    }
  };

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
        }),
      });

      try {
        await httpClient.put('/users/me/telefono', {
          telefono: telefonoContacto.trim() || null,
        });
      } catch (err) {
        console.log('No se pudo guardar el teléfono:', err);
      }

      if (res.ok) {
        setEditando(false);
        setModalExitoVisible(true);
      } else {
        Alert.alert('Error', 'No se pudo guardar el perfil.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const construirUriAvatar = (urlAvatar: string) => {
    const baseUrl = (httpClient.defaults.baseURL ?? '').replace(/\/$/, '');
    const ruta = urlAvatar.trim();

    if (!ruta) return '';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    if (!baseUrl) return ruta;

    return `${baseUrl}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  };

  const seleccionarImagenDeGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para elegir una foto.');
      return null;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.55,
      base64: true,
    });

    if (resultado.canceled) return null;
    const activo = resultado.assets?.[0];
    if (!activo?.base64) {
      Alert.alert('Error', 'No se pudo obtener la imagen seleccionada.');
      return null;
    }

    return {
      base64: activo.base64,
      mimeType: activo.mimeType ?? 'image/jpeg',
    };
  };

  const manejarEditarAvatar = async () => {
    const tieneAvatar = Boolean(usuario?.url_Avatar);

    const subirNuevaFoto = async () => {
      const seleccionado = await seleccionarImagenDeGaleria();
      if (!seleccionado) return;

      const resultado = await actualizarAvatar(seleccionado.base64, seleccionado.mimeType);
      if (!resultado.exito) {
        Alert.alert('No se pudo actualizar', resultado.mensaje ?? 'Intenta de nuevo.');
      }
    };

    const eliminarFoto = async () => {
      const resultado = await eliminarAvatar();
      if (!resultado.exito) {
        Alert.alert('No se pudo eliminar', resultado.mensaje ?? 'Intenta de nuevo.');
      }
    };

    if (!tieneAvatar) {
      await subirNuevaFoto();
      return;
    }

    Alert.alert('Foto de perfil', '¿Qué deseas hacer?', [
      { text: 'Cambiar foto', onPress: () => void subirNuevaFoto() },
      { text: 'Eliminar foto', style: 'destructive', onPress: () => void eliminarFoto() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
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

  const obtenerInicialesNombre = (nombreCompleto: string) => {
    const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
    const primera = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : '';
    return `${primera}${ultima}`.toUpperCase();
  };

  const nombreUsuario = usuario?.Nombre || 'Usuario';
  const iniciales = nombreUsuario.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2);
  const uriAvatar = usuario?.url_Avatar ? construirUriAvatar(usuario.url_Avatar) : '';
  const tieneAvatar = Boolean(uriAvatar);

  const uriAvatarCuidador = vinculacion?.url_Avatar_Familiar
    ? construirUriAvatar(vinculacion.url_Avatar_Familiar)
    : '';
  const tieneAvatarCuidador = Boolean(uriAvatarCuidador);

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
          <View style={styles.tarjetaPerfil__contenedorAvatar}>
            <View
              style={styles.tarjetaPerfil__avatar}
              accessibilityLabel={`Avatar de ${nombreUsuario}`}
              accessibilityRole="image"
            >
              {tieneAvatar && (
                <Image
                  source={{ uri: uriAvatar }}
                  style={styles.tarjetaPerfil__imagenAvatar}
                  accessibilityIgnoresInvertColors
                />
              )}
              <View style={styles.tarjetaPerfil__bordeAvatar} />
              {!tieneAvatar && (
                <Text style={styles.tarjetaPerfil__textoAvatar}>{iniciales}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={manejarEditarAvatar}
              style={styles.tarjetaPerfil__botonEditar}
              accessibilityLabel="Editar foto de perfil"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Icon name="pencil-box-outline" size={22} color={theme.colors.text} />
            </TouchableOpacity>
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
              <View
                style={styles.filaFamilia__avatarYo}
                accessibilityRole="image"
                accessibilityLabel={`Avatar de ${nombreUsuario}`}
              >
                {tieneAvatar ? (
                  <Image
                    source={{ uri: uriAvatar }}
                    style={styles.filaFamilia__imagenAvatar}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <Text style={styles.filaFamilia__textoAvatarYo}>YO</Text>
                )}
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
                <View
                  style={styles.filaFamilia__avatar}
                  accessibilityRole="image"
                  accessibilityLabel={`Avatar de ${vinculacion.Nombre_Familiar ?? 'Familiar'}`}
                >
                  {tieneAvatarCuidador ? (
                    <Image
                      source={{ uri: uriAvatarCuidador }}
                      style={styles.filaFamilia__imagenAvatar}
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <Text style={styles.filaFamilia__textoAvatar}>
                      {obtenerInicialesNombre(vinculacion.Nombre_Familiar ?? '')}
                    </Text>
                  )}
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

        {/* --- INFORMACIÓN DE CONTACTO --- */}
        <Text style={styles.tituloSeccion}>INFORMACIÓN DE CONTACTO</Text>
        <View style={styles.tarjetaSeccion}>
          {editando ? (
            <View style={{ padding: 16 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.inputStyle}
                  value={telefonoContacto}
                  onChangeText={setTelefonoContacto}
                  keyboardType="phone-pad"
                  placeholder="Ej. 5512345678"
                />
              </View>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                Tu familiar podrá llamarte a este número desde la app.
              </Text>
            </View>
          ) : (
            <View style={styles.filaSupervision}>
              <View style={styles.filaSupervision__texto}>
                <Text style={styles.filaSupervision__titulo}>Teléfono</Text>
                <Text style={styles.filaSupervision__descripcion}>
                  {telefonoContacto || 'No registrado'}
                </Text>
              </View>
              <Icon name="phone-outline" size={24} color={theme.colors.primary} />
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
                <Menu
                  visible={menuSangreVisible}
                  onDismiss={() => setMenuSangreVisible(false)}
                  anchorPosition="bottom"
                  contentStyle={{ backgroundColor: theme.colors.surface, borderRadius: 12, marginTop: 4 }}
                  anchor={
                    <TouchableOpacity
                      style={[styles.inputStyle, { justifyContent: 'center', height: 48 }]}
                      onPress={() => setMenuSangreVisible(true)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: perfil.Tipo_Sangre ? theme.colors.text : '#94A3B8', fontWeight: '600' }}>
                          {perfil.Tipo_Sangre || 'Selecciona una opción'}
                        </Text>
                        <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  }
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'].map((tipo) => (
                    <Menu.Item
                      key={tipo}
                      onPress={() => {
                        setPerfil(p => ({ ...p, Tipo_Sangre: tipo === 'Desconocido' ? '' : tipo }));
                        setMenuSangreVisible(false);
                      }}
                      title={tipo}
                      titleStyle={{ color: theme.colors.text, fontWeight: '500' }}
                    />
                  ))}
                </Menu>
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

        {/* --- NOTIFICACIONES --- */}
        <Text style={styles.tituloSeccion}>NOTIFICACIONES</Text>
        <View style={styles.tarjetaSeccion}>
          <View style={[styles.filaSupervision, { paddingVertical: 14 }]}>
            <View style={styles.filaSupervision__texto}>
              <Text style={styles.filaSupervision__titulo}>Recordatorios de medicamentos</Text>
              <Text style={styles.filaSupervision__descripcion}>
                {notificacionesActivas
                  ? 'Recibirás alarmas a la hora de cada medicamento.'
                  : 'Activa para recibir alarmas en tu dispositivo.'}
              </Text>
            </View>
            {cargandoNotif ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Switch
                value={notificacionesActivas}
                onValueChange={manejarToggleNotificaciones}
                trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
                thumbColor={theme.colors.surface}
              />
            )}
          </View>
        </View>



        {/* --- Activacion de ubicacion --- */}
        <Text style={styles.tituloSeccion}>UBICACIÓN</Text>
        <View style={styles.tarjetaSeccion}>
          <View style={[styles.filaSupervision, { paddingVertical: 14 }]}>
            <View style={styles.filaSwitch__izquierda}>
              <Icon name="map-marker-radius-outline" size={22} color={theme.colors.primary} />
              <View style={styles.filaSwitch__texto}>
                <Text style={styles.filaSupervision__titulo}>Activar mi rastreo</Text>
                <Text style={styles.filaSupervision__descripcion}>
                  Tu familiar podrá ver tu ubicación en su mapa
                </Text>
              </View>
            </View>

            {cargandoRastreo ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Switch
                value={rastreoActivo}
                onValueChange={manejarToggleRastreoLocal}
                trackColor={{
                  false: theme.colors.border,
                  true:  theme.colors.primary,
                }}
                thumbColor={rastreoActivo ? '#FFFFFF' : '#F4F3F4'}
              />
            )}
          </View>

          {rastreoActivo && (
            <View style={styles.filaSupervision}>
              <Icon name="check-circle-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.filaSwitch__infoActivoTexto}>
                Tu ubicación se actualiza automáticamente en segundo plano
              </Text>
            </View>
          )}
        </View>



        {/* --- SEGURIDAD --- */}
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

      <SuccessModal
        esVisible={modalExitoVisible}
        mensaje="Tu perfil de salud se actualizó correctamente."
        alTerminar={() => setModalExitoVisible(false)}
      />
    </ScrollView>
  );
};