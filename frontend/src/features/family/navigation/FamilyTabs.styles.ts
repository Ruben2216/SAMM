import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

const ALTURA_TAB_BAR_BASE = 70;
const PADDING_TOP_TAB_BAR = 10;

export const styles = StyleSheet.create({
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 5,
    },
    tabBarBase: {
        height: ALTURA_TAB_BAR_BASE,
        paddingTop: PADDING_TOP_TAB_BAR,
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        elevation: 8,
        shadowOpacity: 0.1,
    },
});

export const crearEstiloTabBar = (espacioInferior: number) => {
    const espacioSeguro = Math.max(0, espacioInferior);

    return {
        ...styles.tabBarBase,
        height: ALTURA_TAB_BAR_BASE + espacioSeguro,
        paddingBottom: espacioSeguro,
    };
};
