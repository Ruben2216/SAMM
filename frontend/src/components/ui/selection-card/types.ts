import { ImageSourcePropType } from 'react-native';

export interface SelectionCardProps {
  /** Título de la opción */
  title: string;
  /** Descripción breve */
  description: string;
  /** Nombre del icono de MaterialCommunityIcons (opcional si se usa iconSource) */
  iconName?: string;
  /** Fuente de imagen local (opcional si se usa iconName) */
  iconSource?: ImageSourcePropType;
  /** Función al presionar la tarjeta */
  onPress: () => void;
  /** Indica si está seleccionada */
  isSelected?: boolean;
}
