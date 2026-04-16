import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import {
  IconoMedicina,
  IconoVerificado,
  IconoFlechaDerecha,
} from '../../../../assets/iconos/iconos-recordatorio';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import httpClient from '../../../../services/httpService';

type Periodo = 'mañana' | 'tarde' | 'noche';

interface ItemAgenda {
  id: string;
  titulo: string;
  hora: string;
  horaCruda: string;
  estado: 'tomada' | 'pendiente';
  personaIniciales: string;
  personaColor: string;
  personaTextoColor: string;
  personaNombre: string;
  periodo: Periodo;
}

interface VinculacionInfo {
  Id_Vinculacion: number;
  Id_Adulto_Mayor: number;
  Nombre_Adulto_Mayor: string | null;
  Nombre_Circulo: string | null;
}

const generarIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(' ');
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nombre.length >= 2 ? nombre.substring(0, 2).toUpperCase() : 'NP';
};

const COLORES_AVATAR = [
  { bg: '#E2E8F0', texto: '#475569' },
  { bg: '#818CF8', texto: '#FFFFFF' },
  { bg: '#F472B6', texto: '#FFFFFF' },
  { bg: '#34D399', texto: '#FFFFFF' },
];

const obtenerPeriodo = (hora: string): Periodo => {
  const h = parseInt(hora.split(':')[0], 10);
  if (h < 12) return 'mañana';
  if (h < 18) return 'tarde';
  return 'noche';
};

const formatearHora = (horaCruda: string): string => {
  const [hStr, mStr] = horaCruda.split(':');
  let horas = parseInt(hStr, 10);
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12 || 12;
  return `${horas}:${mStr} ${ampm}`;
};

// Icono de tipo
const IconoTipo = () => (
  <View style={[styles.iconoTipo, styles.iconoTipo__verde]}>
    <IconoMedicina />
  </View>
);

// Subtítulo con estado
const SubtituloEstado = ({ item }: { item: ItemAgenda }) => {
  if (item.estado === 'tomada') {
    return (
      <View style={styles.itemContenido__subtituloRow}>
        <IconoVerificado />
        <Text style={styles.itemContenido__subtituloVerde}>
          {item.hora} • Tomada
        </Text>
      </View>
    );
  }
  return (
    <Text style={styles.itemContenido__subtituloRojo}>
      {item.hora} • Pendiente
    </Text>
  );
};

// Tarjeta de recordatorio
const TarjetaRecordatorio = ({ item }: { item: ItemAgenda }) => (
  <TouchableOpacity style={styles.tarjetaRecordatorio} activeOpacity={0.85}>
    <IconoTipo />
    <View style={styles.itemContenido}>
      <Text
        style={item.estado === 'pendiente' ? styles.itemContenido__tituloAlerta : styles.itemContenido__titulo}
      >
        {item.titulo}
      </Text>
      <SubtituloEstado item={item} />
    </View>
    <View style={[styles.avatarBadge, { backgroundColor: item.personaColor }]}>
      <Text style={[styles.avatarBadge__texto, { color: item.personaTextoColor }]}>
        {item.personaIniciales}
      </Text>
    </View>
    <IconoFlechaDerecha />
  </TouchableOpacity>
);

