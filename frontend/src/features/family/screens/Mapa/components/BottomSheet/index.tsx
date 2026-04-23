// frontend/src/features/family/screens/Mapa/components/BottomSheet.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonReport } from '../../mapa.type';

interface Props {
  data: PersonReport[];
  selected: PersonReport | null;
  onSelect: (p: PersonReport) => void;
  onAlert: (p: PersonReport) => void;
}

export default function CustomBottomSheet({ data, selected, onSelect, onAlert }: Props) {
  return (
    <View style={styles.container}>
      {/* Píldora decorativa superior */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      
      <Text style={styles.title}>Familiares en el mapa ({data.length})</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onSelect(item)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nombre}</Text>
                {/* Puedes ajustar 'item.hora' según lo que venga en tu backend */}
                <Text style={styles.details}>Última ubicación registrada</Text> 
              </View>
              
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => onAlert(item)}
                activeOpacity={0.8}
              >
                <Ionicons name="warning-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%', // Ocupa un poco menos de la mitad para no tapar el mapa
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSelected: {
    borderColor: '#00E676',
    backgroundColor: '#F0FDF4',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  details: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  alertButton: {
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
});