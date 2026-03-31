import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { styles } from "./styles";
import {
  IconoAgregar,
  IconoEditar,
  IconoCalendario,
  IconoInfoMedica,
  IconoTelefono,
  IconoBateria,
} from "../../../../assets/iconos/iconos-familiares";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PerfilCuidado {
  id: string;
  nombre: string;
  edad: string;
  condicion: string;
  iniciales: string;
  tipoSangre: string;
  peso: string;
  alergias: string;
  bateria: number;
  ultimaConexion: string;
  telefono: string;
  esNuevo: boolean;
}

const generarIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(" ");
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.length >= 2 ? nombre.substring(0, 2).toUpperCase() : "NP";
};

const realizarLlamada = (telefono: string) => {
  const url = `tel:${telefono.replace(/\s/g, "")}`;
  Linking.canOpenURL(url)
    .then((ok) => {
      if (ok) Linking.openURL(url);
      else Alert.alert("Error", "No se puede llamar desde este dispositivo");
    })
    .catch(() => Alert.alert("Error", "Error al intentar llamar"));
};

const COLORES = ["#6366F1", "#F59E0B", "#EC4899", "#14B8A6", "#8B5CF6"];

const DATOS_INICIALES: PerfilCuidado[] = [
  {
    id: "1",
    nombre: "Papá (Roberto)",
    edad: "78",
    condicion: "Diabetes Tipo 2",
    iniciales: "RM",
    tipoSangre: "O+",
    peso: "76 kg",
    alergias: "Nueces",
    bateria: 85,
    ultimaConexion: "Hace 5 min",
    telefono: "+52 612 345 6789",
    esNuevo: false,
  },
];

// Campo de texto editable reutilizable
const CampoEditable = ({
  etiqueta,
  valor,
  onCambio,
  teclado = "default",
}: {
  etiqueta: string;
  valor: string;
  onCambio: (t: string) => void;
  teclado?: "default" | "phone-pad" | "numeric";
}) => (
  <View style={styles.campoEditable}>
    <Text style={styles.campoEditable__etiqueta}>{etiqueta}</Text>
    <TextInput
      style={[styles.campoEditable__input, styles.campoEditable__inputActivo]}
      value={valor}
      onChangeText={onCambio}
      keyboardType={teclado}
      accessible={true}
      accessibilityLabel={`Campo: ${etiqueta}`}
    />
  </View>
);

