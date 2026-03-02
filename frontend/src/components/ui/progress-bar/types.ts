export interface ProgressBarProps {
  /** Paso actual (empezando desde 1) */
  currentStep: number;
  /** Total de pasos */
  totalSteps: number;
  /** Etiqueta personalizada (opcional) */
  customLabel?: string;
}
