import api from './httpService';

// Leemos la IP y el puerto de tu archivo .env del frontend
// Si por alguna razón no lo encuentra, usa localhost:8004 por defecto
const BASE_URL = process.env.EXPO_PUBLIC_API_URL_CITAS || 'http://127.0.0.1:8004';
const API_CITAS = `${BASE_URL}/api/citas`;

// 1. CREAR una cita (POST)
export const agendarCita = async (datosCita: any) => {
  try {
    const response = await api.post(`${API_CITAS}/`, datosCita);
    return response.data;
  } catch (error) {
    console.error('[citasService] Error agendando cita:', error);
    throw error;
  }
};

// 2. OBTENER todas las citas de un usuario (GET)
export const obtenerCitasUsuario = async (idUsuario: number) => {
  try {
    const response = await api.get(`${API_CITAS}/usuario/${idUsuario}`);
    return response.data;
  } catch (error) {
    console.error('[citasService] Error obteniendo historial:', error);
    throw error;
  }
};

// 3. ACTUALIZAR una cita (PUT)
export const actualizarCita = async (idCita: number, datosActualizados: any) => {
  try {
    const response = await api.put(`${API_CITAS}/${idCita}`, datosActualizados);
    return response.data;
  } catch (error) {
    console.error('[citasService] Error actualizando cita:', error);
    throw error;
  }
};

// 4. ELIMINAR una cita (DELETE)
export const eliminarCita = async (idCita: number) => {
  try {
    const response = await api.delete(`${API_CITAS}/${idCita}`);
    return response.data;
  } catch (error) {
    console.error('[citasService] Error eliminando cita:', error);
    throw error;
  }
};