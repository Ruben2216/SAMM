// frontend/src/features/family/screens/Mapa/components/BottomSheet/index.tsx
import React, { useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'; // ← BottomSheetView
import { Text } from 'react-native';
import { styles } from './BottomSheet.styles';
import { PersonCard } from '../PersonCard';

export const CustomBottomSheet = ({ data, selected, onSelect, onAlert }) => {
  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ['30%', '60%'], []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      {/*  */}
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>personas</Text>
        {data.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            isSelected={selected?.id === person.id}
            onPress={() => onSelect(person)}
            onAlert={() => onAlert(person)}
          />
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
};

export default CustomBottomSheet;