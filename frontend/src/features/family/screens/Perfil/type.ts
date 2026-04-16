export interface Familiar {
  id: string;
  nombre: string;
  rol: string;
  urlAvatar?: string | null;
  esPrincipal?: boolean;
}

export interface NotificacionConfig {
  tomaCorrecta: boolean;
  olvidoCritico: boolean;
  salidaZona: boolean;
  bateriaBaja: boolean;
}

export interface SupervisionConfig {
  frecuenciaRastreo: string;
  tiempoMaxSinReporte: string;
}

export interface PerfilFamiliarState {
  nombre: string;
  correo: string;
  rol: string;
  familiares: Familiar[];
  notificaciones: NotificacionConfig;
  supervision: SupervisionConfig;
  biometriaActiva: boolean;
}