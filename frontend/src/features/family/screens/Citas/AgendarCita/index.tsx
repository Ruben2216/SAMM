import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { citasStyles, formStyles, themeColors } from './styles';
import { agendarCita, actualizarCita } from '../../../../../services/citasService';
import { useAuthStore } from '../../../../auth/authStore';
import { SuccessModal } from '../../../../../components/ui/success-modal';

interface CampoTextoProps {
  etiqueta: string; placeholder?: string; icono?: string; multilinea?: boolean;
  valor: string; alCambiar: (texto: string) => void;
}

const CampoTexto: React.FC<CampoTextoProps> = ({ etiqueta, placeholder, icono, multilinea, valor, alCambiar }) => (
  <View style={formStyles.campoContenedor}>
    <Text style={formStyles.etiqueta}>{etiqueta}</Text>
    <View style={[formStyles.inputContenedor, multilinea && formStyles.inputContenedorMultilinea]}>
      {icono && !multilinea && <Ionicons name={icono as any} size={20} color="#94A3B8" style={{ marginRight: 10 }} />}
      <TextInput
        style={[formStyles.input, multilinea && formStyles.inputMultilinea]}
        placeholder={placeholder} placeholderTextColor="#94A3B8" value={valor}
        onChangeText={alCambiar} multiline={multilinea} numberOfLines={multilinea ? 4 : 1}
      />
    </View>
  </View>
);

interface SelectorProps {
  etiqueta: string; valor: string; opciones: string[]; alSeleccionar: (v: string) => void;
}

