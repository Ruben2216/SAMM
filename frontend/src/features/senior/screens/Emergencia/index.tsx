import React from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Linking,
	SafeAreaView,
	useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createStyles } from './styles';

export const Emergencia = () => {
	const navigation = useNavigation<any>();
	const { width, height } = useWindowDimensions();
	const styles = React.useMemo(() => createStyles(width, height), [width, height]);

	const realizarLlamada = async (numeroTelefono: string) => {
		const enlace = `tel:${numeroTelefono}`;

		try {
			const puedeAbrir = await Linking.canOpenURL(enlace);
			if (puedeAbrir) {
				await Linking.openURL(enlace);
			}
		} catch (error) {
			console.error('No se pudo iniciar la llamada de emergencia', error);
		}
	};

	const abrirAsistencia = (nombreContacto: string, telefono: string) => {
		navigation.navigate('Asistencia', {
			nombreContacto,
			telefono,
		});
	};

	return (
		<SafeAreaView style={styles.contenedorPantalla}>
			<View style={styles.tarjetaPrincipal}>
				<TouchableOpacity
					accessibilityLabel="Cerrar pantalla de emergencia"
					accessibilityRole="button"
					onPress={() => navigation.goBack()}
					style={styles.botonCerrar}
				>
					<Ionicons name="close" size={22} color="#1E293B" />
				</TouchableOpacity>

				<Text style={styles.titulo}>¡Emergencia!{`\n`}Llamar a:</Text>

				<View style={styles.bloqueBotones}>
					<TouchableOpacity
						accessibilityLabel="Llamar a mi cuidador"
						accessibilityRole="button"
						onPress={() => abrirAsistencia('Mi cuidador', '3000000000')}
						style={styles.botonLlamada}
					>
						<Ionicons name="call-outline" size={19} color="#0F172A" />
						<Text style={styles.textoBotonLlamada}>Mi cuidador</Text>
					</TouchableOpacity>

					<TouchableOpacity
						accessibilityLabel="Llamar al contacto de emergencia"
						accessibilityRole="button"
						onPress={() => abrirAsistencia('Contacto de emergencia', '3000000001')}
						style={styles.botonLlamada}
					>
						<Ionicons name="call-outline" size={19} color="#0F172A" />
						<Text style={styles.textoBotonLlamada}>Contacto de emergencia</Text>
					</TouchableOpacity>

					<TouchableOpacity
						accessibilityLabel="Llamar al 911"
						accessibilityRole="button"
						onPress={() => realizarLlamada('911')}
						style={styles.botonLlamada911}
					>
						<Ionicons name="call-outline" size={19} color="#0F172A" />
						<Text style={styles.textoBotonLlamada}>911</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.contenedorInferior}>
					<TouchableOpacity
						accessibilityLabel="Agregar contacto de emergencia"
						accessibilityRole="button"
						onPress={() => navigation.navigate('AgregarContactos')}
						style={styles.botonAgregar}
					>
						<Ionicons name="add" size={21} color="#0F172A" />
						<Text style={styles.textoBotonAgregar}>Agregar</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
};
