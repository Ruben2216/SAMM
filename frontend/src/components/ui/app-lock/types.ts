export interface AppLockProps {
  esVisible: boolean;
  cargando?: boolean;
  titulo?: string;
  descripcion?: string;
  textoBoton?: string;
  alReintentar: () => void;
  alSalir?: () => void;
}
