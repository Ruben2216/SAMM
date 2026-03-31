import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { IconoCalendario } from '../../../../assets/iconos/iconos-familiares';
import {
  IconoMedicina,
  IconoInyeccion,
  IconoVerificado,
  IconoUbicacion,
  IconoFlechaDerecha,
} from '../../../../assets/iconos/iconos-recordatorio';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type TipoItem = 'medicina' | 'inyeccion' | 'cita';
type EstadoItem = 'tomada' | 'noRegistrada' | 'pendiente';
type Periodo = 'mañana' | 'tarde' | 'noche';

interface ItemAgenda {
  id: string;
  titulo: string;
  hora: string;
  estado: EstadoItem;
  tipo: TipoItem;
  subtitulo?: string;
  personaIniciales: string;
  personaColor: string;
  personaTextoColor: string;
  personaNombre: string;
  periodo: Periodo;
}

const FILTROS = ['Todos', 'Papá (Roberto)', 'Mamá (Elena)'];

const DATOS_AGENDA: ItemAgenda[] = [
  {
    id: '1',
    titulo: 'Losartan 50mg',
    hora: '8:00 AM',
    estado: 'tomada',
    tipo: 'medicina',
    personaIniciales: 'RM',
    personaColor: '#E2E8F0',
    personaTextoColor: '#475569',
    personaNombre: 'Papá (Roberto)',
    periodo: 'mañana',
  },
  {
    id: '2',
    titulo: 'Insulina',
    hora: '9:00 AM',
    estado: 'noRegistrada',
    tipo: 'inyeccion',
    personaIniciales: 'EG',
    personaColor: '#818CF8',
    personaTextoColor: '#FFFFFF',
    personaNombre: 'Mamá (Elena)',
    periodo: 'mañana',
  },
  {
    id: '3',
    titulo: 'Cita: Cardiólogo',
    hora: '4:00 PM',
    estado: 'pendiente',
    tipo: 'cita',
    subtitulo: 'Hospital Central',
    personaIniciales: 'RM',
    personaColor: '#E2E8F0',
    personaTextoColor: '#475569',
    personaNombre: 'Papá (Roberto)',
    periodo: 'tarde',
  },
];

// Icono según el tipo de recordatorio
const IconoTipo = ({ tipo }: { tipo: TipoItem }) => {
  const esVerde = tipo === 'medicina';
  return (
    <View
      style={[
        styles.iconoTipo,
        esVerde ? styles.iconoTipo__verde : styles.iconoTipo__azul,
      ]}
    >
      {tipo === 'medicina' && <IconoMedicina />}
      {tipo === 'inyeccion' && <IconoInyeccion />}
      {tipo === 'cita' && <IconoCalendario color="#3B82F6" />}
    </View>
  );
};

// Subtítulo con estado y color
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
  if (item.estado === 'noRegistrada') {
    return (
      <Text style={styles.itemContenido__subtituloRojo}>
        {item.hora} • No registrada
      </Text>
    );
  }
  return (
    <View style={styles.itemContenido__subtituloRow}>
      <IconoUbicacion />
      <Text style={styles.itemContenido__subtituloGris}>
        {item.hora} • {item.subtitulo}
      </Text>
    </View>
  );
};

// Tarjeta individual de recordatorio
const TarjetaRecordatorio = ({ item }: { item: ItemAgenda }) => (
  <TouchableOpacity
    style={styles.tarjetaRecordatorio}
    activeOpacity={0.85}
    accessible={true}
    accessibilityLabel={`${item.titulo}, ${item.hora}`}
  >
    <IconoTipo tipo={item.tipo} />

    <View style={styles.itemContenido}>
      <Text
        style={
          item.estado === 'noRegistrada'
            ? styles.itemContenido__tituloAlerta
            : styles.itemContenido__titulo
        }
      >
        {item.titulo}
      </Text>
      <SubtituloEstado item={item} />
    </View>

    <View
      style={[styles.avatarBadge, { backgroundColor: item.personaColor }]}
    >
      <Text
        style={[
          styles.avatarBadge__texto,
          { color: item.personaTextoColor },
        ]}
      >
        {item.personaIniciales}
      </Text>
    </View>

    <IconoFlechaDerecha />
  </TouchableOpacity>
);

// Pantalla principal de Recordatorio/Agenda
export const Recordatorio = () => {
  const [filtroActivo, setFiltroActivo] = useState('Todos');

  const itemsFiltrados =
    filtroActivo === 'Todos'
      ? DATOS_AGENDA
      : DATOS_AGENDA.filter((r) => r.personaNombre === filtroActivo);

  const itemsManana = itemsFiltrados.filter((r) => r.periodo === 'mañana');
  const itemsTarde = itemsFiltrados.filter((r) => r.periodo === 'tarde');
  const itemsNoche = itemsFiltrados.filter((r) => r.periodo === 'noche');

  return (
    <View style={styles.contenedor}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <Text style={styles.encabezado__titulo}>Agenda</Text>
      </View>

      {/* Filtros horizontales */}
      <View style={styles.contenedorFiltros}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollFiltros}
        >
          {FILTROS.map((filtro) => (
            <TouchableOpacity
              key={filtro}
              style={[
                styles.filtro,
                filtroActivo === filtro && styles.filtro__activo,
              ]}
              onPress={() => setFiltroActivo(filtro)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel={`Filtrar por ${filtro}`}
              accessibilityRole="button"
            >
              <Text
                style={
                  filtroActivo === filtro
                    ? styles.filtro__textoActivo
                    : styles.filtro__texto
                }
              >
                {filtro}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenido de agenda */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.areaContenido}
      >
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
      </ScrollView>

      {/* FAB - Botón flotante agregar */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Agregar nuevo recordatorio"
        accessibilityRole="button"
      >
        <Icon name="plus" size={21} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};