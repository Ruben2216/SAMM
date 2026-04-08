export type ConfirmationModalProps = {
    esVisible: boolean;
    textoPregunta: string;
    textoCancelar?: string;
    textoConfirmar?: string;
    alCancelar: () => void;
    alConfirmar: () => void;
    accessibilityLabel?: string;
};
