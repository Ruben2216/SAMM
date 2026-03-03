export interface PrimaryButtonProps {
  titulo: string;
  alPresionar: () => void;
  deshabilitado?: boolean;
  cargando?: boolean;
  anchoCompleto?: boolean;
}
