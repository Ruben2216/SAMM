export interface PrimaryButtonProps {
  /** Texto del botón */
  title: string;
  /** Función al presionar */
  onPress: () => void;
  /** Deshabilitar el botón */
  disabled?: boolean;
  /** Mostrar indicador de carga */
  loading?: boolean;
  /** Ancho completo (por defecto: true) */
  fullWidth?: boolean;
}