// Tarjeta expandible de perfil
const ItemPerfil = ({
  perfil,
  estaExpandido,
  estaEditando,
  onPresionar,
  onEditar,
  onGuardar,
  onCancelar,
}: {
  perfil: PerfilCuidado;
  estaExpandido: boolean;
  estaEditando: boolean;
  onPresionar: () => void;
  onEditar: () => void;
  onGuardar: (datos: Partial<PerfilCuidado>) => void;
  onCancelar: () => void;
}) => {
  const [datos, setDatos] = useState({
    nombre: perfil.nombre,
    edad: perfil.edad,
    condicion: perfil.condicion,
    tipoSangre: perfil.tipoSangre,
    peso: perfil.peso,
    alergias: perfil.alergias,
    telefono: perfil.telefono,
  });

  const actualizarCampo = (campo: string, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const manejarGuardar = () => {
    onGuardar({ ...datos, iniciales: generarIniciales(datos.nombre) });
  };

  // Sincronizar datos cuando cambia el perfil
  React.useEffect(() => {
    setDatos({
      nombre: perfil.nombre,
      edad: perfil.edad,
      condicion: perfil.condicion,
      tipoSangre: perfil.tipoSangre,
      peso: perfil.peso,
      alergias: perfil.alergias,
      telefono: perfil.telefono,
    });
  }, [perfil]);

  return (
    <View style={styles.tarjetaPerfil}>
      {/* Fila principal: Avatar + Info + Llamar */}
      <TouchableOpacity
        style={styles.tarjetaPerfil__encabezadoRow}
        onPress={onPresionar}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={`Perfil de ${perfil.nombre}`}
        accessibilityHint="Presiona para ver detalles"
      >
        <View style={styles.tarjetaPerfil__avatar}>
          <Text style={styles.tarjetaPerfil__avatarTexto}>
            {perfil.iniciales}
          </Text>
        </View>

        <View style={styles.tarjetaPerfil__info}>
          <Text style={styles.tarjetaPerfil__nombre}>{perfil.nombre}</Text>
          <Text style={styles.tarjetaPerfil__meta}>
            {perfil.edad ? `${perfil.edad} años` : "Sin datos"}
            {perfil.condicion ? ` • ${perfil.condicion}` : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonLlamar}
          onPress={() => realizarLlamada(perfil.telefono)}
          activeOpacity={0.75}
          accessible={true}
          accessibilityLabel={`Llamar a ${perfil.nombre}`}
          accessibilityRole="button"
        >
          <IconoTelefono />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Chevron indicador */}
      <View style={styles.indicadorExpandir}>
        <Icon
          name={estaExpandido ? "chevron-up" : "chevron-down"}
          size={20}
          color="#CBD5E1"
        />
      </View>

      {/* Contenido expandido */}
      {estaExpandido && (
        <View style={styles.seccionExpandida}>
          {!estaEditando ? (
            <>
              {/* Estadísticas de salud */}
              <View style={styles.estadisticasSalud}>
                <View style={styles.estadistica}>
                  <Text style={styles.estadistica__etiqueta}>SANGRE</Text>
                  <Text style={styles.estadistica__valor}>
                    {perfil.tipoSangre || "—"}
                  </Text>
                </View>
                <View style={styles.estadistica__divisor} />
                <View style={styles.estadistica}>
                  <Text style={styles.estadistica__etiqueta}>PESO</Text>
                  <Text style={styles.estadistica__valorBold}>
                    {perfil.peso || "—"}
                  </Text>
                </View>
                <View style={styles.estadistica__divisor} />
                <View style={styles.estadistica}>
                  <Text style={styles.estadistica__etiqueta}>ALERGIAS</Text>
                  <Text style={styles.estadistica__valorAlerta}>
                    {perfil.alergias || "Ninguna"}
                  </Text>
                </View>
              </View>

              {/* Estado de batería */}
              <View style={styles.estadoBateria}>
                <IconoBateria />
                <Text style={styles.estadoBateria__texto}>
                  Batería: {perfil.bateria}% • Última conexión:{" "}
                  {perfil.ultimaConexion}
                </Text>
              </View>

              {/* Botones de acción */}
              <View style={styles.botonesAccion}>
                <TouchableOpacity
                  style={styles.botonPrimario}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityLabel="Ver agenda"
                  accessibilityRole="button"
                >
                  <IconoCalendario />
                  <Text style={styles.botonPrimario__texto}>Ver Agenda</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonSecundario}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityLabel="Ver información médica"
                  accessibilityRole="button"
                >
                  <IconoInfoMedica />
                  <Text style={styles.botonSecundario__texto}>Info Médica</Text>
                </TouchableOpacity>
              </View>

              {/* Botón Editar */}
              <TouchableOpacity
                style={styles.botonEditar}
                onPress={onEditar}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="Editar perfil"
                accessibilityRole="button"
              >
                <IconoEditar tamaño={16} color="#64748B" />
                <Text style={styles.botonEditar__texto}>Editar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Formulario de edición */}
              <CampoEditable
                etiqueta="Nombre"
                valor={datos.nombre}
                onCambio={(v) => actualizarCampo("nombre", v)}
              />
              <CampoEditable
                etiqueta="Edad"
                valor={datos.edad}
                onCambio={(v) => actualizarCampo("edad", v)}
                teclado="numeric"
              />
              <CampoEditable
                etiqueta="Condición médica"
                valor={datos.condicion}
                onCambio={(v) => actualizarCampo("condicion", v)}
              />
              <CampoEditable
                etiqueta="Tipo de sangre"
                valor={datos.tipoSangre}
                onCambio={(v) => actualizarCampo("tipoSangre", v)}
              />
              <CampoEditable
                etiqueta="Peso"
                valor={datos.peso}
                onCambio={(v) => actualizarCampo("peso", v)}
              />
              <CampoEditable
                etiqueta="Alergias"
                valor={datos.alergias}
                onCambio={(v) => actualizarCampo("alergias", v)}
              />
              <CampoEditable
                etiqueta="Teléfono"
                valor={datos.telefono}
                onCambio={(v) => actualizarCampo("telefono", v)}
                teclado="phone-pad"
              />

              <View style={styles.botonesEdicion}>
                <TouchableOpacity
                  style={styles.botonCancelar}
                  onPress={onCancelar}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityLabel="Cancelar edición"
                  accessibilityRole="button"
                >
                  <Text style={styles.botonCancelar__texto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonGuardar}
                  onPress={manejarGuardar}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityLabel="Guardar cambios"
                  accessibilityRole="button"
                >
                  <Text style={styles.botonGuardar__texto}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

// Pantalla principal
export const Familia = () => {
  const [perfiles, setPerfiles] = useState<PerfilCuidado[]>(DATOS_INICIALES);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const toggleExpandir = useCallback(
    (id: string) => {
      if (editandoId) return;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandidoId((prev) => (prev === id ? null : id));
    },
    [editandoId],
  );

  const iniciarEdicion = useCallback((id: string) => {
    setEditandoId(id);
  }, []);

  const guardarEdicion = useCallback(
    (id: string, datos: Partial<PerfilCuidado>) => {
      setPerfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...datos, esNuevo: false } : p)),
      );
      setEditandoId(null);
    },
    [],
  );

  const cancelarEdicion = useCallback(
    (id: string) => {
      const perfil = perfiles.find((p) => p.id === id);
      if (perfil?.esNuevo) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPerfiles((prev) => prev.filter((p) => p.id !== id));
        setExpandidoId(null);
      }
      setEditandoId(null);
    },
    [perfiles],
  );

  const agregarPerfil = useCallback(() => {
    const nuevoId = String(Date.now());
    const nuevo: PerfilCuidado = {
      id: nuevoId,
      nombre: "",
      edad: "",
      condicion: "",
      iniciales: "NP",
      tipoSangre: "",
      peso: "",
      alergias: "",
      bateria: 0,
      ultimaConexion: "Sin conexión",
      telefono: "",
      esNuevo: true,
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPerfiles((prev) => [...prev, nuevo]);
    setExpandidoId(nuevoId);
    setEditandoId(nuevoId);
  }, []);

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.encabezado__titulo}>Mis Familiares</Text>
        <TouchableOpacity
          style={styles.encabezado__botonAgregar}
          onPress={agregarPerfil}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Agregar nuevo perfil"
          accessibilityRole="button"
        >
          <IconoAgregar />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.areaContenido}
      >
        <View style={styles.seccionGestionar}>
          <View style={styles.seccionEncabezadoRow}>
            <Text style={styles.seccionTitulo}>Gestionar Perfiles</Text>
            <Text style={styles.seccionConteo}>
              {perfiles.length} {perfiles.length === 1 ? "Persona" : "Personas"}
            </Text>
          </View>

          {perfiles.map((perfil) => (
            <ItemPerfil
              key={perfil.id}
              perfil={perfil}
              estaExpandido={expandidoId === perfil.id}
              estaEditando={editandoId === perfil.id}
              onPresionar={() => toggleExpandir(perfil.id)}
              onEditar={() => iniciarEdicion(perfil.id)}
              onGuardar={(datos) => guardarEdicion(perfil.id, datos)}
              onCancelar={() => cancelarEdicion(perfil.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
