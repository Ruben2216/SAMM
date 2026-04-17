import React, { useRef, useState, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './MiPerfil.styles';
import { Familiar, PerfilFamiliarState } from './type';
import { theme } from '../../../../theme';
import { useAuthStore } from '../../../auth/authStore';
import httpClient from '../../../../services/httpService';
import { ConfirmationModal } from '../../../../components/ui/confirmation-modal';
import { obtenerParentescoDelAdultoParaFamiliar } from '../../../../utils/parentescoFormatter';

interface VinculacionInfo {
  Id_Vinculacion: number;
  Id_Familiar: number;
  Id_Adulto_Mayor: number;
  Nombre_Familiar: string | null;
  Nombre_Adulto_Mayor: string | null;
  url_Avatar_Familiar?: string | null;
  url_Avatar_Adulto_Mayor?: string | null;
  Nombre_Circulo: string | null;
  Rol_Adulto_Mayor: string | null;
  Rol_Familiar?: string | null;
}

type TipoSelectorSupervision = 'frecuencia' | 'tiempo';

type OpcionSupervision = {
  valor: string;
  numero: string;
  unidad: 'minutos' | 'hora';
  etiqueta: string;
};

const opcionesSupervision: OpcionSupervision[] = [
  { valor: '15 minutos', numero: '15', unidad: 'minutos', etiqueta: '15 minutos' },
  { valor: '30 minutos', numero: '30', unidad: 'minutos', etiqueta: '30 minutos' },
  { valor: '45 minutos', numero: '45', unidad: 'minutos', etiqueta: '45 minutos' },
  { valor: '1 hora', numero: '1', unidad: 'hora', etiqueta: '1 hora' },
];

const anchoMenuSupervision = 130;
const altoItemMenuSupervision = 44;
const altoMenuSupervision = opcionesSupervision.length * altoItemMenuSupervision;
const margenPantalla = 8;
const ajusteMenuSupervisionX = 0;
const ajusteMenuSupervisionY = 0;

export const MiPerfilFamiliar: React.FC = () => {
  const navigation = useNavigation<any>();
  const usuarioAutenticado = useAuthStore(estado => estado.usuario);
  const actualizarAvatar = useAuthStore(estado => estado.actualizarAvatar);
  const eliminarAvatar = useAuthStore(estado => estado.eliminarAvatar);
  const cerrarSesion = useAuthStore(estado => estado.cerrarSesion);

  const referenciaSelectorFrecuencia = useRef<React.ElementRef<typeof View>>(null);
  const referenciaSelectorTiempo = useRef<React.ElementRef<typeof View>>(null);

  const [anclaFrecuencia, setAnclaFrecuencia] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [anclaTiempo, setAnclaTiempo] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [selectorAbierto, setSelectorAbierto] = useState<TipoSelectorSupervision | null>(
    null,
  );

  const [modalCerrarSesionVisible, setModalCerrarSesionVisible] = useState(false);
  const [vinculaciones, setVinculaciones] = useState<VinculacionInfo[]>([]);

  const ultimaCargaMsRef = useRef<number>(0);
  const TIEMPO_CACHE_MS = 20000;

  const [state, setState] = useState<PerfilFamiliarState>({
    nombre: '',
    correo: '',
    rol: 'Familiar',
    familiares: [],
    notificaciones: {
      tomaCorrecta: true,
      olvidoCritico: true,
      salidaZona: true,
      bateriaBaja: true,
    },
    supervision: {
      frecuenciaRastreo: '15 minutos',
      tiempoMaxSinReporte: '1 hora',
    },
    biometriaActiva: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (!usuarioAutenticado?.Id_Usuario) {
        return;
      }

      const ahora = Date.now();
      if (vinculaciones.length > 0 && ahora - ultimaCargaMsRef.current < TIEMPO_CACHE_MS) {
        return;
      }
      ultimaCargaMsRef.current = ahora;

      const abortController = new AbortController();

      const cargarVinculaciones = async () => {
        try {
          const res = await httpClient.get('/vinculacion/mis-vinculaciones', {
            signal: abortController.signal,
          });
          const vincs: VinculacionInfo[] = res.data;
          setVinculaciones(vincs);

          // Build familiares list from real data
          const miembros: Familiar[] = [];
          // Add myself (the familiar)
          miembros.push({
            id: String(usuarioAutenticado?.Id_Usuario || '0'),
            nombre: usuarioAutenticado?.Nombre || 'Yo',
            rol: 'Familiar',
            urlAvatar: usuarioAutenticado?.url_Avatar ?? null,
            esPrincipal: true,
          });
          // Add linked seniors
          for (const v of vincs) {
            miembros.push({
              id: String(v.Id_Adulto_Mayor),
              nombre: v.Nombre_Adulto_Mayor || 'Adulto Mayor',
              rol:
                v.Rol_Familiar ||
                obtenerParentescoDelAdultoParaFamiliar(v.Rol_Adulto_Mayor) ||
                'Adulto Mayor',
              urlAvatar: v.url_Avatar_Adulto_Mayor ?? null,
            });
          }
          setState(prev => ({ ...prev, familiares: miembros }));
        } catch (err) {
          console.log('[PerfilFamiliar] No se pudieron cargar vinculaciones:', err);
        }
      };
      cargarVinculaciones();
      return () => {
        abortController.abort();
      };
    }, [usuarioAutenticado?.Id_Usuario, usuarioAutenticado?.Nombre, usuarioAutenticado?.url_Avatar, vinculaciones.length])
  );

  const toggleNotificacion = (key: keyof typeof state.notificaciones) => {
    setState(prev => ({
      ...prev,
      notificaciones: {
        ...prev.notificaciones,
        [key]: !prev.notificaciones[key],
      },
    }));
  };

  const obtenerInicialesFamiliar = (nombreCompleto: string) => {
    const partes = nombreCompleto.trim().split(/\s+/);
    const primera = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : '';
    return `${primera}${ultima}`.toUpperCase();
  };

  const obtenerInicialesPerfil = (nombreCompleto: string) => {
    const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) return '';
    if (partes.length === 1) return (partes[0]?.[0] ?? '').toUpperCase();
    if (partes.length === 2) {
      return `${partes[0]?.[0] ?? ''}${partes[1]?.[0] ?? ''}`.toUpperCase();
    }

    return `${partes[0]?.[0] ?? ''}${partes[2]?.[0] ?? ''}`.toUpperCase();
  };

  const manejarGuardar = () => {
    console.log('[PerfilFamiliar] Guardar cambios');
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
    const tieneAvatar = Boolean(usuarioAutenticado?.url_Avatar);

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

  const manejarCambiarContrasena = () => {
    console.log('[PerfilFamiliar] Cambiar contraseña');
  };

  const manejarCerrarSesion = () => {
    setModalCerrarSesionVisible(true);
  };

  const manejarCancelarCerrarSesion = () => {
    setModalCerrarSesionVisible(false);
  };

  const manejarConfirmarCerrarSesion = async () => {
    try {
      await cerrarSesion();
      setModalCerrarSesionVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Initial' }],
      });
    } catch (error: any) {
      console.error('[PerfilFamiliar] Error cerrando sesión:', error?.message ?? error);
      Alert.alert('No se pudo cerrar sesión', 'Intenta de nuevo.');
    }
  };

  const manejarAyudaSoporte = () => {
    console.log('[PerfilFamiliar] Ayuda y soporte');
  };

  const obtenerOpcionSupervision = (valor: string) =>
    opcionesSupervision.find(opcion => opcion.valor === valor) ?? opcionesSupervision[0];

  const opcionFrecuencia = obtenerOpcionSupervision(state.supervision.frecuenciaRastreo);
  const opcionTiempoMaximo = obtenerOpcionSupervision(state.supervision.tiempoMaxSinReporte);

  const unidadFrecuenciaFormateada =
    opcionFrecuencia.unidad === 'minutos' ? 'min' : 'Hora';
  const unidadTiempoMaximoFormateada =
    opcionTiempoMaximo.unidad === 'minutos' ? 'min' : 'Hora';

  const obtenerAnclaMenu = (ancla: { x: number; y: number; width: number; height: number }) => {
    const { width: anchoVentana, height: altoVentana } = Dimensions.get('window');
    const xDeseada = ancla.x + ancla.width - anchoMenuSupervision;
    const xMaxima = Math.max(margenPantalla, anchoVentana - anchoMenuSupervision - margenPantalla);
    const xBase = Math.max(margenPantalla, Math.min(xDeseada, xMaxima));

    const yAbajo = ancla.y + ancla.height;
    const hayEspacioAbajo = altoVentana - yAbajo >= altoMenuSupervision + margenPantalla;
    const yBase = hayEspacioAbajo
      ? yAbajo
      : Math.max(margenPantalla, ancla.y - altoMenuSupervision);

    const x = Math.max(margenPantalla, Math.min(xBase + ajusteMenuSupervisionX, xMaxima));

    const yMaxima = Math.max(margenPantalla, altoVentana - altoMenuSupervision - margenPantalla);
    const y = Math.max(margenPantalla, Math.min(yBase + ajusteMenuSupervisionY, yMaxima));

    return { x, y };
  };

  const manejarAlternarSelector = (tipo: TipoSelectorSupervision) => {
    if (selectorAbierto === tipo) {
      setSelectorAbierto(null);
      return;
    }

    const referencia =
      tipo === 'frecuencia' ? referenciaSelectorFrecuencia : referenciaSelectorTiempo;

    referencia.current?.measureInWindow((x, y, width, height) => {
      if (tipo === 'frecuencia') {
        setAnclaFrecuencia({ x, y, width, height });
      } else {
        setAnclaTiempo({ x, y, width, height });
      }

      setSelectorAbierto(tipo);
    });
  };

  const manejarSeleccionSupervision = (tipo: TipoSelectorSupervision, valor: string) => {
    setState(previo => ({
      ...previo,
      supervision: {
        ...previo.supervision,
        ...(tipo === 'frecuencia'
          ? { frecuenciaRastreo: valor }
          : { tiempoMaxSinReporte: valor }),
      },
    }));

    setSelectorAbierto(null);
  };

  const opcionesNotificaciones: Array<{
    clave: keyof PerfilFamiliarState['notificaciones'];
    titulo: string;
    descripcion: string;
  }> = [
    {
      clave: 'tomaCorrecta',
      titulo: 'Toma Correcta',
      descripcion: 'Notificar cuando se tome el medicamento.',
    },
    {
      clave: 'olvidoCritico',
      titulo: 'Olvido Crítico',
      descripcion: 'Alerta fuerte si pasan 30 min sin toma.',
    },
    {
      clave: 'salidaZona',
      titulo: 'Salida Zona Segura',
      descripcion: 'Avisar si sale del perímetro de casa.',
    },
    {
      clave: 'bateriaBaja',
      titulo: 'Batería Baja del Paciente',
      descripcion: 'Avisar si baja del 15%.',
    },
  ];

  const pistaSwitch = { false: theme.colors.disabled, true: theme.colors.primary };
  const colorThumbSwitch = theme.colors.surface;

  const nombrePerfil = (usuarioAutenticado?.Nombre ?? state.nombre).trim();
  const correoPerfil = (usuarioAutenticado?.Correo ?? state.correo).trim();
  const uriAvatar = usuarioAutenticado?.url_Avatar
    ? construirUriAvatar(usuarioAutenticado.url_Avatar)
    : '';
  const tieneAvatar = Boolean(uriAvatar);

  return (
    <ScrollView
      style={styles.perfil}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.encabezado} accessibilityRole="header">
        <Text style={styles.encabezado__titulo}>Mi Perfil</Text>
        <TouchableOpacity
          onPress={manejarGuardar}
          accessibilityLabel="Guardar cambios del perfil"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Text style={styles.encabezado__accion}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contenido}>
        <View style={styles.tarjetaPerfil} accessibilityLabel="Información del perfil">
          <View style={styles.tarjetaPerfil__contenedorAvatar}>
            <View
              style={styles.tarjetaPerfil__avatar}
              accessibilityLabel={`Avatar de ${nombrePerfil}`}
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
                <Text style={styles.tarjetaPerfil__textoAvatar}>
                  {obtenerInicialesPerfil(nombrePerfil)}
                </Text>
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

          <Text style={styles.tarjetaPerfil__nombre}>{nombrePerfil}</Text>
          <Text style={styles.tarjetaPerfil__correo}>{correoPerfil}</Text>

          <View style={styles.tarjetaPerfil__badge}>
            <Text style={styles.tarjetaPerfil__badgeTexto}>
              {state.rol.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.tituloSeccion}>
          {vinculaciones.length > 0 && vinculaciones[0].Nombre_Circulo
            ? vinculaciones[0].Nombre_Circulo.toUpperCase()
            : 'MI CÍRCULO'}
        </Text>
        <View style={styles.tarjetaSeccion} accessibilityLabel="Miembros de la familia">
          {state.familiares.map((familiar, indice) => {
            const esPrincipal = Boolean(familiar.esPrincipal);
            const textoAvatar = esPrincipal ? 'YO' : obtenerInicialesFamiliar(familiar.nombre);
            const estiloAvatar = esPrincipal
              ? styles.filaFamilia__avatarYo
              : styles.filaFamilia__avatar;
            const estiloTextoAvatar = esPrincipal
              ? styles.filaFamilia__textoAvatarYo
              : styles.filaFamilia__textoAvatar;

            const uriAvatarMiembro = familiar.urlAvatar
              ? construirUriAvatar(familiar.urlAvatar)
              : '';
            const tieneAvatarMiembro = Boolean(uriAvatarMiembro);

            return (
              <View
                key={familiar.id}
                style={[
                  styles.filaFamilia,
                  indice < state.familiares.length - 1 && styles.fila__separador,
                ]}
              >
                <View style={styles.filaFamilia__izquierda}>
                  <View
                    style={estiloAvatar}
                    accessibilityRole="image"
                    accessibilityLabel={`Avatar de ${familiar.nombre}`}
                  >
                    {tieneAvatarMiembro ? (
                      <Image
                        source={{ uri: uriAvatarMiembro }}
                        style={styles.filaFamilia__imagenAvatar}
                        accessibilityIgnoresInvertColors
                      />
                    ) : (
                      <Text style={estiloTextoAvatar}>{textoAvatar}</Text>
                    )}
                  </View>

                  <View style={styles.filaFamilia__texto}>
                    <Text style={styles.filaFamilia__nombre}>{familiar.nombre}</Text>
                    <Text style={styles.filaFamilia__rol}>{familiar.rol}</Text>
                  </View>
                </View>

                {esPrincipal ? (
                  <View style={styles.filaFamilia__badgePrincipal}>
                    <Text style={styles.filaFamilia__badgePrincipalTexto}>Principal</Text>
                  </View>
                ) : (
                  <View style={styles.filaFamilia__badgeColaborador}>
                    <Text style={styles.filaFamilia__badgeColaboradorTexto}>Colaborador</Text>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            onPress={() => navigation.navigate('CodigoVinculacion' as never)}
            style={styles.filaAccion}
            accessibilityLabel="Agregar un familiar"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.filaAccion__texto}>+ Agregar Familiar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.tituloSeccion}>ALERTAS Y NOTIFICACIONES</Text>
        <View style={styles.tarjetaSeccion} accessibilityLabel="Alertas y notificaciones">
          {opcionesNotificaciones.map((opcion, indice) => (
            <View
              key={opcion.clave}
              style={[
                styles.filaNotificacion,
                indice < opcionesNotificaciones.length - 1 && styles.fila__separador,
              ]}
            >
              <View style={styles.filaNotificacion__texto}>
                <Text style={styles.filaNotificacion__titulo}>{opcion.titulo}</Text>
                <Text style={styles.filaNotificacion__descripcion}>{opcion.descripcion}</Text>
              </View>

              <Switch
                value={state.notificaciones[opcion.clave]}
                onValueChange={() => toggleNotificacion(opcion.clave)}
                trackColor={pistaSwitch}
                thumbColor={colorThumbSwitch}
                accessibilityLabel={`Activar notificación de ${opcion.titulo}`}
              />
            </View>
          ))}
        </View>

        <Text style={styles.tituloSeccion}>NIVEL DE SUPERVISIÓN</Text>
        <View style={styles.tarjetaSeccion} accessibilityLabel="Nivel de supervisión">
          <View style={[styles.filaSupervision, styles.fila__separador]}>
            <View style={styles.filaSupervision__texto}>
              <Text style={styles.filaSupervision__titulo}>Frecuencia de rastreo</Text>
              <Text style={styles.filaSupervision__descripcion}>
                Actualización del GPS en segundo plano.
              </Text>
            </View>

            <View ref={referenciaSelectorFrecuencia} collapsable={false}>
              <TouchableOpacity
                style={styles.filaSupervision__selector}
                onPress={() => manejarAlternarSelector('frecuencia')}
                accessibilityRole="button"
                accessibilityLabel={`Cambiar frecuencia de rastreo. Seleccionado: ${state.supervision.frecuenciaRastreo}`}
                activeOpacity={0.7}
              >
                <Text style={styles.filaSupervision__selectorTexto}>
                  {`Cada ${opcionFrecuencia.numero}`}
                </Text>
                <Text style={styles.filaSupervision__selectorTexto}>
                  {unidadFrecuenciaFormateada}
                </Text>
                <Icon
                  name="chevron-down"
                  size={18}
                  color={theme.colors.text}
                  accessibilityElementsHidden
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filaSupervision}>
            <View style={styles.filaSupervision__texto}>
              <Text style={styles.filaSupervision__titulo}>Tiempo máx. sin reporte</Text>
              <Text style={styles.filaSupervision__descripcion}>
                Generar alerta si el dispositivo no responde.
              </Text>
            </View>

            <View ref={referenciaSelectorTiempo} collapsable={false}>
              <TouchableOpacity
                style={styles.filaSupervision__selector}
                onPress={() => manejarAlternarSelector('tiempo')}
                accessibilityRole="button"
                accessibilityLabel={`Cambiar tiempo máximo sin reporte. Seleccionado: ${state.supervision.tiempoMaxSinReporte}`}
                activeOpacity={0.7}
              >
                <Text style={styles.filaSupervision__selectorTexto}>
                  {`Cada ${opcionTiempoMaximo.numero}`}
                </Text>
                <Text style={styles.filaSupervision__selectorTexto}>
                  {unidadTiempoMaximoFormateada}
                </Text>
                <Icon
                  name="chevron-down"
                  size={18}
                  color={theme.colors.text}
                  accessibilityElementsHidden
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Menu
          visible={selectorAbierto === 'frecuencia' && Boolean(anclaFrecuencia)}
          onDismiss={() => setSelectorAbierto(null)}
          style={styles.menuSupervision}
          contentStyle={styles.menuSupervision__contenido}
          anchor={anclaFrecuencia ? obtenerAnclaMenu(anclaFrecuencia) : { x: 0, y: 0 }}
        >
          {opcionesSupervision.map((opcion, indice) => (
            <Menu.Item
              key={opcion.valor}
              title={opcion.etiqueta}
              onPress={() => manejarSeleccionSupervision('frecuencia', opcion.valor)}
              accessibilityLabel={`Seleccionar ${opcion.etiqueta}`}
              titleStyle={styles.menuSupervision__itemTexto}
              style={[
                styles.menuSupervision__item,
                indice < opcionesSupervision.length - 1 && styles.menuSupervision__itemSeparador,
              ]}
            />
          ))}
        </Menu>

        <Menu
          visible={selectorAbierto === 'tiempo' && Boolean(anclaTiempo)}
          onDismiss={() => setSelectorAbierto(null)}
          style={styles.menuSupervision}
          contentStyle={styles.menuSupervision__contenido}
          anchor={anclaTiempo ? obtenerAnclaMenu(anclaTiempo) : { x: 0, y: 0 }}
        >
          {opcionesSupervision.map((opcion, indice) => (
            <Menu.Item
              key={opcion.valor}
              title={opcion.etiqueta}
              onPress={() => manejarSeleccionSupervision('tiempo', opcion.valor)}
              accessibilityLabel={`Seleccionar ${opcion.etiqueta}`}
              titleStyle={styles.menuSupervision__itemTexto}
              style={[
                styles.menuSupervision__item,
                indice < opcionesSupervision.length - 1 && styles.menuSupervision__itemSeparador,
              ]}
            />
          ))}
        </Menu>

        <Text style={styles.tituloSeccion}>SEGURIDAD</Text>
        <View style={styles.tarjetaSeccion} accessibilityLabel="Seguridad">
          <View style={[styles.filaSeguridad, styles.fila__separador]}>
            <Text style={styles.filaSeguridad__titulo}>Activar Biometría (FaceID)</Text>
            <Switch
              value={state.biometriaActiva}
              onValueChange={() =>
                setState(prev => ({
                  ...prev,
                  biometriaActiva: !prev.biometriaActiva,
                }))
              }
              trackColor={pistaSwitch}
              thumbColor={colorThumbSwitch}
              accessibilityLabel="Activar Biometría FaceID"
            />
          </View>

          <TouchableOpacity
            onPress={manejarCambiarContrasena}
            style={[styles.filaBoton, styles.fila__separador]}
            accessibilityLabel="Cambiar contraseña"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.filaBoton__texto}>Cambiar Contraseña</Text>
            <Icon
              name="chevron-right"
              size={18}
              color={theme.colors.textSecondary}
              accessibilityElementsHidden
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={manejarCerrarSesion}
            style={styles.filaBoton}
            accessibilityLabel="Cerrar sesión"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.filaBoton__texto}>Cerrar Sesión</Text>
            <Icon
              name="logout"
              size={18}
              color={theme.colors.error}
              accessibilityElementsHidden
            />
          </TouchableOpacity>
        </View>

        <View style={styles.pie}>
          <Text style={styles.pie__version}>SAMM v1</Text>
          <TouchableOpacity
            onPress={manejarAyudaSoporte}
            accessibilityLabel="Ir a Ayuda y Soporte"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.pie__enlace}>Ayuda y Soporte</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmationModal
        esVisible={modalCerrarSesionVisible}
        textoPregunta="¿Seguro que deseas cerrar la sesión?"
        textoCancelar="Cancelar"
        textoConfirmar="Cerrar sesión"
        alCancelar={manejarCancelarCerrarSesion}
        alConfirmar={() => void manejarConfirmarCerrarSesion()}
        accessibilityLabel="Confirmación para cerrar sesión"
      />
    </ScrollView>
  );
};

export const Perfil = MiPerfilFamiliar;