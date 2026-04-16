import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    tabBarBase: {
        paddingTop: 10,
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        elevation: 8,
        shadowOpacity: 0.1,
    },
});

export const crearEstiloTabBar = (espacioInferior: number) => {
    const tieneGestos = espacioInferior > 0;
    const alturaBarra = tieneGestos ? 60 + espacioInferior : 70;
    const paddingInferior = tieneGestos ? espacioInferior : 10;

    return {
        ...styles.tabBarBase,
        height: alturaBarra,
        paddingBottom: paddingInferior,
    };
};
