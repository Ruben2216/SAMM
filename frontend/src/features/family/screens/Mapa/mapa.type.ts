// src/features/family/screens/Mapa/mapa.types.ts
export interface PersonReport {
  id:                  string;
  nombre:              string;
  foto:                string;
  estado:              string;
  direccion:           string;
  telefono:            string;
  lat:                 number;
  lng:                 number;
  ultimaActualizacion: string;  // hora formateada, e.g. "14:25"
  rastreoActivo?:      boolean; // true si el adulto mayor tiene su GPS encendido
}