export interface BotonCodigoProps {
  valor: string;
  indice: number;
  onPresionar: (indice: number) => void;
  esActivo?: boolean;
}
