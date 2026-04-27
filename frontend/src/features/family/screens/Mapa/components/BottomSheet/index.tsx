import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { PersonReport } from '../../mapa.types';
import { PersonCard } from '../PersonCard'; // ← usa el componente real

interface Props {
  data:     PersonReport[];
  selected: PersonReport | null;
  onSelect: (p: PersonReport) => void;
  onAlert:  (p: PersonReport) => void;
}

export default function CustomBottomSheet({ data, selected, onSelect, onAlert }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <Text style={styles.title}>Familiares en el mapa ({data.length})</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PersonCard
            person={item}
            isSelected={selected?.id === item.id}
            onPress={() => onSelect(item)}
            onAlert={() => onAlert(item)}
          />
        )}
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
    height: '42%',
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
});