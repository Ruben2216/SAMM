import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
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
import { useFocusEffect } from "@react-navigation/native";
import httpClient from "../../../../services/httpService";
import { obtenerParentescoDelAdultoParaFamiliar } from "../../../../utils/parentescoFormatter";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface VinculacionInfo {
  Id_Vinculacion: number;
  Id_Familiar: number;
  Id_Adulto_Mayor: number;
  Nombre_Familiar: string | null;
  Nombre_Adulto_Mayor: string | null;
  url_Avatar_Adulto_Mayor?: string | null;
  Nombre_Circulo: string | null;
  Rol_Adulto_Mayor: string | null;
  Rol_Familiar?: string | null;
}

interface PerfilCuidado {
  id: string;
  nombre: string;
  iniciales: string;
  urlAvatar?: string | null;
  rolEnCirculo: string;
  nombreCirculo: string;
  idAdultoMayor: number;
}

const construirUriAvatar = (urlAvatar: string) => {
  const baseUrl = (httpClient.defaults.baseURL ?? "").replace(/\/$/, "");
  const ruta = urlAvatar.trim();

  if (!ruta) return "";
  if (ruta.startsWith("http://") || ruta.startsWith("https://")) return ruta;
  if (!baseUrl) return ruta;

  return `${baseUrl}${ruta.startsWith("/") ? "" : "/"}${ruta}`;
};

const generarIniciales = (nombreCompleto: string): string => {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return "NP";
  if (partes.length === 1) return (partes[0]?.[0] ?? "").toUpperCase();
  if (partes.length === 2) {
    return `${partes[0]?.[0] ?? ""}${partes[1]?.[0] ?? ""}`.toUpperCase();
  }

  // Regla: 2 nombres + 2 apellidos -> inicial del primer nombre y del primer apellido.
  return `${partes[0]?.[0] ?? ""}${partes[2]?.[0] ?? ""}`.toUpperCase();
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

// Tarjeta de perfil
const ItemPerfil = ({
  perfil,
  estaExpandido,
  onPresionar,
}: {
  perfil: PerfilCuidado;
  estaExpandido: boolean;
  onPresionar: () => void;
}) => {
  const uriAvatar = perfil.urlAvatar ? construirUriAvatar(perfil.urlAvatar) : "";
  const tieneAvatar = Boolean(uriAvatar);

  return (
    <View style={styles.tarjetaPerfil}>
      <TouchableOpacity
        style={styles.tarjetaPerfil__encabezadoRow}
        onPress={onPresionar}
        activeOpacity={0.8}
      >
        <View
          style={styles.tarjetaPerfil__avatar}
          accessibilityRole="image"
          accessibilityLabel={`Avatar de ${perfil.nombre}`}
        >
          {tieneAvatar ? (
            <Image
              source={{ uri: uriAvatar }}
              style={styles.tarjetaPerfil__avatarImagen}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <Text style={styles.tarjetaPerfil__avatarTexto}>
              {perfil.iniciales}
            </Text>
          )}
        </View>

        <View style={styles.tarjetaPerfil__info}>
          <Text style={styles.tarjetaPerfil__nombre}>{perfil.nombre}</Text>
          <Text style={styles.tarjetaPerfil__meta}>
            {perfil.rolEnCirculo || "Adulto Mayor"}{perfil.nombreCirculo ? ` • ${perfil.nombreCirculo}` : ""}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.indicadorExpandir}>
        <Icon
          name={estaExpandido ? "chevron-up" : "chevron-down"}
          size={20}
          color="#CBD5E1"
        />
      </View>

      {estaExpandido && (
        <View style={styles.seccionExpandida}>
          <View style={styles.botonesAccion}>
            <TouchableOpacity
              style={styles.botonPrimario}
              activeOpacity={0.8}
            >
              <IconoCalendario />
              <Text style={styles.botonPrimario__texto}>Ver Agenda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonSecundario}
              activeOpacity={0.8}
            >
              <IconoInfoMedica />
              <Text style={styles.botonSecundario__texto}>Info Medica</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export const Familia = () => {
  const [perfiles, setPerfiles] = useState<PerfilCuidado[]>([]);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarVinculaciones = async () => {
    try {
      setCargando(true);
      const response = await httpClient.get("/vinculacion/mis-vinculaciones");
      const vinculaciones: VinculacionInfo[] = response.data;

      const perfilesMapeados: PerfilCuidado[] = vinculaciones.map((v) => ({
        id: String(v.Id_Vinculacion),
        nombre: v.Nombre_Adulto_Mayor || "Sin nombre",
        iniciales: generarIniciales(v.Nombre_Adulto_Mayor || "NP"),
        urlAvatar: v.url_Avatar_Adulto_Mayor?.trim() ? v.url_Avatar_Adulto_Mayor : null,
        rolEnCirculo:
          v.Rol_Familiar || obtenerParentescoDelAdultoParaFamiliar(v.Rol_Adulto_Mayor),
        nombreCirculo: v.Nombre_Circulo || "",
        idAdultoMayor: v.Id_Adulto_Mayor,
      }));

      setPerfiles(perfilesMapeados);
    } catch (error) {
      console.log("Error cargando vinculaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarVinculaciones();
    }, [])
  );

  const toggleExpandir = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandidoId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.encabezado__titulo}>Mis Familiares</Text>
        <TouchableOpacity
          style={styles.encabezado__botonAgregar}
          activeOpacity={0.8}
        >
          <IconoAgregar />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.areaContenido}
      >
        {cargando ? (
          <ActivityIndicator
            size="large"
            color="#00E676"
            style={{ marginTop: 50 }}
          />
        ) : perfiles.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Icon name="account-group-outline" size={64} color="#CBD5E1" />
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 16,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No tienes familiares vinculados aun.{"\n"}Comparte tu codigo para
              vincular.
            </Text>
          </View>
        ) : (
          <View style={styles.seccionGestionar}>
            <View style={styles.seccionEncabezadoRow}>
              <Text style={styles.seccionTitulo}>Adultos Mayores</Text>
              <Text style={styles.seccionConteo}>
                {perfiles.length}{" "}
                {perfiles.length === 1 ? "Persona" : "Personas"}
              </Text>
            </View>

            {perfiles.map((perfil) => (
              <ItemPerfil
                key={perfil.id}
                perfil={perfil}
                estaExpandido={expandidoId === perfil.id}
                onPresionar={() => toggleExpandir(perfil.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
