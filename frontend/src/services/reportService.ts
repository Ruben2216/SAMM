// src/services/reportService.ts
import { PersonReport } from '../features/family/screens/Mapa/mapa.types';

export const getReports = async (): Promise<PersonReport[]> => {
  return [
    {
      id: '1',
      nombre: 'Esteban',
      foto: 'https://i.pravatar.cc/150?img=1',
      estado: 'en_casa',
      direccion: 'Bethesda, Maryland',
      telefono: '9621493695',
      lat: 38.98,
      lng: -77.09,
      ultimaActualizacion: '2026-04-15T14:25:00',
    },
    {
      id: '2',
      nombre: 'Maria',
      foto: 'https://i.pravatar.cc/150?img=1',
      estado: 'en_casa',
      direccion: 'Bethesda, Maryland',
      telefono: '9621493695', //
      lat: 38.97,
      lng: -77.10,
      ultimaActualizacion: '2026-04-15T12:10:00',
    },
  ];
};