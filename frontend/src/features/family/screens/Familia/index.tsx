import React, { useState, useCallback, useRef } from "react";
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
import { construirUrlAvatar } from "../../../../utils/avatarUrl";

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

interface PerfilSalud {
  Tipo_Sangre?: string | null;
  Alergias?: string | null;
  Peso?: string | null;
  Edad?: number | null;
  Condicion_Medica?: string | null;
  Telefono?: string | null;
}

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
  perfilSalud,
  estaExpandido,
  onPresionar,
  onVerAgenda,
  onVerInfoMedica,
}: {
  perfil: PerfilCuidado;
  perfilSalud: PerfilSalud | null;
  estaExpandido: boolean;
  onPresionar: () => void;
  onVerAgenda: () => void;
  onVerInfoMedica: () => void;
}) => {
  const uriAvatar = construirUrlAvatar(perfil.urlAvatar, httpClient.defaults.baseURL ?? undefined);
  const tieneAvatar = Boolean(uriAvatar);

  const tipoSangre = perfilSalud?.Tipo_Sangre?.trim() || "—";
  const pesoRaw = perfilSalud?.Peso?.trim() ?? "";
  const pesoTexto = pesoRaw ? (/kg/i.test(pesoRaw) ? pesoRaw : `${pesoRaw} kg`) : "—";
  const alergiasRaw = perfilSalud?.Alergias?.trim() ?? "";
  const alergiasTexto = alergiasRaw || "Ninguna";
  const tieneAlergias = alergiasRaw.length > 0;

  const edad = perfilSalud?.Edad;
  const condicion = perfilSalud?.Condicion_Medica?.trim() ?? "";
  const partesSaludMeta: string[] = [];
  if (typeof edad === "number" && edad > 0) partesSaludMeta.push(`${edad} años`);
  if (condicion) partesSaludMeta.push(condicion);
  const metaSalud = partesSaludMeta.join(" • ");

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
          {metaSalud.length > 0 && (
            <Text style={styles.tarjetaPerfil__meta}>{metaSalud}</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.indicadorExpandir}
        onPress={onPresionar}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 40, right: 40 }}
        accessibilityRole="button"
        accessibilityLabel={estaExpandido ? "Contraer tarjeta" : "Expandir tarjeta"}
      >
        <Icon
          name={estaExpandido ? "chevron-up" : "chevron-down"}
          size={20}
          color="#CBD5E1"
        />
      </TouchableOpacity>

      {estaExpandido && (
        <View style={styles.seccionExpandida}>
          <View style={styles.estadisticasSalud}>
            <View style={styles.estadistica}>
              <Text style={styles.estadistica__etiqueta}>SANGRE</Text>
              <Text style={styles.estadistica__valorBold}>{tipoSangre}</Text>
            </View>
            <View style={styles.estadistica__divisor} />
            <View style={styles.estadistica}>
              <Text style={styles.estadistica__etiqueta}>PESO</Text>
              <Text style={styles.estadistica__valorBold}>{pesoTexto}</Text>
            </View>
            <View style={styles.estadistica__divisor} />
            <View style={styles.estadistica}>
              <Text style={styles.estadistica__etiqueta}>ALERGIAS</Text>
              <Text
                style={
                  tieneAlergias
                    ? styles.estadistica__valorAlerta
                    : styles.estadistica__valor
                }
                numberOfLines={1}
              >
                {alergiasTexto}
              </Text>
            </View>
          </View>

          <View style={styles.botonesAccion}>
            <TouchableOpacity
              style={styles.botonPrimario}
              activeOpacity={0.8}
              onPress={onVerAgenda}
            >
              <IconoCalendario />
              <Text style={styles.botonPrimario__texto}>Ver Agenda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonSecundario}
              activeOpacity={0.8}
              onPress={onVerInfoMedica}
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

export const Familia = ({ navigation }: { navigation: any }) => {
  const [perfiles, setPerfiles] = useState<PerfilCuidado[]>([]);
  const [perfilesSaludPorAdulto, setPerfilesSaludPorAdulto] = useState<
    Record<number, PerfilSalud>
  >({});
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const ultimaCargaMsRef = useRef<number>(0);
  const TIEMPO_CACHE_MS = 20000;
  const yaCargoUnaVezRef = useRef(false);

  const apiMedicamentos =
    process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || "http://192.168.0.17:8001";

  const cargarVinculaciones = useCallback(async () => {
    const esPrimerCarga = !yaCargoUnaVezRef.current;

    try {
      if (esPrimerCarga) {
        setCargando(true);
      }
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

      if (vinculaciones.length > 0) {
        const resultados = await Promise.all(
          vinculaciones.map(async (v) => {
            try {
              const res = await fetch(
                `${apiMedicamentos}/perfil-salud/usuario/${v.Id_Adulto_Mayor}`
              );
              if (res.ok) {
                const datos: PerfilSalud = await res.json();
                return { id: v.Id_Adulto_Mayor, datos };
              }
            } catch (err) {
              console.log("Error cargando perfil de salud:", err);
            }
            return { id: v.Id_Adulto_Mayor, datos: {} as PerfilSalud };
          })
        );
        const mapa: Record<number, PerfilSalud> = {};
        resultados.forEach((r) => {
          mapa[r.id] = r.datos;
        });
        setPerfilesSaludPorAdulto(mapa);
      } else {
        setPerfilesSaludPorAdulto({});
      }
    } catch (error) {
      console.log("Error cargando vinculaciones:", error);
    } finally {
      if (esPrimerCarga) {
        setCargando(false);
      }
      yaCargoUnaVezRef.current = true;
    }
  }, [apiMedicamentos]);

  useFocusEffect(
    useCallback(() => {
      const ahora = Date.now();
      if (ahora - ultimaCargaMsRef.current < TIEMPO_CACHE_MS) {
        return;
      }
      ultimaCargaMsRef.current = ahora;

      cargarVinculaciones();
    }, [cargarVinculaciones])
  );

  const toggleExpandir = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandidoId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.encabezado__titulo}>Mis Familiares</Text>
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
                perfilSalud={perfilesSaludPorAdulto[perfil.idAdultoMayor] ?? null}
                estaExpandido={expandidoId === perfil.id}
                onPresionar={() => toggleExpandir(perfil.id)}
                onVerAgenda={() =>
                  navigation.navigate("CitasFamiliar", {
                    idAdultoMayor: perfil.idAdultoMayor,
                    nombreAdulto: perfil.nombre,
                  })
                }
                onVerInfoMedica={() =>
                  navigation.navigate("MedicamentosFamiliar", {
                    idAdultoMayor: perfil.idAdultoMayor,
                    nombreAdulto: perfil.nombre,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