const Selector: React.FC<SelectorProps> = ({ etiqueta, valor, opciones, alSeleccionar }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={formStyles.campoContenedor}>
      <Text style={formStyles.etiqueta}>{etiqueta}</Text>
      <TouchableOpacity style={formStyles.inputContenedor} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={[formStyles.input, { color: valor ? '#0F172A' : '#94A3B8' }]}>
          {valor || 'Selecciona una opción'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={formStyles.modalOverlay}>
          <View style={formStyles.modalContenido}>
            <Text style={formStyles.modalTitulo}>{etiqueta}</Text>
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {opciones.map((opt) => {
                const activa = opt === valor;
                return (
                  <TouchableOpacity
                    key={opt} style={[formStyles.modalOpcion, activa && formStyles.modalOpcionActiva]}
                    onPress={() => { alSeleccionar(opt); setModalVisible(false); }} activeOpacity={0.7}
                  >
                    <Text style={[formStyles.modalOpcionTexto, activa && formStyles.modalOpcionTextoActiva]}>{opt}</Text>
                    {activa && <Ionicons name="checkmark" size={20} color="#00E676" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={formStyles.modalCerrar} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
              <Text style={formStyles.modalCerrarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface SelectorFechaHoraProps {
  etiqueta: string; valor: Date; modo: 'date' | 'time'; icono: string; alPresionar: () => void;
}

const SelectorFechaHora: React.FC<SelectorFechaHoraProps> = ({ etiqueta, valor, modo, icono, alPresionar }) => {
  const texto = modo === 'date'
    ? valor.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : valor.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <View style={{ flex: 1 }}>
      <Text style={formStyles.etiqueta}>{etiqueta}</Text>
      <TouchableOpacity style={formStyles.inputContenedor} onPress={alPresionar} activeOpacity={0.8}>
        <Ionicons name={icono as any} size={20} color="#94A3B8" style={{ marginRight: 10 }} />
        <Text style={formStyles.input}>{texto}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function AgendarCitaScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const usuario = useAuthStore((s) => s.usuario);

  const citaToEdit = route.params?.citaToEdit;
  const esEdicion = !!citaToEdit;

  const idAdultoMayor: number = route.params?.idAdultoMayor ?? citaToEdit?.id_usuario ?? usuario?.Id_Usuario ?? 0;
  const nombreAdulto: string = route.params?.nombreAdulto ?? '';

  // Estado dinamico para las especialidades
  const [catalogoEspecialidades, setCatalogoEspecialidades] = useState<string[]>([
    'Medicina General', 'Cardiología', 'Geriatría', 'Odontología', 'Oftalmología',
    'Traumatología', 'Neurología', 'Endocrinología', 'Otro'
  ]);

  const [formData, setFormData] = useState({
    doctor: citaToEdit?.doctor_nombre || '',
    especialidad: citaToEdit?.especialidad || '',
    especialidadManual: '',
    lugar: citaToEdit?.ubicacion || '',
    notas: citaToEdit?.notas || '',
    fecha: citaToEdit ? new Date(citaToEdit.fecha_hora) : new Date(),
    hora: citaToEdit ? new Date(citaToEdit.fecha_hora) : new Date(),
  });
  
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modalExitoVisible, setModalExitoVisible] = useState(false);
  const [modalErrorVisible, setModalErrorVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const validar = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.doctor.trim()) errs.doctor = 'Ingresa el nombre del doctor.';
    if (!formData.especialidad) errs.especialidad = 'Selecciona la especialidad.';
    
    // Si selecciona "Otro", debe escribir algo (nueva validación)
    if (formData.especialidad === 'Otro' && !formData.especialidadManual.trim()) {
        errs.especialidadManual = 'Escribe la especialidad manualmente.';
    }
    
    if (idAdultoMayor <= 0) errs.adulto = 'No se pudo identificar al adulto mayor.';
    setErroresCampo(errs);
    return Object.keys(errs).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    const fechaFinal = new Date(formData.fecha);
    fechaFinal.setHours(formData.hora.getHours(), formData.hora.getMinutes(), 0, 0);

    // Enviar el dato correcto al backend
    const especialidadFinal = formData.especialidad === 'Otro' 
        ? formData.especialidadManual.trim() 
        : formData.especialidad;

    const payload = {
      id_usuario: idAdultoMayor,
      id_usuario_creador: usuario?.Id_Usuario ?? idAdultoMayor,
      doctor_nombre: formData.doctor.trim(),
      especialidad: especialidadFinal,
      fecha_hora: fechaFinal.toISOString(),
      ubicacion: formData.lugar.trim(),
      notas: formData.notas.trim(),
      estado: citaToEdit?.estado || 'programada',
    };

    try {
      setGuardando(true);
      if (esEdicion) await actualizarCita(citaToEdit.id, payload);
      else await agendarCita(payload);
      setModalExitoVisible(true);
    } catch (error: any) {
      setMensajeError(esEdicion ? 'No se pudo actualizar la cita. Intenta de nuevo.' : 'No se pudo agendar la cita. Intenta de nuevo.');
      setModalErrorVisible(true);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={citasStyles.contenedor}>
        <View style={citasStyles.header}>
          <TouchableOpacity style={citasStyles.botonAtras} onPress={() => navigation.goBack()} accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={citasStyles.tituloHeader}>{esEdicion ? 'Editar cita' : 'Agendar cita'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={formStyles.tituloSecundario}>{esEdicion ? "Modificar consulta" : "Nueva consulta"}</Text>
          <Text style={formStyles.descripcion}>
            {nombreAdulto ? `Ingresa los datos de la cita médica programada para ${nombreAdulto.split(' ')[0]}` : 'Ingresa los datos de tu cita médica programada'}
          </Text>

          <CampoTexto etiqueta="Nombre del doctor" placeholder="Ej: Dr. Pérez" icono="medkit-outline" valor={formData.doctor} alCambiar={(v) => setFormData({ ...formData, doctor: v })} />
          {erroresCampo.doctor && <Text style={formStyles.textoError}>{erroresCampo.doctor}</Text>}

          <Selector 
            etiqueta="Especialidad" 
            valor={formData.especialidad} 
            opciones={catalogoEspecialidades} 
            alSeleccionar={(v) => setFormData({ ...formData, especialidad: v, especialidadManual: '' })} 
          />
          {erroresCampo.especialidad && <Text style={formStyles.textoError}>{erroresCampo.especialidad}</Text>}

          {/* Campo que aparece dinámicamente si elige "Otro" */}
          {formData.especialidad === 'Otro' && (
            <>
              <CampoTexto 
                etiqueta="Especifique la especialidad" 
                placeholder="Ej: Reumatología, Urología..." 
                icono="pencil-outline" 
                valor={formData.especialidadManual} 
                alCambiar={(v) => setFormData({ ...formData, especialidadManual: v })} 
              />
              {erroresCampo.especialidadManual && <Text style={formStyles.textoError}>{erroresCampo.especialidadManual}</Text>}
            </>
          )}

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 0 }}>
            <SelectorFechaHora etiqueta="Fecha" valor={formData.fecha} modo="date" icono="calendar-outline" alPresionar={() => setShowDatePicker(true)} />
            <SelectorFechaHora etiqueta="Hora" valor={formData.hora} modo="time" icono="time-outline" alPresionar={() => setShowTimePicker(true)} />
          </View>

          <CampoTexto etiqueta="Lugar o Consultorio" placeholder="Dirección o centro médico" icono="location-outline" valor={formData.lugar} alCambiar={(v) => setFormData({ ...formData, lugar: v })} />
          <CampoTexto etiqueta="Notas (opcional)" placeholder="Ej: Llegar 15 min antes, llevar receta..." multilinea valor={formData.notas} alCambiar={(v) => setFormData({ ...formData, notas: v })} />
          {erroresCampo.adulto && <Text style={formStyles.textoError}>{erroresCampo.adulto}</Text>}
        </ScrollView>

        <View style={citasStyles.footer}>
          <TouchableOpacity style={[citasStyles.botonGuardar, guardando && { opacity: 0.7 }]} onPress={guardar} disabled={guardando} activeOpacity={0.8}>
            {guardando ? <ActivityIndicator color="#0F172A" /> : <Ionicons name={esEdicion ? 'reload-outline' : 'save-outline'} size={20} color="#0F172A" />}
            <Text style={citasStyles.textoBoton}>{guardando ? 'Procesando...' : esEdicion ? 'Actualizar cita' : 'Guardar cita'}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && <DateTimePicker value={formData.fecha} mode="date" display="default" accentColor="#00E676" minimumDate={new Date()} onChange={(_, selected) => { setShowDatePicker(Platform.OS === 'ios'); if (selected) setFormData({ ...formData, fecha: selected }); }} />}
        {showTimePicker && <DateTimePicker value={formData.hora} mode="time" display="default" accentColor="#00E676" onChange={(_, selected) => { setShowTimePicker(Platform.OS === 'ios'); if (selected) setFormData({ ...formData, hora: selected }); }} />}

        <SuccessModal esVisible={modalExitoVisible} mensaje={esEdicion ? 'La cita se actualizó correctamente.' : 'La cita se agendó correctamente.'} alTerminar={() => { setModalExitoVisible(false); navigation.goBack(); }} />
        <Modal visible={modalErrorVisible} transparent animationType="fade">
          <View style={formStyles.modalOverlay}>
            <View style={formStyles.modalErrorContenido}>
              <View style={formStyles.modalErrorIcono}><Ionicons name="alert-circle-outline" size={32} color={themeColors.error} /></View>
              <Text style={formStyles.modalErrorTitulo}>Error</Text>
              <Text style={formStyles.modalErrorMensaje}>{mensajeError}</Text>
              <TouchableOpacity style={formStyles.modalErrorBoton} onPress={() => setModalErrorVisible(false)} activeOpacity={0.8}><Text style={formStyles.modalErrorBotonTexto}>Entendido</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}