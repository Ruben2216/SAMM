import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, DimensionValue } from 'react-native';

interface BottomSheetSimpleProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  alto?: DimensionValue;
}

export const BottomSheetSimple: React.FC<BottomSheetSimpleProps> = ({ 
  visible, 
  onClose, 
  children,
  alto = '50%' 
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Fondo oscuro - Si tocas fuera, se cierra */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        
        {/* Evita que tocar la tarjeta blanca cierre el modal */}
        <TouchableWithoutFeedback>
          <View style={[styles.sheet, { height: alto }]}>
            {/* Píldora gris superior (Indicador de arrastre visual) */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
            
            {/* Contenido que le pases dentro */}
            <View style={styles.content}>
              {children}
            </View>
          </View>
        </TouchableWithoutFeedback>
        
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});