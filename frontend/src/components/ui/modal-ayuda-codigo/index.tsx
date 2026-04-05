import React from "react";
import { View, Text, Modal, TouchableOpacity, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styles } from "./styles";
import { PropsModalAyudaCodigo } from "./types";
import { theme } from "../../../theme";

export const ModalAyudaCodigo: React.FC<PropsModalAyudaCodigo> = ({
    esVisible,
    alCerrar,
}) => {
    return (
        <Modal
            visible={esVisible}
            transparent
            animationType="fade"
            onRequestClose={alCerrar}
            accessibilityViewIsModal
        >
            <View
                style={styles.modal}
                accessibilityLabel="Ventana emergente de ayuda para obtener el código de vinculación"
            >
                <Pressable
                    style={styles.modal__fondoCerrable}
                    onPress={alCerrar}
                    accessibilityLabel="Cerrar ventana de ayuda"
                    accessibilityRole="button"
                />
                <View style={styles.modal__contenedor}>
                    <Text style={styles.modal__titulo}>Ayuda para obtener el código</Text>

                    <View style={styles.modal__encabezado}>
                        <Icon
                            name="information"
                            size={28}
                            color={theme.colors.text}
                            style={styles.modal__iconoInfo}
                            accessibilityLabel="Icono de información"
                        />
                        <Text style={styles.modal__textoIntroduccion}>
                            Pídele a tu familiar o cuidador autorizado que obtenga el código
                            en su aplicación SAMM.
                        </Text>
                    </View>

                    <View style={styles.modal__lista} accessibilityRole="list">
                        <View style={styles.modal__itemLista}>
                            <Text style={styles.modal__numeroItem}>1.</Text>
                            <Text style={styles.modal__textoItem}>
                                Tu familiar abre su app SAMM.
                            </Text>
                        </View>
                        <View style={styles.modal__itemLista}>
                            <Text style={styles.modal__numeroItem}>2.</Text>
                            <Text style={styles.modal__textoItem}>
                                Va a la sección "Vincular nuevo adulto mayor" en su perfil.
                            </Text>
                        </View>
                        <View style={styles.modal__itemLista}>
                            <Text style={styles.modal__numeroItem}>3.</Text>
                            <Text style={styles.modal__textoItem}>
                                Un código único de 5 caracteres aparecerá.
                            </Text>
                        </View>
                        <View style={styles.modal__itemLista}>
                            <Text style={styles.modal__numeroItem}>4.</Text>
                            <Text style={styles.modal__textoItem}>
                                Dile que te lo dicte o envie para que lo ingreses.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.modal__boton}
                        onPress={alCerrar}
                        accessibilityLabel="Cerrar ventana de ayuda"
                        accessibilityRole="button"
                    >
                        <Text style={styles.modal__textoBoton}>Entendido</Text>
                        <Icon
                            name="check-circle-outline"
                            size={25}
                            color={theme.colors.text}
                            accessibilityElementsHidden
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
