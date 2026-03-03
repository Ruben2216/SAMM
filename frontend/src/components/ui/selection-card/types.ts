import { ImageSourcePropType } from 'react-native';

export interface SelectionCardProps {
  titulo: string;
  descripcion: string;
  nombreIcono?: string;
  fuenteIcono?: ImageSourcePropType;
  alPresionar: () => void;
  estaSeleccionado?: boolean;
}
