import { StyleSheet } from 'react-native';

const escala = (base: number, ancho: number) => {
	const factor = ancho / 390;
	return Math.max(base * 0.88, Math.min(base * factor, base * 1.12));
};

export const createStyles = (ancho: number, alto: number) => {
	const anchoTarjeta = Math.min(ancho - 24, 460);
	const titulo = escala(38, ancho);

	return StyleSheet.create({
		contenedorPantalla: {
			flex: 1,
			backgroundColor: '#E5E7EB',
			alignItems: 'center',
			justifyContent: 'center',
			paddingHorizontal: 12,
			paddingVertical: 8,
		},
		tarjetaPrincipal: {
			width: anchoTarjeta,
			flexGrow: 1,
			maxHeight: Math.max(alto - 16, 600),
			backgroundColor: '#ECECEC',
			borderRadius: 22,
			borderWidth: 1,
			borderColor: '#D8DDE5',
			paddingHorizontal: 14,
			paddingTop: 12,
			paddingBottom: 12,
		},
		botonCerrar: {
			width: 40,
			height: 40,
			borderRadius: 20,
			alignItems: 'center',
			justifyContent: 'center',
			marginBottom: 8,
		},
		titulo: {
			fontSize: titulo,
			lineHeight: titulo * 1.08,
			fontWeight: '900',
			color: '#1E293B',
			textAlign: 'center',
			marginBottom: 16,
		},
		bloqueBotones: {
			width: '100%',
			rowGap: 10,
		},
		botonLlamada: {
			minHeight: 48,
			borderRadius: 26,
			backgroundColor: '#14EC5C',
			paddingHorizontal: 14,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			columnGap: 8,
		},
		botonLlamada911: {
			minHeight: 48,
			borderRadius: 26,
			backgroundColor: '#EF1C1C',
			paddingHorizontal: 14,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			columnGap: 8,
		},
		textoBotonLlamada: {
			color: '#0F172A',
			fontSize: escala(22, ancho),
			fontWeight: '900',
		},
		contenedorInferior: {
			flex: 1,
			justifyContent: 'flex-end',
			alignItems: 'flex-end',
			paddingTop: 12,
		},
		botonAgregar: {
			minHeight: 48,
			minWidth: 160,
			borderRadius: 26,
			backgroundColor: '#14EC5C',
			paddingHorizontal: 14,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			columnGap: 6,
		},
		textoBotonAgregar: {
			color: '#0F172A',
			fontSize: escala(24, ancho),
			fontWeight: '900',
		},
	});
};