export const Recordatorio = () => {
  const [items, setItems] = useState<ItemAgenda[]>([]);
  const [filtros, setFiltros] = useState<string[]>(['Todos']);
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL_MEDICAMENTOS || 'http://192.168.0.17:8001';

  const cargarDatos = async () => {
    try {
      setCargando(true);

      // 1. Obtener vinculaciones
      const resVinc = await httpClient.get('/vinculacion/mis-vinculaciones');
      const vinculaciones: VinculacionInfo[] = resVinc.data;

      if (vinculaciones.length === 0) {
        setItems([]);
        setFiltros(['Todos']);
        return;
      }

      const nombresUnicos = ['Todos'];
      const todosItems: ItemAgenda[] = [];

      for (let i = 0; i < vinculaciones.length; i++) {
        const vinc = vinculaciones[i];
        const nombre = vinc.Nombre_Adulto_Mayor || 'Adulto Mayor';
        const iniciales = generarIniciales(nombre);
        const color = COLORES_AVATAR[i % COLORES_AVATAR.length];
        nombresUnicos.push(nombre);

        // 2. Obtener medicamentos de cada senior
        try {
          const resMeds = await fetch(`${apiUrl}/medicamentos/usuario/${vinc.Id_Adulto_Mayor}`);
          if (resMeds.ok) {
            const meds = await resMeds.json();

            for (const med of meds) {
              const tomado = med.tomado_hoy === true;
              const horarios = med.horarios || [];

              for (const horario of horarios) {
                const horaCruda = horario.Hora_Toma || '08:00';
                todosItems.push({
                  id: `${vinc.Id_Adulto_Mayor}-${med.Id_Medicamento}-${horario.Id_Horario}`,
                  titulo: med.Nombre,
                  hora: formatearHora(horaCruda),
                  horaCruda,
                  estado: tomado ? 'tomada' : 'pendiente',
                  personaIniciales: iniciales,
                  personaColor: color.bg,
                  personaTextoColor: color.texto,
                  personaNombre: nombre,
                  periodo: obtenerPeriodo(horaCruda),
                });
              }
            }
          }
        } catch (err) {
          console.log('Error cargando medicamentos del senior:', err);
        }
      }

      // Ordenar por hora
      todosItems.sort((a, b) => a.horaCruda.localeCompare(b.horaCruda));

      setFiltros(nombresUnicos);
      setItems(todosItems);
    } catch (error) {
      console.log('Error cargando agenda:', error);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const itemsFiltrados =
    filtroActivo === 'Todos' ? items : items.filter((r) => r.personaNombre === filtroActivo);

  const itemsManana = itemsFiltrados.filter((r) => r.periodo === 'mañana');
  const itemsTarde = itemsFiltrados.filter((r) => r.periodo === 'tarde');
  const itemsNoche = itemsFiltrados.filter((r) => r.periodo === 'noche');

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.encabezado__titulo}>Agenda</Text>
      </View>

      <View style={styles.contenedorFiltros}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollFiltros}
        >
          {filtros.map((filtro) => (
            <TouchableOpacity
              key={filtro}
              style={[styles.filtro, filtroActivo === filtro && styles.filtro__activo]}
              onPress={() => setFiltroActivo(filtro)}
              activeOpacity={0.8}
            >
              <Text style={filtroActivo === filtro ? styles.filtro__textoActivo : styles.filtro__texto}>
                {filtro}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.areaContenido}>
        {cargando ? (
          <ActivityIndicator size="large" color="#00E676" style={{ marginTop: 50 }} />
        ) : itemsFiltrados.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Icon name="calendar-blank-outline" size={64} color="#CBD5E1" />
            <Text style={{ color: '#94A3B8', fontSize: 15, marginTop: 16, textAlign: 'center' }}>
              No hay recordatorios para hoy
            </Text>
          </View>
        ) : (
          <>
            {itemsManana.length > 0 && (
              <>
                <View style={styles.periodoPerfil}>
                  <Text style={styles.periodoPerfil__texto}>MAÑANA</Text>
                </View>
                {itemsManana.map((item) => (
                  <TarjetaRecordatorio key={item.id} item={item} />
                ))}
              </>
            )}

            {itemsTarde.length > 0 && (
              <>
                <View style={styles.periodoPerfil}>
                  <Text style={styles.periodoPerfil__texto}>TARDE</Text>
                </View>
                {itemsTarde.map((item) => (
                  <TarjetaRecordatorio key={item.id} item={item} />
                ))}
              </>
            )}

            {itemsNoche.length > 0 && (
              <>
                <View style={styles.periodoPerfil}>
                  <Text style={styles.periodoPerfil__texto}>NOCHE</Text>
                </View>
                {itemsNoche.map((item) => (
                  <TarjetaRecordatorio key={item.id} item={item} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};
